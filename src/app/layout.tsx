import type { Metadata } from "next";
import "./globals.css";

// Import directly from your layout components folder
import SiteChrome from "@/components/layout/SiteChrome";
import { NotificationProvider } from "@/context/NotificationContext";
import { NegotiationProvider } from "@/context/NegotiationContext";

export const metadata: Metadata = {
  title: "PortVille Market",
  description: "Modern trading application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* REMOVED: bg-neutral-50, text-neutral-900, dark:bg-neutral-900, dark:text-neutral-50
        ADDED: bg-background text-foreground to sync directly with your dark globals variables!
      */}
      <body className="min-h-screen m-0 p-0 flex flex-col bg-background text-foreground antialiased">
        <NotificationProvider>
          <NegotiationProvider>
            <SiteChrome>{children}</SiteChrome>
          </NegotiationProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}