import ServiceWorkerRegister from "./service-worker-register";
import "./globals.css";

export const metadata = {
  title: "New Town Society",
  description: "Society maintenance, dues, payments, reports, and support.",
  applicationName: "New Town Society",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "New Town Society",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/new-town-icon.svg", type: "image/svg+xml" },
      { url: "/icons/new-town-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/new-town-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/new-town-icon-180.png",
  },
};

export const viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
