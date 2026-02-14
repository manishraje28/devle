import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEVLE | The Developer's Word Game",
  description: "A daily technical word guessing game for developers. Guess the 5-letter tech word.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', fontFamily: 'var(--font-heading)' }}>
        {children}
      </body>
    </html>


  );
}
