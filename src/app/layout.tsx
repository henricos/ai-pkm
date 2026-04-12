import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { appBrand } from "@/lib/app-brand";
import { buildViewerThemeBootstrapScript } from "@/components/viewer/viewer-theme-contract";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "./fonts/inter-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const excalifont = localFont({
  src: [
    {
      path: "./fonts/Excalifont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-excalidraw",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: appBrand.appName,
    template: `${appBrand.appName} · %s`,
  },
  description: appBrand.appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("font-sans", inter.variable, excalifont.variable)}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: buildViewerThemeBootstrapScript(),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
