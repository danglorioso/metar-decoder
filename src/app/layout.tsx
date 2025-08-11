import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "METAR Decode",
  description: "Decode aviation weather reports with interactive hover translations.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="preload" 
          as="image" 
          href="/aero-chart.webp"
          fetchPriority="high"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var webP = new Image();
                webP.onload = webP.onerror = function () {
                  if (webP.height == 2) {
                    document.documentElement.classList.add('webp');
                  }
                };
                webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-900 antialiased`}
      >
        {/* Header */}
        <div className="flex-shrink-0">
          <Header />
        </div>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <div className="flex-shrink-0">
          <Footer />
        </div>
      
        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
