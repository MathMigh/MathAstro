import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import "./celestial.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Math, o Mágico",
  description: "Math, o Mágico | Plataforma Astrológica Integral",
  icons: {
    icon: "pisces.png",
  },
  openGraph: {
    title: "Math, o Mágico",
    description: "Math, o Mágico | Plataforma Astrológica Integral",
    url: "https://mathastro.vercel.app/",
    siteName: "Math, o Mágico",
    images: [
      {
        url: "https://mathastro.vercel.app/preview.png",
        width: 1200,
        height: 630,
        alt: "Preview do Math, o Mágico",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Math, o Mágico",
    description: "Math, o Mágico | Plataforma Astrológica Integral",
    images: ["https://mathastro.vercel.app/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
