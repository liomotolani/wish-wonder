import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { MotionProvider, PressFeedback } from "@/app/_components/motion";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Wish & Wonder",
    template: "%s · Wish & Wonder",
  },
  description:
    "The gifts they want. The surprises they deserve. A Christmas wish list for families, friends and colleagues, with secret mystery reveals.",
  applicationName: "Wish & Wonder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-snow font-sans text-ink antialiased">
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                '.reveal-prestart{opacity:1 !important}.flip-number,.flip-number>span{opacity:1 !important;transform:none !important}',
            }}
          />
        </noscript>
        <MotionProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-snow focus:px-5 focus:py-3 focus:font-bold focus:text-pine-900"
          >
            Skip to content
          </a>
          {children}
          <PressFeedback />
        </MotionProvider>
      </body>
    </html>
  );
}
