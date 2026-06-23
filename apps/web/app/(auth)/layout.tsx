import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${jetbrainsMono.variable} font-mono bg-[#fdfcfc] text-[#201d1d] min-h-screen flex flex-col antialiased selection:bg-[#201d1d] selection:text-[#fdfcfc]`}
    >
      {/* Primary Nav header */}
      <header className="h-[56px] border-b border-[rgba(15,0,0,0.12)] flex items-center justify-between px-6 bg-[#fdfcfc] shrink-0">
        <div className="flex items-center gap-4">
          <pre className="text-[13px] leading-tight select-none font-bold text-[#201d1d]">
            {`█ █ █▀█ █▀█ █▀█
█▀▄ █▄█ █▀▄ █▄█
▀ ▀ ▀▀▀ ▀ ▀ ▀▀▀`}
          </pre>
        </div>
      </header>

      {/* Main Content Page Container */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative">
        {children}
      </main>

      {/* Footer Section */}
      <footer className="border-t border-[rgba(15,0,0,0.12)] bg-[#fdfcfc] shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 text-[11px] text-[#646262] gap-2">
          <div>© 2026 All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              Terms
            </a>
            <span>·</span>
            <span className="cursor-pointer hover:underline">English ▼</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
