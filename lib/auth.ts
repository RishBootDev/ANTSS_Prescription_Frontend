"use client"

export type AuthState = {
  isAuthenticated: boolean
}

const AUTH_KEY = "auth_token"
const USER_KEY = "auth_user"

export function getAuthState(): AuthState {
  if (typeof window === "undefined") return { isAuthenticated: false }
  const token = window.localStorage.getItem(AUTH_KEY)
  return { isAuthenticated: Boolean(token) }
}

export function loginUser(username: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(AUTH_KEY, "1")
  window.localStorage.setItem(USER_KEY, username)
}

export function logoutUser() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(AUTH_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(USER_KEY)
}
