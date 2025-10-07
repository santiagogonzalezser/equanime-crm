import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import CRMLayout from "@/components/templates/crm-layout";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EQUÁNIME CRM",
  description: "Modern CRM solution for managing client relationships",
  icons: {
    icon: '/favicon.png',
  },
};

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {user ? (
          <CRMLayout>{children}</CRMLayout>
        ) : (
          <div className="min-h-screen">
            {children}
          </div>
        )}
      </body>
    </html>
  );
}
