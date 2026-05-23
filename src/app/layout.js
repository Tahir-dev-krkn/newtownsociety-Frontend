import ServiceWorkerRegister from "./service-worker-register";
import "./globals.css";

export const metadata = {
  title: "New Town Society",
  description: "Society maintenance, dues, payments, reports, and support.",
  applicationName: "New Town Society",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "New Town Society",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/new-town-icon.svg",
    apple: "/icons/new-town-icon.svg",
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
