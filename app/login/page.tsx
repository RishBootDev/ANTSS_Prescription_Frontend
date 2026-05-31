"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { loginUser } from "@/lib/auth"

import { Loader2 } from "lucide-react"

const SplineViewer = "spline-viewer" as unknown as React.ComponentType<{
  url: string
  style?: React.CSSProperties
}>

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    // Use Spline web component directly (different runtime than react-spline),
    // which avoids the "end of buffer not reached" crash you were seeing.
    const script = document.createElement("script")
    script.type = "module"
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.12.92/build/spline-viewer.js"
    script.async = true
    script.onload = () => setIsClientReady(true)

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()

    setIsLoggingIn(true)

    await new Promise((r) => setTimeout(r, 1200))

    loginUser(username)

    router.push("/patients")
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] overflow-hidden">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ========================================================= */}
        {/* LEFT SIDE */}
        {/* ========================================================= */}

        <div className="relative overflow-hidden bg-gradient-to-br from-[#fff7f7] via-[#fffafa] to-[#ffe9e9]">
          {/* ambient blur circles */}
          <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-red-400/20 blur-3xl" />

          <div className="absolute bottom-[-120px] right-[-100px] h-[320px] w-[320px] rounded-full bg-red-500/10 blur-3xl" />

          {/* floating particles */}
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            className="absolute top-24 left-20 h-6 w-6 rounded-full bg-[#d11b1b]"
          />

          <motion.div
            animate={{
              y: [0, 20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="absolute right-24 top-40 h-10 w-10 rounded-full border-4 border-[#d11b1b]/50"
          />

          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
            }}
            className="absolute bottom-32 left-24 h-5 w-5 rounded-full bg-red-300"
          />

          {/* spline 3D */}
          <div className="absolute inset-0 overflow-hidden">
            {/* NOTE: loaded only on client to avoid runtime issues during SSR */}
            {isClientReady ? (
                <div className="h-full w-full origin-center scale-[9.0]">
                {React.createElement("spline-viewer", {
                  url: "https://prod.spline.design/33Upo2AwSbgHvQST/scene.splinecode",
                  style: { width: "100%", height: "100%" },
                })}
              </div>
            ) : null}
          </div>

          {/* overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />

          {/* text content */}
          <div className="absolute bottom-16 left-10 z-20 max-w-[650px] lg:left-16">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-[42px] font-semibold leading-[1.05] tracking-[-2px] text-[#2b1111] lg:text-[64px]"
            >
              Access your prescription dashboard.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
              }}
              className="mt-4 text-[18px] font-medium text-[#5f4b4b] lg:text-[22px]"
            >
              Quick, secure, and accurate with ANTSS.
            </motion.p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDE */}
        {/* ========================================================= */}

        <div className="relative flex items-center justify-center overflow-hidden bg-white px-6 py-10 md:px-12">
          {/* background glow */}
          <div className="absolute top-0 right-0 h-[240px] w-[240px] rounded-full bg-red-100 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-[450px]"
          >
            {/* logo */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.6,
                }}
                className="flex items-center gap-3"
              >
                <div className="text-[46px] text-[#a50f0f]">⚕</div>

                <h1 className="text-[54px] font-semibold tracking-[-2px] text-[#a50f0f]">
                  ANTS
                </h1>
              </motion.div>

              <h2 className="mt-6 text-center text-[34px] font-semibold leading-tight text-[#161616]">
                Doctor Prescription Login
              </h2>

              <p className="mt-3 text-center text-[15px] text-[#777]">
                Secure access to prescription services by ANTSS
              </p>
            </div>

            {/* glass card */}
            <Card
              className="
                mt-10
                rounded-[32px]
                border
                border-white/40
                bg-white/80
                p-8
                shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                backdrop-blur-xl
              "
            >
              {/* google button */}
              <Button
                type="button"
                variant="outline"
                className="
                  h-[54px]
                  w-full
                  rounded-xl
                  border
                  border-[#e5e5e5]
                  bg-white
                  text-[15px]
                  font-medium
                  text-[#333]
                  transition-all
                  duration-300
                  hover:scale-[1.01]
                  hover:bg-[#fafafa]
                "
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="google"
                  className="mr-3 h-5 w-5"
                />
                Continue with Google
              </Button>

              {/* divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#e4e4e4]" />

                <span className="text-[13px] text-[#888]">
                  or Sign in with Email
                </span>

                <div className="h-px flex-1 bg-[#e4e4e4]" />
              </div>

              {/* form */}
              <form onSubmit={handleLogin}>
                {/* email */}
                <div>
                  <label className="mb-2 block text-[14px] font-medium text-[#444]">
                    Email
                  </label>

                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="mail@doctor.com"
                    className="
                      h-[56px]
                      rounded-xl
                      border
                      border-[#dddddd]
                      px-4
                      text-[15px]
                      shadow-none
                      transition-all
                      duration-300
                      focus-visible:border-[#b30d0d]
                      focus-visible:ring-4
                      focus-visible:ring-red-100
                    "
                  />
                </div>

                {/* password */}
                <div className="mt-5">
                  <label className="mb-2 block text-[14px] font-medium text-[#444]">
                    Password
                  </label>

                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="
                      h-[56px]
                      rounded-xl
                      border
                      border-[#dddddd]
                      px-4
                      text-[15px]
                      shadow-none
                      transition-all
                      duration-300
                      focus-visible:border-[#b30d0d]
                      focus-visible:ring-4
                      focus-visible:ring-red-100
                    "
                  />
                </div>

                {/* remember */}
                <div className="mt-5 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#666]">
                    <input
                      type="checkbox"
                      className="accent-[#b30d0d]"
                    />
                    Remember Me
                  </label>

                  <button
                    type="button"
                    className="text-[13px] text-[#777] transition hover:text-black"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* login button */}
                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="
                    mt-8
                    h-[56px]
                    w-full
                    rounded-xl
                    bg-gradient-to-r
                    from-[#b30d0d]
                    to-[#d11b1b]
                    text-[16px]
                    font-medium
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:scale-[1.02]
                    hover:from-[#9f0b0b]
                    hover:to-[#c91515]
                  "
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Card>

            {/* footer */}
            <div className="mt-8 text-center text-[14px] text-[#666]">
              Not Registered Yet?{" "}
              <button className="font-medium text-[#a50f0f] hover:underline">
                Create an account
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
