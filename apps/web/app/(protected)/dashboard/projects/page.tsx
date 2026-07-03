"use client";

import React, { useState, useRef, useEffect } from "react";
import { FolderKanban, Plus, Loader2, MoreVertical, Pencil, Trash } from "lucide-react";
import { trpc } from "~/trpc/client";
import { NewProjectDialog } from "./_components/new-project-dialog";
import { EditProjectDialog } from "./_components/edit-project-dialog";

function ProjectCard({ project, onEdit, onDelete }: { project: any, onEdit: (project: any) => void, onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className="p-4 rounded-sm flex flex-col gap-3 group transition-colors relative"
      style={{ 
        border: "1px solid var(--koro-hairline-strong)",
        backgroundColor: "var(--koro-surface-dark)"
      }}
    >
      <div className="flex justify-between items-start">
        <div className="text-[14px] font-bold group-hover:text-[var(--koro-accent)] transition-colors cursor-pointer pr-4">
          {project.name}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wide" style={{ backgroundColor: "var(--koro-surface-dark-elevated)", color: "var(--koro-success)" }}>
            ACTIVE
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1 rounded-sm transition-colors hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpen && (
              <div 
                className="absolute right-0 top-full mt-1 w-32 rounded-sm shadow-xl z-10 flex flex-col overflow-hidden"
                style={{ 
                  backgroundColor: "var(--koro-surface-dark-elevated)",
                  border: "1px solid var(--koro-hairline-strong)"
                }}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project); }}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] text-left hover:bg-slate-800 transition-colors"
                  style={{ color: "var(--koro-on-primary)" }}
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project.id); }}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] text-left hover:bg-red-950 transition-colors text-red-400"
                >
                  <Trash className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-[12px] leading-relaxed line-clamp-2" style={{ color: "var(--koro-ash)" }}>
        {project.description || "No description provided."}
      </div>
      <div className="text-[10px] mt-2" style={{ color: "var(--koro-ash)", opacity: 0.7 }}>
        Created on {new Date(project.createdAt || "").toLocaleDateString()}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{id: string, name: string, description: string | null} | null>(null);
  
  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.project.list.useQuery();
  
  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
    },
    onError: (err) => {
      console.error("Failed to delete project:", err.message);
      alert("Failed to delete project. Please try again.");
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project? This will also permanently delete all associated features, tasks, and reviews.")) {
      deleteProject.mutate({ id });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 font-sans text-slate-100">
      <div className="flex justify-between items-center pb-4 border-b border-dashed" style={{ borderColor: "var(--koro-hairline-strong)" }}>
        <div>
          <h1 className="text-[14px] font-bold flex items-center gap-2 uppercase tracking-wider" style={{ color: "var(--koro-on-primary)" }}>
            <FolderKanban className="text-[var(--koro-accent)] w-5 h-5" />
            Projects
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "var(--koro-ash)" }}>
            Manage your code repositories and delivery routes.
          </p>
        </div>
        <button 
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-[11px] rounded-sm transition lowercase tracking-normal hover:opacity-90"
          style={{ backgroundColor: "var(--koro-accent)", color: "#fff" }}
        >
          <Plus className="w-3.5 h-3.5" />
          add project
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-[12px] py-8 justify-center" style={{ color: "var(--koro-ash)" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading projects...
        </div>
      ) : projects?.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-sm" style={{ borderColor: "var(--koro-hairline-strong)" }}>
          <FolderKanban className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--koro-ash)" }} />
          <p className="text-[13px] font-bold" style={{ color: "var(--koro-on-primary)" }}>No projects yet</p>
          <p className="text-[11px] mt-1" style={{ color: "var(--koro-ash)" }}>Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onEdit={setEditingProject}
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      {dialogOpen && <NewProjectDialog onClose={() => setDialogOpen(false)} />}
      {editingProject && <EditProjectDialog project={editingProject} onClose={() => setEditingProject(null)} />}
    </div>
  );
}
