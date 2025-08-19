import Navbar from "@/components/cards/Navbar";
import UnapprovedEvents from "@/components/sections/unapproved-events";
import { usePathname } from "next/navigation";

export default function AdminDashboard() {
  // This ensures the Navbar treats this as a dashboard page (for profile icon/side panel)
  if (typeof window !== "undefined") {
    // Patch the pathname to start with /dashboard for Navbar logic
    Object.defineProperty(window, 'location', {
      value: new Proxy(window.location, {
        get(target, prop: string | symbol) {
          if (prop === 'pathname') return '/dashboard/admin';
          return target[prop as keyof Location];
        }
      })
    });
  }

  return (
    <>
      <Navbar />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Unapproved Events</h1>
          <UnapprovedEvents />
        </div>
      </main>
    </>
  );
}
