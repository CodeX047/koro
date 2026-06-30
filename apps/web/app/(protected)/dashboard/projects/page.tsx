import React from "react";
import { FolderKanban, Plus } from "lucide-react";
import { requireAuth } from "~/features/auth/utils/auth";

export default async function ProjectsPage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderKanban className="text-indigo-400 w-6 h-6" />
              Projects
            </h1>
            <p className="text-slate-400 text-xs">
              Manage your code repositories and delivery routes.
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition">
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition cursor-pointer">
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

          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition cursor-pointer">
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
    </div>
  );
}
