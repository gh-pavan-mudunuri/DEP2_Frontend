"use client";
import { JSX, useEffect, useState } from "react";
import axios from "axios";
import EventCard from "@/components/cards/event-card";
import PopupMessage from "@/components/common/popup-message";
import ConfirmationDialog from "@/components/common/confirmation-dialog";
import { EventInterface } from "@/interfaces/home";

interface PopupMessageState {
  message: string;
  type?: "success" | "error" | "info";
}

interface ConfirmDialogState {
  open: boolean;
  eventId: string | number | null;
}

export default function MyEventsPage(): JSX.Element {
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [popup, setPopup] = useState<PopupMessageState | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const fetchMyEvents = async (): Promise<void> => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");
        let userId: string | number | null = null;

        if (userRaw) {
          try {
            const userObj = JSON.parse(userRaw);
            userId =
              userObj.userId ??
              userObj.id ??
              userObj.UserId ??
              userObj.Id ??
              null;
          } catch {
            // ignore parsing errors
          }
        }

        if (!userId) {
          setError("User ID not found. Please log in again.");
          setEvents([]);
          setLoading(false);
          return;
        }

        const res = await axios.post<EventInterface[]>(
          `http://localhost:5274/api/dashboard/current-organized/${userId}`,
          {},
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (Array.isArray(res.data)) {
          setTotalCount(res.data.length);
          const pagedEvents = res.data.slice((page - 1) * pageSize, page * pageSize);

          const eventsWithEditCount = await Promise.all(
            pagedEvents.map(async (event: EventInterface): Promise<EventInterface & { editCount?: number }> => {
              try {
                const editCountRes = await axios.get<{ editEventCount?: number } | number>(
                  `http://localhost:5274/api/Events/editeventcount/${event.eventId}`,
                  {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                  }
                );

                let count: number | undefined;
                if (typeof editCountRes.data === "object" && editCountRes.data !== null && "editEventCount" in editCountRes.data) {
                  count = editCountRes.data.editEventCount;
                } else if (typeof editCountRes.data === "number") {
                  count = editCountRes.data;
                }

                return { ...event, editCount: count };
              } catch {
                return { ...event, editCount: undefined };
              }
            })
          );

          setEvents(eventsWithEditCount);
        } else {
          setEvents([]);
        }
      } catch (err: unknown) {
        setError("Failed to fetch your events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [page, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">My Organized Events</h1>

      {loading ? (
        <div className="text-gray-500 mb-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                You have not organized any events yet.
              </div>
            ) : (
              events.map((event, idx) => (
                <EventCard
                  event={event}
                  key={event.eventId ?? idx}
                  showActions={true}
                  hideRegister={true}
                  onDelete={(eventId: string | number) => {
                    setConfirmDialog({ open: true, eventId });
                  }}
                  onEdit={(event) => {
                    window.location.href = `/event/${event.eventId}/edit-event`;
                  }}
                />
              ))
            )}
            {popup && (
              <PopupMessage
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup(null)}
              />
            )}
            {confirmDialog?.open && (
              <ConfirmationDialog
                open={confirmDialog.open}
                message="Are you sure you want to delete this event?"
                onConfirm={async () => {
                  if (!confirmDialog.eventId) return;

                  try {
                    const token = localStorage.getItem("token");
                    await axios.delete(
                      `http://localhost:5274/api/Events/${confirmDialog.eventId}`,
                      {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                      }
                    );

                    setEvents((prev) => prev.filter((e) => e.eventId !== confirmDialog.eventId));
                    setPopup({ message: "Event deleted successfully.", type: "success" });
                  } catch {
                    setPopup({ message: "Failed to delete event", type: "error" });
                  } finally {
                    setConfirmDialog({ open: false, eventId: null });
                  }
                }}
                onCancel={() => setConfirmDialog({ open: false, eventId: null })}
                confirmText="Delete"
                cancelText="Cancel"
              />
            )}
          </div>

          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="mx-2">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
            <select
              className="ml-4 px-2 py-1 rounded border"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              title="Select page size"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
