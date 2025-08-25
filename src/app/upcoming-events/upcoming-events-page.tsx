"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import UpcomingEvents from "@/components/sections/upcoming-events";

export default function UpcomingEventsPage() {
  const searchParams = useSearchParams();
  const searchCategory = searchParams?.get("category") || "";
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // It's good practice to reset the page to 1 if the category changes.
  useEffect(() => {
    setPage(1);
  }, [searchCategory]);

  return (
    <div className="min-h-screen bg-blue-2">
      <div className="flex flex-col items-center bg-blue-2">
        <UpcomingEvents
          disableHorizontalScroll
          searchCategory={searchCategory}
          showBackground
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          setTotalCount={setTotalCount}
        />
        <div className="flex justify-center items-center gap-8 mt-8 mb-8">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="font-semibold text-lg">Page {page} of {totalPages}</span>
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}