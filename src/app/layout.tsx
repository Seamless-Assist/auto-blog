import "./globals.css";
import { ReactNode } from "react";
import ClientAppLayout from "@/components/ClientAppLayout";

export const metadata = {
  title: "Seamless Assist | SEO & Blog Automation Command",
  description: "AI-Powered VA & Operations SEO Content Suite. Google Sheets & Gemini Cloud Edition.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <ClientAppLayout>
          {children}
        </ClientAppLayout>
      </body>
    </html>
  );
}
