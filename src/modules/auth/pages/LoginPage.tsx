import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import LoginForm from "../components/LoginForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import ResetPasswordForm from "../components/ResetPasswordForm";

type AuthView = "login" | "forgot-password" | "reset-password";

function LoginContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [view, setView] = useState<AuthView>("login");
  const [isClientReady, setIsClientReady] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    if (token) {
      setView("reset-password");
    } else {
      setView("login");
    }
  }, [token]);

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const isAvailable = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setWebglAvailable(isAvailable);
      if (!isAvailable) {
        console.warn("WebGL not supported or disabled. Using high-quality static fallback background.");
        return;
      }
    } catch (e) {
      setWebglAvailable(false);
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@splinetool/viewer@1.12.92/build/spline-viewer.js";
    script.async = true;
    script.onload = () => setIsClientReady(true);

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const showLogin = () => setView("login");
  const showForgotPassword = () => setView("forgot-password");

  return (
    <div className="min-h-screen bg-[#f8f8f8] overflow-hidden">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT SIDE (3D Spline and Branding) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#fff7f7] via-[#fffafa] to-[#ffe9e9]">
          <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-red-400/20 blur-3xl" />
          <div className="absolute bottom-[-120px] right-[-100px] h-[320px] w-[320px] rounded-full bg-red-500/10 blur-3xl" />

          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-24 left-20 h-6 w-6 rounded-full bg-[#d11b1b]"
          />

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute right-24 top-40 h-10 w-10 rounded-full border-4 border-[#d11b1b]/50"
          />

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute bottom-32 left-24 h-5 w-5 rounded-full bg-red-300"
          />

          <div className="absolute inset-0 overflow-hidden">
            {isClientReady && webglAvailable ? (
              <div className="h-full w-full origin-center scale-[9.0]">
                {React.createElement("spline-viewer", {
                  url: "https://prod.spline.design/33Upo2AwSbgHvQST/scene.splinecode",
                  style: { width: "100%", height: "100%" },
                })}
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ffebee] via-[#fff5f5] to-[#fff] flex items-center justify-center">
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 rounded-full bg-red-400/10 animate-ping" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500/10 to-red-600/5 flex items-center justify-center shadow-[0_20px_50px_rgba(239,68,68,0.15)]">
                    <span className="text-[120px] text-[#b30d0d]/30 select-none">⚕</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />

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
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-4 text-[18px] font-medium text-[#5f4b4b] lg:text-[22px]"
            >
              Quick, secure, and accurate with ANTSS.
            </motion.p>
          </div>
        </div>

        {/* RIGHT SIDE (Forms) */}
        <div className="relative flex items-center justify-center overflow-hidden bg-white px-6 py-10 md:px-12">
          <div className="absolute top-0 right-0 h-[240px] w-[240px] rounded-full bg-red-100/50 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-[450px]"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="text-[46px] text-[#a50f0f]">⚕</div>
                <h1 className="text-[54px] font-semibold tracking-[-2px] text-[#a50f0f]">ANTS</h1>
              </motion.div>

              <h2 className="mt-6 text-center text-[34px] font-semibold leading-tight text-[#161616]">
                {view === "login" && "Doctor Login"}
                {view === "forgot-password" && "Reset Password"}
                {view === "reset-password" && "Set New Password"}
              </h2>

              <p className="mt-3 text-center text-[15px] text-[#777]">
                Secure access to prescription services by ANTSS
              </p>
            </div>

            <Card className="mt-10 rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              {view === "login" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[54px] w-full rounded-xl border border-[#e5e5e5] bg-white text-[15px] font-medium text-[#333] transition-all duration-300 hover:scale-[1.01] hover:bg-[#fafafa]"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="google"
                      className="mr-3 h-5 w-5"
                    />
                    Continue with Google
                  </Button>

                  <div className="my-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#e4e4e4]" />
                    <span className="text-[13px] text-[#888]">or Sign in with Email</span>
                    <div className="h-px flex-1 bg-[#e4e4e4]" />
                  </div>

                  <LoginForm onForgotPasswordClick={showForgotPassword} />
                </>
              )}

              {view === "forgot-password" && (
                <ForgotPasswordForm onBackToLogin={showLogin} />
              )}

              {view === "reset-password" && (
                <ResetPasswordForm token={token} onSuccess={showLogin} onCancel={showLogin} />
              )}
            </Card>

            {view === "login" && (
              <div className="mt-8 text-center text-[14px] text-[#666]">
                Not Registered Yet?{" "}
                <button className="font-medium text-[#a50f0f] hover:underline">
                  Create an account
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f8f8] text-neutral-500 font-medium gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#b30d0d]" />
          <span>Loading Prescription Portal...</span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
