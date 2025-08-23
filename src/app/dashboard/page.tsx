

"use client";
import { useState, useEffect } from "react";
import Footer from "@/components/footer/footer";
import IntroSection from "@/components/sections/intro-section";
import TrendingEvents from "@/components/sections/trending-events";
import UpcommingEvents from "@/components/sections/upcoming-events";
import Image from "next/image";
import Navbar from "@/components/cards/Navbar";


export default function Home() {

    
     

  const handleSearch = (query: string) => {
    // TODO: Implement search logic
    alert(`Search for: ${query}`);
  };

  return (
    <>
      <IntroSection />
      <div className="flex flex-col gap-8 w-full">
        <UpcommingEvents />
        <TrendingEvents />
      </div>
    </>
  );
}