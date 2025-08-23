"use client";
import Footer from "@/components/footer/footer";
import IntroSection from "@/components/sections/intro-section";
import UpcommingEvents from "@/components/sections/upcoming-events";
import TrendingEvents from "@/components/sections/trending-events";
import Image from "next/image";
import { Dancing_Script } from "next/font/google";
import Navbar from "@/components/cards/Navbar";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
});


export default function Home() {
  const handleSearch = (query: string) => {
    // TODO: Implement search logic
    alert(`Search for: ${query}`);
  };

  return (
    <>
      <IntroSection />
      <div className="flex flex-col gap-8 w-full">
        <UpcommingEvents limit={10} />
        <TrendingEvents limit={10} />
      </div>
    </>
  );
}