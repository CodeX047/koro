"use client";

import React from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Loader2, GitPullRequest, Github, GitCommit, FileText, CheckCircle2, XCircle, MessageSquare, AlertTriangle } from "lucide-react";

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

  const { files, commits, reviewRuns } = prData;
  const latestRun = reviewRuns?.[0] as any;

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
            {prData.reviewStatus && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                prData.reviewStatus === "COMPLETED" ? "bg-blue-500/10 text-blue-400" :
                prData.reviewStatus === "RUNNING" ? "bg-yellow-500/10 text-yellow-400" :
                "bg-slate-500/10 text-slate-400"
              }`}>
                Review: {prData.reviewStatus}
              </span>
            )}
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
          
          {latestRun && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {latestRun.verdict === "APPROVE" ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
                   latestRun.verdict === "REQUEST_CHANGES" ? <XCircle className="w-5 h-5 text-red-400" /> :
                   <MessageSquare className="w-5 h-5 text-yellow-400" />}
                  <h2 className="text-lg font-bold">AI Review Summary</h2>
                </div>
                <div className="text-2xl font-black text-indigo-400">{latestRun.score}<span className="text-sm font-normal text-slate-500">/100</span></div>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-slate-300">{latestRun.scoreBreakdown?.summary || "Review completed."}</p>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-slate-400 mb-1">Correctness</div>
                    <div className="font-bold">{latestRun.scoreBreakdown?.correctness || 0}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-slate-400 mb-1">Requirements</div>
                    <div className="font-bold">{latestRun.scoreBreakdown?.requirements || 0}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-slate-400 mb-1">Security</div>
                    <div className="font-bold">{latestRun.scoreBreakdown?.security || 0}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-slate-400 mb-1">Performance</div>
                    <div className="font-bold">{latestRun.scoreBreakdown?.performance || 0}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-slate-400 mb-1">Maint.</div>
                    <div className="font-bold">{latestRun.scoreBreakdown?.maintainability || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Changed Files ({files.length})
              <span className="ml-4 text-sm font-normal text-slate-400 flex items-center gap-2">
                <span className="text-green-400">+{files.reduce((sum: number, f: any) => sum + (f.additions || 0), 0)}</span>
                <span className="text-red-400">-{files.reduce((sum: number, f: any) => sum + (f.deletions || 0), 0)}</span>
              </span>
            </h2>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
              {files.map((f: any) => (
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
          {reviewRuns && reviewRuns.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-indigo-400" />
                Review History
              </h2>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                {reviewRuns.map((run: any) => (
                  <div key={run.id} className="flex gap-3">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-400/50 ring-4 ring-indigo-400/10" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Attempt {run.attempt}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className={`font-bold ${
                          run.verdict === "APPROVE" ? "text-green-400" :
                          run.verdict === "REQUEST_CHANGES" ? "text-red-400" :
                          "text-yellow-400"
                        }`}>{run.verdict}</span>
                        <span>•</span>
                        <span>Score: {run.score}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400/70">{run.headSha.slice(0, 7)}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-indigo-400" />
              Commits ({commits.length})
            </h2>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              {commits.map((c: any) => (
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
