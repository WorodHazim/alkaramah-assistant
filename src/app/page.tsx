"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, School, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<"teacher" | "management" | null>(null);

  const handleContinue = () => {
    if (role === "teacher") {
      router.push("/teacher/dashboard");
    } else if (role === "management") {
      router.push("/admin/dashboard");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-subtle-gradient p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-[#63AFA5]/10 p-8 text-center border-b border-[#63AFA5]/10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
              <GraduationCap className="h-8 w-8 text-[#63AFA5]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AlKaramahAssistant
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Special Education Platform
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700 text-center mb-4">
                Select your role to continue
              </p>

              <button
                onClick={() => setRole("teacher")}
                className={cn(
                  "w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden",
                  role === "teacher"
                    ? "border-[#63AFA5] bg-[#63AFA5]/5"
                    : "border-slate-100 hover:border-[#63AFA5]/50 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
                  role === "teacher" ? "bg-[#63AFA5] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-[#63AFA5]/10 group-hover:text-[#63AFA5]"
                )}>
                  <User className="h-6 w-6" />
                </div>
                <div className="ml-4 text-left">
                  <span className={cn(
                    "block font-semibold text-lg",
                    role === "teacher" ? "text-[#63AFA5]" : "text-slate-900"
                  )}>
                    Teacher
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Classroom logs & individual plans
                  </span>
                </div>
                {role === "teacher" && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="h-2 w-2 rounded-full bg-[#63AFA5]" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setRole("management")}
                className={cn(
                  "w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden",
                  role === "management"
                    ? "border-[#63AFA5] bg-[#63AFA5]/5"
                    : "border-slate-100 hover:border-[#63AFA5]/50 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
                  role === "management" ? "bg-[#63AFA5] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-[#63AFA5]/10 group-hover:text-[#63AFA5]"
                )}>
                  <School className="h-6 w-6" />
                </div>
                <div className="ml-4 text-left">
                  <span className={cn(
                    "block font-semibold text-lg",
                    role === "management" ? "text-[#63AFA5]" : "text-slate-900"
                  )}>
                    Management
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    School-wide analytics & reports
                  </span>
                </div>
                {role === "management" && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="h-2 w-2 rounded-full bg-[#63AFA5]" />
                  </div>
                )}
              </button>
            </div>

            <button
              onClick={handleContinue}
              disabled={!role}
              className={cn(
                "w-full flex items-center justify-center py-3.5 px-4 rounded-xl font-semibold text-white transition-all shadow-sm",
                role
                  ? "bg-[#63AFA5] hover:bg-[#4A8F86] hover:shadow-md cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              Continue to Dashboard
              {role && <ChevronRight className="ml-2 h-4 w-4" />}
            </button>
          </div>

          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Secured Access • Dubai, UAE
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
