const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "https://api.antss.in" : "");

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

// Queue for pending requests while token is refreshing
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * Generic API request helper that handles headers, tokens, and response parsing.
 */
export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<any> { // Note: Return type any so we can return raw entities or ApiResponse
  const url = `${API_BASE_URL}${path}`;

  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("auth_token");
  }

  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, finalOptions);

    // Token Expiration / Unauthorized Handle
    if (response.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("auth_refresh_token");
      
      // Don't intercept refresh token or login routes
      if (refreshToken && !path.includes("/api/auth/")) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken })
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.success && refreshData.data) {
                const newToken = refreshData.data.accessToken;
                localStorage.setItem("auth_token", newToken);
                localStorage.setItem("auth_refresh_token", refreshData.data.refreshToken);
                isRefreshing = false;
                onRefreshed(newToken);
              } else {
                throw new Error("Refresh response invalid");
              }
            } else {
              throw new Error("Refresh failed");
            }
          } catch (refreshErr) {
            isRefreshing = false;
            refreshSubscribers = [];
            // Auto logout
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_refresh_token");
            localStorage.removeItem("auth_user");
            window.location.href = "/login";
            throw new Error("Session expired. Please login again.");
          }
        }

        // Wait for token to refresh and then retry the request
        const retryWithNewToken = new Promise<string>((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            resolve(newToken);
          });
        });

        const newToken = await retryWithNewToken;
        headers.set("Authorization", `Bearer ${newToken}`);
        finalOptions.headers = headers;
        response = await fetch(url, finalOptions);
      } else if (!path.includes("/api/auth/login")) {
        // No refresh token, force logout
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_refresh_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/login";
        throw new Error("Unauthorized. Please login again.");
      }
    }
    
    // Attempt to parse JSON response
    let json: any;
    try {
      json = await response.json();
    } catch (e) {
      json = null;
    }

    if (!response.ok) {
      // Return custom message from backend if available, otherwise fallback
      const errorMessage = json?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    // Since our backend sometimes returns un-wrapped data (like Patient entity),
    // we return the raw json. If it's wrapped, caller can access .data
    return json;
  } catch (error: any) {
    console.error(`API Request Error [${path}]:`, error);
    throw error;
  }
}

