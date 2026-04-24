import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nextbase Feedback",
  description: "Anonymous feedback collection for Nextbase Solutions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
