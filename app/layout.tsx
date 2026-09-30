
import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title:"Overdrive Reddit Ops",
  description:"Approval inbox for Reddit opportunities for Overdrive — Drive & Explore.",
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>
}
