import type { Metadata } from "next";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";
import { Lora, Oxanium, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "~/lib/utils";

const jakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

const oxaniumHeading = Oxanium({ subsets: ["latin"], variable: "--font-heading" });

const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Kōro — AI-Powered Product Delivery Platform",
  description:
    "From feature request to shipped software. Kōro guides your team through the complete product lifecycle with AI agents, GitHub integration, and human approval workflows.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans",
        jakartaSans.variable,
        lora.variable,
        oxaniumHeading.variable,
        jetbrainsMono.variable,
      )}
    >
      <body>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
