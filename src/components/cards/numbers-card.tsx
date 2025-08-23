"use client";

import Image from "next/image";
import CountUp from "react-countup";
import React from "react";

// Define the props interface
interface NumbersCardProps {
  title: string;
  number: number;
  icon: string;
  children?: React.ReactNode;
}

export default function NumbersCard({ title, number, icon, children }: NumbersCardProps) {
  return (
    <div className="flex items-center gap-4 p-2 lg:p-4 bg-white shadow-md rounded-xl w-fit border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Text Content */}
      <div className="flex flex-col">
        <span className="text-gray-500 text-sm">{title}</span>
        {children}
        <span className="text-1xl lg:text-2xl font-bold text-gray-900">
          <CountUp end={number} duration={1} separator="," />+
        </span>
      </div>

      {/* Icon */}
      <div className="flex-shrink-0 w-[60px] lg:w-[70px] xl:w-[108px]">
        <img
          src={`/icons/${icon}.png`}
          alt={`${title} Icon`}
          className="rounded-md w-full h-auto"
        />
      </div>
    </div>
  );
}