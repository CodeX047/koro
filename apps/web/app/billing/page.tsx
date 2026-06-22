import React from "react";

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Billing
            </h1>
            <p className="text-slate-400 text-sm">Manage subscriptions and usage credits.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Current Plan</h3>
              <p className="text-2xl font-bold text-slate-100 mt-1">Free Tier</p>
            </div>
            <div className="pt-2">
              <button className="w-full bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-lg text-sm font-semibold transition duration-200">
                Upgrade to Pro
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Usage Credits</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Completions</span>
                <span className="text-slate-400">100 / 100 left</span>
              </div>
              <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                <div className="bg-violet-500 h-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
