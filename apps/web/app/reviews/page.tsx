import React from "react";
import { GitPullRequest, Search } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GitPullRequest className="text-indigo-400 w-6 h-6" />
              AI Pull Request Reviews
            </h1>
            <p className="text-slate-400 text-xs">
              Verify alignment of implementation diffs with PRD goals.
            </p>
          </div>
        </header>

        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center text-sm border-b border-slate-900 pb-4">
            <div>
              <h4 className="font-semibold text-slate-200">PR #47: Add Multi-Tenancy Scopes</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Verdict: <span className="text-red-400 font-semibold">FIX_REQUIRED</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                85%
              </span>
              <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-800">
                View Report
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm border-b border-slate-900 pb-4">
            <div>
              <h4 className="font-semibold text-slate-200">
                PR #45: Configure Auth Client Wrapper
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Verdict: <span className="text-emerald-400 font-semibold">PASS</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                96%
              </span>
              <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-800">
                View Report
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div>
              <h4 className="font-semibold text-slate-200">PR #42: Set up Database Connection</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Verdict: <span className="text-emerald-400 font-semibold">PASS</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                92%
              </span>
              <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-800">
                View Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
