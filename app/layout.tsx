'use client'

import React from "react";
import { Amplify } from "aws-amplify";
import { Plus_Jakarta_Sans } from "next/font/google";
import './../app/globals.css';
import { Authenticator } from "@aws-amplify/ui-react";
import { ThemeProvider } from "@/components/theme-provider";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";
import { Shield } from "lucide-react";

Amplify.configure(outputs);

const jakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <html lang="en">
      <body className={`${jakartaSans.className} dotted-background`}>
      <ThemeProvider>
        <Authenticator className="auth-container">
          <div className="flex">
            {/* <SideBarNav /> */}
            <main className="flex-1">
              {children}
            </main>
          </div>
          <footer className="relative mt-10 bg-gray-900 px-4 pt-12">
            <div className="absolute -top-10 left-1/2 h-16 w-16 -translate-x-1/2 rounded-xl border-4 border-gray-200 p-2 bg-blue-900">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <p className="py-6 text-center text-gray-300">© 2024 NexCrypt | All Rights Reserved</p>
        </footer>
        </Authenticator>
      </ThemeProvider>
      </body>
    </html>
    
  );
}
