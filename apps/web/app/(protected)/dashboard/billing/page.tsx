import React from "react";
import { CreditCard, Check, Sparkles } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="border-b border-slate-900 pb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="text-indigo-400 w-6 h-6" />
            Billing
          </h1>
          <p className="text-slate-400 text-xs">Manage your subscription plans and review usage quotas.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current Usage Quota */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm">Monthly Quota</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>AI Reviews Used</span>
                <span>15 / 20 reviews</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Current plan: <strong className="text-slate-300 font-bold uppercase">Free Tier</strong></span>
              <span>Resets in 8 days</span>
            </div>
          </div>

          {/* Premium Plan Upgrade Card */}
          <div className="relative overflow-hidden bg-slate-950 border border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-indigo-500/5">
            <div className="absolute top-0 right-0 p-3 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Recommended
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-100 text-base">Pro Plan</h3>
                <p className="text-slate-400 text-xs mt-1">For growing teams requiring continuous automated validation.</p>
              </div>

              <div className="text-2xl font-extrabold text-slate-100 mt-2">
                ₹1,499<span className="text-xs text-slate-500 font-normal"> / month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Unlimited AI Pull Request Reviews
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Unlimited Projects & Repositories
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Access to Premium AI Models (Gemini Pro)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Priority Queueing & Dedicated Webhook Processing
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition">
                Upgrade via Razorpay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
