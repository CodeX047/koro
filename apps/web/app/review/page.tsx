import React from "react";

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Reviews
            </h1>
            <p className="text-slate-400 text-sm">Review PRs, code changes, and PRD drafts.</p>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <p className="text-slate-400">No active reviews assigned to you at the moment.</p>
        </div>
      </div>
    </div>
  );
}
