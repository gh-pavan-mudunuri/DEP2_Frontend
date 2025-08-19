"use client";
import OrganizerEventIncome from "@/components/organizer-event-income";

export default function OrganizerDashboardCreated() {
	// Handler for viewing payments for a specific event
	const handleSelectEvent = (eventId: number) => {
		// You can route to a payments page or show a modal here
		// For now, just log
		console.log("Selected event for payments:", eventId);
	};

	return (
		<div className="max-w-7xl mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">My Events Income</h1>
			<OrganizerEventIncome onSelectEvent={handleSelectEvent} />
		</div>
	);
}
