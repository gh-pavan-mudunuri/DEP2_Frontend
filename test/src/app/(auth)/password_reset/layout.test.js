import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <nav className="fixed top-0 left-0 w-full z-50">
          <div className="flex justify-between items-center px-8 pt-2 bg-white bg-opacity-50">
            <h1 className="text-2xl font-bold" style={{ color: "#b12c00" }}>
              EventSphere
            </h1>
            <ul className="flex gap-6 text-black">
            
            </ul>
           
          </div>        <hr className="h-px my-3 bg-gray-200 border-0 dark:bg-gray-700"></hr>

        </nav>
        <div className="pt-20">{children}</div>
      </>
  );
}
