"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setError("Email is required")
      return false
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const response = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })

      if (response.success) {
        setIsSuccess(true)
        toast.success("Reset link sent successfully!")
      } else {
        toast.error(response.message || "Failed to send reset link")
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 py-4"
      >
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-neutral-900">Check your email</h3>
          <p className="text-sm text-neutral-500 max-w-[340px] mx-auto leading-relaxed">
            We have sent a password reset link to <span className="font-semibold text-neutral-800">{email}</span>. Please check your inbox and spam folder.
          </p>
        </div>

        <Button
          type="button"
          onClick={onBackToLogin}
          className="
            w-full
            h-[54px]
            rounded-xl
            border
            border-neutral-200
            bg-white
            text-sm
            font-medium
            text-neutral-700
            shadow-sm
            hover:bg-neutral-50
            transition
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-neutral-900">Forgot Password?</h3>
        <p className="text-sm text-neutral-500">
          Enter your registered email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError("")
              }}
              placeholder="mail@doctor.com"
              disabled={isSubmitting}
              className={`
                h-[56px]
                pl-12
                pr-4
                rounded-xl
                border
                shadow-none
                transition-all
                duration-300
                focus-visible:ring-4
                ${error
                  ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100"
                  : "border-neutral-200 focus-visible:border-[#b30d0d] focus-visible:ring-red-100"
                }
              `}
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 font-medium pl-1">{error}</p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full
              h-[56px]
              rounded-xl
              bg-gradient-to-r
              from-[#b30d0d]
              to-[#d11b1b]
              text-base
              font-medium
              text-white
              shadow-lg
              shadow-red-500/10
              transition-all
              duration-300
              hover:scale-[1.01]
              hover:from-[#9f0b0b]
              hover:to-[#c91515]
              focus-visible:ring-4
              focus-visible:ring-red-100
            "
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Sending link...</span>
              </div>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onBackToLogin}
            disabled={isSubmitting}
            className="
              w-full
              h-[54px]
              rounded-xl
              text-sm
              font-medium
              text-neutral-600
              hover:text-neutral-900
              hover:bg-neutral-50
              transition
            "
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
