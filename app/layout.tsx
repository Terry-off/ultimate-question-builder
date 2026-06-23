import type { Metadata } from "next";
import { siteMetadata } from "@/lib/siteMetadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.url),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.name}`
  },
  description: siteMetadata.description,
  applicationName: siteMetadata.name,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: "/",
    siteName: siteMetadata.name,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: siteMetadata.openGraphImage.path,
        width: siteMetadata.openGraphImage.width,
        height: siteMetadata.openGraphImage.height,
        alt: siteMetadata.openGraphImage.alt
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [
      {
        url: siteMetadata.openGraphImage.path,
        alt: siteMetadata.openGraphImage.alt
      }
    ]
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
