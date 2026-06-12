"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResetPasswordForm({ token, onSuccess, onCancel }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({})

  const validate = () => {
    const tempErrors: { newPassword?: string; confirmPassword?: string } = {}
    
    if (!newPassword) {
      tempErrors.newPassword = "New password is required"
    } else if (newPassword.length < 8) {
      tempErrors.newPassword = "Password must be at least 8 characters"
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = "Please confirm your password"
    } else if (confirmPassword !== newPassword) {
      tempErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (!token) {
      toast.error("Reset token is missing. Please request a new link.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      })

      if (response.success) {
        setIsSuccess(true)
        toast.success("Password reset successfully!")
      } else {
        toast.error(response.message || "Failed to reset password")
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please check your reset link.")
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
          <h3 className="text-2xl font-semibold text-neutral-900">Password Reset Complete</h3>
          <p className="text-sm text-neutral-500 max-w-[340px] mx-auto leading-relaxed">
            Your password has been updated successfully. You can now use your new password to log in.
          </p>
        </div>

        <Button
          type="button"
          onClick={onSuccess}
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
          "
        >
          Go to Login
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-neutral-900">Reset Password</h3>
        <p className="text-sm text-neutral-500">
          Enter a new, strong password for your account. It must be at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <Input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }))
              }}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`
                h-[56px]
                pl-12
                pr-12
                rounded-xl
                border
                shadow-none
                transition-all
                duration-300
                focus-visible:ring-4
                ${errors.newPassword
                  ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100"
                  : "border-neutral-200 focus-visible:border-[#b30d0d] focus-visible:ring-red-100"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500 font-medium pl-1">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`
                h-[56px]
                pl-12
                pr-12
                rounded-xl
                border
                shadow-none
                transition-all
                duration-300
                focus-visible:ring-4
                ${errors.confirmPassword
                  ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100"
                  : "border-neutral-200 focus-visible:border-[#b30d0d] focus-visible:ring-red-100"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 font-medium pl-1">{errors.confirmPassword}</p>
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
                <span>Resetting...</span>
              </div>
            ) : (
              "Reset Password"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
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
