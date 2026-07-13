"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus, Loader2, MoreVertical, Pencil, Trash } from "lucide-react";
import { trpc } from "~/trpc/client";
import { NewProjectDialog } from "./_components/new-project-dialog";
import { EditProjectDialog } from "./_components/edit-project-dialog";

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: any;
  onEdit: (project: any) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
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
      onClick={() => router.push(`/dashboard/projects/${project.id}/settings`)}
      className="p-5 flex flex-col gap-4 group transition-all cursor-pointer bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl hover:border-[var(--koro-hairline-stronger)] shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div className="text-base font-semibold text-[var(--koro-on-primary)] group-hover:text-[var(--koro-accent)] transition-colors pr-4">
          {project.name}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase bg-green-500/10 text-green-500 border border-green-500/20">
            ACTIVE
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded-md transition-colors hover:bg-[var(--koro-surface-dark)] text-[var(--koro-ash)] hover:text-[var(--koro-on-primary)]"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 rounded-lg shadow-xl z-10 flex flex-col overflow-hidden bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(project);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[var(--koro-surface-dark-elevated)] transition-colors text-[var(--koro-on-primary)]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(project.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-red-500/10 transition-colors text-red-400"
                >
                  <Trash className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-sm leading-relaxed line-clamp-2 text-[var(--koro-ash)]">
        {project.description || "No description provided."}
      </div>
      <div className="text-xs mt-1 text-[var(--koro-ash)] opacity-70">
        Created on{" "}
        {new Date(project.createdAt || "").toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{
    id: string;
    name: string;
    description: string | null;
  } | null>(null);

  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.project.list.useQuery();

  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
    },
    onError: (err) => {
      console.error("Failed to delete project:", err.message);
      alert("Failed to delete project. Please try again.");
    },
  });

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this project? This will also permanently delete all associated features, tasks, and reviews.",
      )
    ) {
      deleteProject.mutate({ id });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[var(--koro-hairline-strong)]">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--koro-on-primary)] flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-[var(--koro-accent)]" />
            Projects
          </h1>
          <p className="text-[var(--koro-ash)] mt-2 text-sm max-w-2xl">
            Organize your repositories and features. Create projects to manage your workflows and
            deployments.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg bg-[var(--koro-accent)] hover:opacity-90 text-black transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[var(--koro-surface-dark-elevated)] border border-[var(--koro-hairline-strong)] rounded-xl">
          <Loader2 className="w-8 h-8 text-[var(--koro-accent)] animate-spin mb-4" />
          <p className="text-[var(--koro-ash)] text-sm">Loading your projects...</p>
        </div>
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-[var(--koro-hairline-strong)] rounded-xl bg-[var(--koro-surface-dark-elevated)]">
          <FolderKanban className="w-12 h-12 text-[var(--koro-ash)] opacity-50 mb-4" />
          <h3 className="text-lg font-medium text-[var(--koro-on-primary)] mb-2">
            No projects found
          </h3>
          <p className="text-[var(--koro-ash)] text-sm max-w-sm mb-6">
            Get started by creating your first project to organize your repositories.
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg bg-[var(--koro-surface-dark)] border border-[var(--koro-hairline-strong)] hover:border-[var(--koro-hairline-stronger)] text-[var(--koro-on-primary)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects?.map((project) => (
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
      {editingProject && (
        <EditProjectDialog project={editingProject} onClose={() => setEditingProject(null)} />
      )}
    </div>
  );
}
