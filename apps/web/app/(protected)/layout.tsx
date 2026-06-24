import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen w-full font-sans"
      style={{ 
        backgroundColor: "var(--koro-surface-dark)", 
        color: "var(--koro-on-primary)" 
      }}
    >
      {children}
    </div>
  );
}
