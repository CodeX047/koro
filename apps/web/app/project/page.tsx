import React from "react";

export default function ProjectPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-slate-400 text-sm">Track progress, milestones, and issues.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-100">Koro Core</h3>
            <p className="text-slate-400 text-sm mt-1">Main monorepo for the Koro platform.</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs bg-violet-500/10 text-violet-400 px-2.5 py-1 rounded-full border border-violet-500/20">
                Active
              </span>
              <span className="text-xs text-slate-500">Updated 2h ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
