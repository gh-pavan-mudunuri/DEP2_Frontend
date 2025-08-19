"use client";
import Footer from "@/components/footer/footer";
import IntroSection from "@/components/sections/intro-section";
import UpcommingEvents from "@/components/sections/upcoming-events";
import TrendingEvents from "@/components/sections/trending-events";
import Image from "next/image";
import { Dancing_Script } from "next/font/google";
import Navbar from "@/components/cards/navbar";

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
      <TrendingEvents />
      <UpcommingEvents />
    </>
  );
}