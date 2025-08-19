import Navbar from "@/components/cards/Navbar";
import ApprovedEvents from "@/components/sections/approved-events";

export default function ApprovedEventsPage() {
  return (
    <>
      <Navbar />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Approved Events</h1>
          <ApprovedEvents />
        </div>
      </main>
    </>
  );
}
