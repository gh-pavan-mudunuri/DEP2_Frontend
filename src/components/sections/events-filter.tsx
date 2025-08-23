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

export default function EventsFilters({
  filters,
  onChange,
  categories,
  eventTypes,
  locations,
  paidOptions,
  onlineOptions,
  onClearFilters,
}: EventsFiltersProps) {
  // Theme colors
  const navy = "#0a174e";
  const filterBase = `border-2 border-[${navy}] bg-transparent text-[${navy}] rounded-lg px-4 py-2 text-sm shadow focus:outline-none transition-all duration-150`;
  const filterHover = `hover:bg-[#e3eafc]`;
  const filterActive = `bg-[#e3eafc] text-[${navy}] border-[${navy}]`;
  const filterClass = `${filterBase} ${filterHover}`;
  const filterInputClass = `${filterBase} ${filterHover}`;
  const clearBase = `border-2 border-[#e53e3e] text-[#e53e3e] bg-transparent rounded-lg px-4 py-2 text-sm font-semibold shadow focus:outline-none transition-all duration-150`;
  const clearHover = `hover:bg-[#e53e3e] hover:text-white`;
  const clearClass = `${clearBase} ${clearHover}`;

  // Helper to determine active style
  const isActive = (val: string | null | undefined) => val && val !== "";

  return (
    <div className="relative flex flex-wrap gap-4 mb-4 items-center justify-center bg-transparent p-4 rounded-xl">
      {/* Location Filter (hidden if online is selected) */}
      {filters.online !== true &&
        (locations && locations.length > 0 ? (
          <select
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className={`${filterClass} ${
              isActive(filters.location) ? filterActive : ""
            }`}
          >
            <option value="">Location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => onChange({ location: String(e.target.value) })}
            className={`${filterInputClass} ${
              isActive(filters.location) ? filterActive : ""
            }`}
          />
        ))}

      {/* Online/Offline Filter */}
      {onlineOptions && onlineOptions.length > 0 ? (
        <select
          value={
            filters.online === null ? "" : filters.online ? "online" : "offline"
          }
          onChange={(e) => {
            const val = e.target.value;
            if (val === "online" || val === "offline") {
              onChange({ online: val === "online", eventType: val });
            } else {
              onChange({ online: null, eventType: "" });
            }
          }}
          className={`${filterClass} ${
            isActive(
              filters.online ? "online" : filters.online === false ? "offline" : ""
            )
              ? filterActive
              : ""
          }`}
        >
          <option value="">Online/Offline</option>
          {onlineOptions.map((opt) => (
            <option key={opt} value={opt.toLowerCase()}>
              {opt}
            </option>
          ))}
        </select>
      ) : null}

      {/* Free/Paid Filter */}
      {paidOptions && paidOptions.length > 0 ? (
        <select
          value={filters.paid || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "paid" || val === "free") {
              // Send as 'price' to match backend API
              onChange({ price: val, paid: val });
            } else {
              onChange({ price: null, paid: null });
            }
          }}
          className={`${filterClass} ${
            isActive(filters.paid) ? filterActive : ""
          }`}
        >
          <option value="">free/paid</option>
          <option value="free">free</option>
          <option value="paid">paid</option>
        </select>
      ) : null}

      {/* Category Filter */}
      <select
        value={filters.category}
        onChange={(e) => {
          console.log("EventsFilters onChange called: category", e.target.value);
          onChange({ category: e.target.value });
        }}
        className={`${filterClass} ${
          isActive(filters.category) ? filterActive : ""
        }`}
      >
        <option value="">Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Event Type Filter */}
      {eventTypes && eventTypes.length > 0 && (
        <select
          value={filters.eventType || ""}
          onChange={(e) => {
            console.log("EventsFilters onChange called: eventType", e.target.value);
            onChange({ eventType: e.target.value });
          }}
          className={`${filterClass} ${
            isActive(filters.eventType) ? filterActive : ""
          }`}
        >
          <option value="">Event Type</option>
          {eventTypes &&
            eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>
      )}

      {/* Recurrence Type Filter */}
      <select
        value={filters.recurrence}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "onetime" || val === "multiple") {
            onChange({ recurrence: val, recurrenceType: val });
          } else {
            onChange({ recurrence: "", recurrenceType: "" });
          }
        }}
        className={`${filterClass} ${
          isActive(filters.recurrence) ? filterActive : ""
        }`}
      >
        <option value="">Recurrence Type</option>
        <option value="onetime">onetime</option>
        <option value="multiple">multiple</option>
      </select>
      
      {onClearFilters && (
        <button type="button" onClick={onClearFilters} className={clearClass}>
          Clear Filters
        </button>
      )}
    </div>
  );
}