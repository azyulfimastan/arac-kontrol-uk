import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "UK Car Check | Ahmet Kula", description: "UK vehicle check: MOT history, mileage and risk score. Designed by Ahmet Kula." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0f1a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
