import React from "react";

interface SwipeableCardProps<T> {
  items: T[];
  render: (item: T, index: number) => React.ReactNode;
}

export default function SwipeableCard<T>({ items, render }: SwipeableCardProps<T>) {
  if (!items || items.length === 0) {
    return <div className="text-gray-500">No events found.</div>;
  }

  // Render all items in a horizontally scrollable flex container, but only one fully visible at a time
  return (
    <div
      className="flex w-full gap-4 overflow-x-auto no-scrollbar px-2 py-2 snap-x snap-mandatory"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {items.map((item, idx) => (
        <div
          className="flex-shrink-0 w-full snap-center"
          key={idx}
          style={{ maxWidth: '100%' }}
        >
          {render(item, idx)}
        </div>
      ))}
    </div>
  );
}