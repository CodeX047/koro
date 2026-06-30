import React from "react";
import { requireAuth } from "~/features/auth/utils/auth";

export default async function WorkspacePage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Workspaces
            </h1>
            <p className="text-slate-400 text-sm">Manage your team and project spaces.</p>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <p className="text-slate-400">Select a workspace or create a new one to get started.</p>
          <button className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition duration-200">
            Create Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
