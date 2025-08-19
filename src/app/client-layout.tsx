"use client";
import Navbar from "../components/cards/Navbar";
import Footer from "../components/footer/footer";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <Navbar />
  <main className="flex-1 pt-0 sm:pt-0">{children}</main>
      <Footer />
    </>
  );
}
