"use client";

import React, { useState } from "react";
import { FolderKanban, Plus, Loader2 } from "lucide-react";
import { trpc } from "~/trpc/client";
import { NewProjectDialog } from "./_components/new-project-dialog";

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: projects, isLoading } = trpc.project.list.useQuery();

  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderKanban className="text-indigo-400 w-6 h-6" />
              Projects
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Manage your code repositories and delivery routes.
            </p>
          </div>
          <button 
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </header>

        {isLoading ? (
          <div className="flex items-center gap-2 text-xs py-8 justify-center text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading projects...
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="w-8 h-8 mx-auto mb-3 text-slate-500" />
            <p className="text-xs font-medium text-slate-300">No projects yet</p>
            <p className="text-[11px] mt-1 text-slate-500">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects?.map(project => (
              <div key={project.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition cursor-pointer">
                <h3 className="font-bold text-slate-200">{project.name}</h3>
                <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">
                  {project.description || "No description provided."}
                </p>
                <div className="flex justify-between items-center mt-5 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-semibold uppercase tracking-wider">
                    Active
                  </span>
                  <span>Updated recently</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dialogOpen && <NewProjectDialog onClose={() => setDialogOpen(false)} />}
    </div>
  );
}
