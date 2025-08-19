import type { Metadata } from "next";

import Navbar from "../../../components/cards/navbar";
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
      <div className="mt-10 mb-10">{children}</div>
    </>
  );
}
