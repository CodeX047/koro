import { Nav } from "./_components/nav";
import { Footer } from "./_components/footer";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="koro-landing font-[family-name:var(--font-mono)] antialiased selection:bg-[var(--koro-ink)] selection:text-[var(--koro-canvas)]"
      style={{
        backgroundColor: "var(--koro-canvas)",
        color: "var(--koro-ink)",
      }}
    >
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
