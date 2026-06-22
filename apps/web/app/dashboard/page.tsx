import React from "react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-400 text-sm">Welcome back to Koro.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition duration-200">
            <h3 className="text-slate-400 text-sm font-medium">Workspaces</h3>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition duration-200">
            <h3 className="text-slate-400 text-sm font-medium">Active Projects</h3>
            <p className="text-3xl font-bold mt-2">8</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition duration-200">
            <h3 className="text-slate-400 text-sm font-medium">Open Reviews</h3>
            <p className="text-3xl font-bold mt-2">5</p>
          </div>
        </div>
      </div>
    </div>
  );
}
