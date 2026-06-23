import React from "react";
import { FileCheck, Sparkles, Plus } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileCheck className="text-indigo-400 w-6 h-6" />
              Feature Requests
            </h1>
            <p className="text-slate-400 text-xs">
              Clarify requirements and generate engineering PRDs using AI.
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition">
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </header>

        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-start border-b border-slate-900 pb-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-200">Organization Swapper</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Better Auth scoping integration for multi-tenant organizations.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 bg-purple-500/10 text-purple-400 rounded-full font-bold uppercase">
              PRD Ready
            </span>
          </div>

          <div className="flex justify-between items-start border-b border-slate-900 pb-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-200">AI Code Reviewer</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Parse Pull Request diffs automatically and comment line-by-line.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-bold uppercase">
              In Progress
            </span>
          </div>

          <div className="flex justify-between items-start text-sm">
            <div>
              <h4 className="font-semibold text-slate-200">Razorpay Webhooks</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Handle subscriptions for Pro Tier and send billing statements.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold uppercase">
              Shipped
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
