import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiClient } from "@/src/services/axios";
import { useAuthStore } from "@/src/store/authStore";

interface LoginFormProps {
  onForgotPasswordClick: () => void;
}

export default function LoginForm({ onForgotPasswordClick }: LoginFormProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const tempErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 4) {
      tempErrors.password = "Password must be at least 4 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const deviceInfo = typeof window !== "undefined" ? window.navigator.userAgent : "Web Browser";

      const response: any = await apiClient.post("/api/auth/login", {
        email,
        password,
        deviceInfo,
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        login(user, accessToken, refreshToken);
        toast.success("Login successful! Redirecting...");
        router.push("/patients");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">Email Address</label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="mail@doctor.com"
            disabled={isSubmitting}
            className={`h-[56px] pl-12 pr-4 rounded-xl border shadow-none transition-all duration-300 focus-visible:ring-4 ${
              errors.email
                ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100"
                : "border-neutral-200 focus-visible:border-[#b30d0d] focus-visible:ring-red-100"
            }`}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="••••••••"
            disabled={isSubmitting}
            className={`h-[56px] pl-12 pr-12 rounded-xl border shadow-none transition-all duration-300 focus-visible:ring-4 ${
              errors.password
                ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100"
                : "border-neutral-200 focus-visible:border-[#b30d0d] focus-visible:ring-red-100"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 font-medium pl-1">{errors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-600 select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300 text-[#b30d0d] focus:ring-[#b30d0d] accent-[#b30d0d]"
          />
          Remember Me
        </label>

        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="text-xs font-semibold text-neutral-600 hover:text-[#b30d0d] transition"
        >
          Forgot Password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-[56px] mt-4 rounded-xl bg-gradient-to-r from-[#b30d0d] to-[#d11b1b] text-base font-medium text-white shadow-lg shadow-red-500/10 transition-all duration-300 hover:scale-[1.01] hover:from-[#9f0b0b] hover:to-[#c91515] focus-visible:ring-4 focus-visible:ring-red-100"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Logging in...</span>
          </div>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
}
