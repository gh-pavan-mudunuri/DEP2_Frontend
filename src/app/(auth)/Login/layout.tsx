import type { Metadata } from "next";

import Navbar from "../../../components/cards/Navbar";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: "EventSphere",
  description: "A Digital Event Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="mt-29 mb-20">{children}</div>
    </>
  );
}
