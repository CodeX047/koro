"use client";

import React from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Loader2, GitPullRequest, Github, GitCommit, FileText } from "lucide-react";

export default function PRDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: prData, isLoading } = trpc.pullRequest.details.useQuery({ prId: id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!prData) {
    return (
      <div className="p-8 text-center text-red-500">
        PR not found.
      </div>
    );
  }

  const { files, commits } = prData;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans text-slate-200">
      <div className="flex items-start justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{prData.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              prData.status === "OPENED" ? "bg-green-500/10 text-green-400" :
              prData.status === "MERGED" ? "bg-purple-500/10 text-purple-400" :
              "bg-slate-500/10 text-slate-400"
            }`}>
              {prData.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-4">
            <a href={prData.url || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-200 transition">
              <Github className="w-4 h-4" />
              #{prData.prNumber} in {prData.repoFullName}
            </a>
            <span>by {prData.authorLogin}</span>
            <span>Base: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-xs">{prData.baseBranch}</code></span>
            <span>Head: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-xs">{prData.headBranch}</code></span>
          </p>
        </div>
        <a 
          href={prData.url || undefined}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition"
        >
          <GitPullRequest className="w-4 h-4" />
          View on GitHub
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Changed Files ({files.length})
            </h2>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
              {files.map(f => (
                <div key={f.id} className="p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <span className={`w-2 h-2 rounded-full ${
                      f.status === "added" ? "bg-green-400" :
                      f.status === "removed" ? "bg-red-400" :
                      f.status === "modified" ? "bg-yellow-400" : "bg-slate-400"
                    }`} />
                    {f.filename}
                  </div>
                  {f.patch && (
                    <pre className="text-[10px] md:text-xs font-mono bg-slate-900 p-3 rounded-lg overflow-x-auto text-slate-400 border border-slate-800">
                      {f.patch}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-indigo-400" />
              Commits ({commits.length})
            </h2>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              {commits.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="mt-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-400/50 ring-4 ring-indigo-400/10" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{c.message.split("\n")[0]}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400/70">{c.sha.slice(0, 7)}</code>
                      <span>{c.author}</span>
                      <span>{c.timestamp ? new Date(c.timestamp).toLocaleString() : ""}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
