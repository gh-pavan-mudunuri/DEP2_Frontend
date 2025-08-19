import React from "react";


interface EventsFiltersProps {
  filters: {
    location: string;
    online: boolean | null;
    paid: "paid" | "free" | null;
    price?: "paid" | "free" | null;
    category: string;
    recurrence: string;
    recurrenceType?: string;
    eventType?: string;
  };
  onChange: (filters: Partial<EventsFiltersProps["filters"]>) => void;
  categories: string[];
  eventTypes?: string[];
  locations?: string[];
  paidOptions?: string[];
  onlineOptions?: string[];
  onClearFilters?: () => void;
}


export default function EventsFilters({ filters, onChange, categories, eventTypes, locations, paidOptions, onlineOptions, onClearFilters }: EventsFiltersProps) {
  return (
    <div className="relative flex flex-wrap gap-4 mb-4 items-center justify-center bg-white p-4 rounded-xl">
      
      {/* Location Filter (hidden if online is selected) */}
      {filters.online !== true && (
        locations && locations.length > 0 ? (
          <select
            value={filters.location}
            onChange={e => onChange({ location: e.target.value })}
            className="border-2 border-blue-300 bg-blue-50 rounded-lg px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 hover:border-blue-500 hover:bg-blue-100"
          >
            <option value="">Location</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={e => onChange({ location: e.target.value })}
            className="border-2 border-blue-300 bg-blue-50 rounded-lg px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 hover:border-blue-500 hover:bg-blue-100"
          />
        )
      )}

      {/* Online/Offline Filter */}
      {onlineOptions && onlineOptions.length > 0 ? (
        <select
          value={filters.online === null ? "" : filters.online ? "online" : "offline"}
          onChange={e => {
            const val = e.target.value;
            if (val === "online" || val === "offline") {
              onChange({ online: val === "online", eventType: val });
            } else {
              onChange({ online: null, eventType: "" });
            }
          }}
          className="border-2 border-green-300 bg-green-50 rounded-lg px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-150 hover:border-green-500 hover:bg-green-100"
        >
          <option value="">Online/Offline</option>
          {onlineOptions.map(opt => (
            <option key={opt} value={opt.toLowerCase()}>{opt}</option>
          ))}
        </select>
      ) : null}

      {/* Free/Paid Filter */}
      {paidOptions && paidOptions.length > 0 ? (
        <select
          value={filters.paid || ""}
          onChange={e => {
            const val = e.target.value;
            if (val === "paid" || val === "free") {
              // Send as 'price' to match backend API
              onChange({ price: val, paid: val });
            } else {
              onChange({ price: null, paid: null });
            }
          }}
          className="border-2 border-yellow-300 bg-yellow-50 rounded-lg px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-150 hover:border-yellow-500 hover:bg-yellow-100"
        >
          <option value="">free/paid</option>
          <option value="free">free</option>
          <option value="paid">paid</option>
        </select>
      ) : null}

      {/* Category Filter */}
      <select
        value={filters.category}
          onChange={e => {
            console.log("EventsFilters onChange called: category", e.target.value);
            onChange({ category: e.target.value });
          }}
        className="border-2 border-purple-300 bg-purple-50 rounded-lg px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-150 hover:border-purple-500 hover:bg-purple-100"
      >
        <option value="">Category</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Event Type Filter */}
      {eventTypes && eventTypes.length > 0 && (
        <select
          value={filters.eventType || ""}
          onChange={e => {
            console.log("EventsFilters onChange called: eventType", e.target.value);
            onChange({ eventType: e.target.value });
          }}
          className="border-2 border-pink-300 bg-pink-50 rounded-lg px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-150 hover:border-pink-500 hover:bg-pink-100"
        >
          <option value="">Event Type</option>
          {eventTypes && eventTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      )}

      {/* Recurrence Type Filter */}
      <select
        value={filters.recurrence}
        onChange={e => {
          const val = e.target.value;
          if (val === "onetime" || val === "multiple") {
            onChange({ recurrence: val, recurrenceType: val });
          } else {
            onChange({ recurrence: "", recurrenceType: "" });
          }
        }}
        className="border-2 border-indigo-300 bg-indigo-50 rounded-lg px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 hover:border-indigo-500 hover:bg-indigo-100"
      >
        <option value="">Recurrence Type</option>
        <option value="onetime">onetime</option>
        <option value="multiple">multiple</option>
      </select>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="border-2 border-red-300 bg-red-50 text-red-700 rounded-lg px-4 py-2 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-150 hover:border-red-500 hover:bg-red-100"
          >
            Clear Filters
          </button>
        )}
    </div>
  );
}
