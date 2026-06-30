import React from "react";
import { Settings, Shield, User, Building2 } from "lucide-react";
import { requireAuth } from "~/features/auth/utils/auth";

export default async function SettingsPage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="border-b border-slate-900 pb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="text-indigo-400 w-6 h-6" />
            Settings
          </h1>
          <p className="text-slate-400 text-xs">
            Configure your user profile, organizations, and integration credentials.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navigation links */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl text-sm font-semibold text-slate-200 transition text-left">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Organization Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-950/40 border border-transparent hover:border-slate-900 rounded-xl text-sm font-semibold text-slate-400 transition text-left">
              <User className="w-4 h-4" />
              Profile Details
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-950/40 border border-transparent hover:border-slate-900 rounded-xl text-sm font-semibold text-slate-400 transition text-left">
              <Shield className="w-4 h-4" />
              Security & Credentials
            </button>
          </div>

          {/* Configuration Form Stub */}
          <div className="md:col-span-2 bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-slate-200 text-sm">Organization Details</h3>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-semibold uppercase">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue="Kōro Engineering"
                  className="bg-[#090b11] border border-slate-900 text-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-semibold uppercase">Slug</label>
                <input
                  type="text"
                  defaultValue="koro-engineering"
                  className="bg-[#090b11] border border-slate-900 text-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
