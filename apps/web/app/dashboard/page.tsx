import React from "react";
import {
  Building2,
  GitBranch,
  Sparkles,
  Layers,
  FileCheck,
  Zap,
  GitPullRequest,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 p-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-900 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Kōro (航路)
            </h1>
            <p className="text-slate-400 text-sm mt-1">AI-Powered Product Delivery Platform</p>
          </div>

          {/* Active Organization Selector Widget */}
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-900 px-4 py-2.5 rounded-xl shadow-md hover:border-slate-800 transition">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div className="text-left">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Active Organization
              </p>
              <select className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer pr-4">
                <option value="org-1">Kōro Engineering</option>
                <option value="org-2">Acme Corp</option>
                <option value="org-3">Personal Sandbox</option>
              </select>
            </div>
          </div>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Usage Card */}
          <div className="relative overflow-hidden bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-sm hover:border-slate-800 transition duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">AI Usage (This Month)</p>
                <p className="text-3xl font-bold mt-2">15 / 20</p>
              </div>
              <span className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="w-full bg-slate-900 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 text-right font-medium">
                75% limit reached (Reset in 8 days)
              </p>
            </div>
          </div>

          {/* GitHub Integration Status */}
          <div className="relative overflow-hidden bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-sm hover:border-slate-800 transition duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">GitHub Status</p>
                <p className="text-lg font-bold mt-2.5 flex items-center gap-2 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected
                </p>
              </div>
              <span className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <GitBranch className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-5 font-medium">
              Syncing with repo: <span className="text-slate-300 font-mono">repo/koro</span>
            </p>
          </div>

          {/* Platform Performance / System Status */}
          <div className="relative overflow-hidden bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-sm hover:border-slate-800 transition duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">Review Readiness Score</p>
                <p className="text-3xl font-bold mt-2">85%</p>
              </div>
              <span className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                <Zap className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-5 font-medium">
              Target average standard: <span className="text-slate-300 font-semibold">90%</span>
            </p>
          </div>
        </div>

        {/* Projects section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Projects
            </h2>
            <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
              + New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 hover:bg-[#0c0f17] transition duration-200 cursor-pointer">
              <h3 className="font-bold text-slate-200">Kōro Web App</h3>
              <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">
                Main Next.js product planning dashboard and AI review integrations.
              </p>
              <div className="flex justify-between items-center mt-5 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-semibold uppercase tracking-wider">
                  Active
                </span>
                <span>Updated 2 hours ago</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 hover:bg-[#0c0f17] transition duration-200 cursor-pointer">
              <h3 className="font-bold text-slate-200">Kōro Core API</h3>
              <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">
                Go back-end APIs, database migration management, and LLM integrations.
              </p>
              <div className="flex justify-between items-center mt-5 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-semibold uppercase tracking-wider">
                  Active
                </span>
                <span>Updated 1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features and Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Features */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-sm">
            <h2 className="text-md font-bold text-slate-200 border-b border-slate-900 pb-3 mb-4 flex items-center gap-2">
              <FileCheck className="w-4.5 h-4.5 text-indigo-400" />
              Recent Features
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-start text-sm">
                <div>
                  <h4 className="font-semibold text-slate-200">Organization Swapper</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Better Auth scoping integration</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full font-bold uppercase">
                  PRD Ready
                </span>
              </div>

              <div className="flex justify-between items-start text-sm">
                <div>
                  <h4 className="font-semibold text-slate-200">AI Code Reviewer</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Parse Pull Request diffs automatically
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-bold uppercase">
                  In Progress
                </span>
              </div>

              <div className="flex justify-between items-start text-sm">
                <div>
                  <h4 className="font-semibold text-slate-200">Razorpay Webhooks</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Handle subscriptions for Pro Tier</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold uppercase">
                  Shipped
                </span>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-sm">
            <h2 className="text-md font-bold text-slate-200 border-b border-slate-900 pb-3 mb-4 flex items-center gap-2">
              <GitPullRequest className="w-4.5 h-4.5 text-indigo-400" />
              Recent Reviews
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <h4 className="font-semibold text-slate-200">PR #47: Add Multi-Tenancy Scopes</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verdict: <span className="text-red-400 font-semibold">FIX_REQUIRED</span>
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                  85%
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div>
                  <h4 className="font-semibold text-slate-200">
                    PR #45: Configure Auth Client Wrapper
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verdict: <span className="text-emerald-400 font-semibold">PASS</span>
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  96%
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div>
                  <h4 className="font-semibold text-slate-200">
                    PR #42: Set up Database Connection
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verdict: <span className="text-emerald-400 font-semibold">PASS</span>
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  92%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
