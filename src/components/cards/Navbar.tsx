"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Dancing_Script } from "next/font/google";
import SearchBar from "./search-bar";
import ConfirmationDialog from "../common/confirmation-dialog";

import { useState, useEffect } from "react";
import { NavbarProps, UserProfile } from "@/interfaces/nav";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface NavbarForceAdminProps extends NavbarProps {
  forceAdminDashboard?: boolean;
}

export default function Navbar({ forceAdminDashboard = false }: NavbarForceAdminProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [dashboardOpen, setDashboardOpen] = useState<boolean>(false);
  const [internalLoggedIn, setInternalLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchUserProfile = async () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser) {
          try {
            const userObj: UserProfile = JSON.parse(storedUser);
            setInternalLoggedIn(true);

            const userId =
              userObj.userId || userObj.id || userObj.UserId || userObj.Id;

            if (userId && token) {
              try {
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5274"}/api/Users/${userId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (res.ok) {
                  const data: UserProfile = await res.json();
                  setUsername(data.name || data.username || "User");
                  setEmail(data.email || "user@gmail.com");

                  let img = data.profileImage || data.imageUrl || "";
                  if (img.startsWith("/uploads/")) {
                    img = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5274"}${img}`;
                  }

                  if (!ignore) setProfileImageUrl(img);
                }
              } catch {
                // Fetch failure fallback
              }
            }
          } catch {
            // fallback: treat stored string as username
            setUsername(storedUser);
            setInternalLoggedIn(true);
          }
        } else {
          setUsername("");
          setEmail("");
          setInternalLoggedIn(false);
          setProfileImageUrl("");
        }

        setLoading(false);
      }
    };

    fetchUserProfile();

    const handleProfileImageUpdated = () => {
      fetchUserProfile();
    };
    const handleUserLoggedIn = () => {
      fetchUserProfile();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("profileImageUpdated", handleProfileImageUpdated);
      window.addEventListener("userLoggedIn", handleUserLoggedIn);

      const body = document.body;
      if (dashboardOpen) {
        body.classList.add("overflow-hidden");
      } else {
        body.classList.remove("overflow-hidden");
      }

      return () => {
        ignore = true;
        body.classList.remove("overflow-hidden");
        window.removeEventListener("profileImageUpdated", handleProfileImageUpdated);
        window.removeEventListener("userLoggedIn", handleUserLoggedIn);
      };
    }
  }, [dashboardOpen]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      document.cookie =
    "authToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
      setMenuOpen(false);
      setDashboardOpen(false);
      setInternalLoggedIn(false);
      setUsername("");
      
      router.push("/");
    }
  };

  // Admin logic
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj: any = JSON.parse(storedUser);
          setIsAdmin(userObj.role === 1);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
  }, [internalLoggedIn]);

  const isHome = pathname === "/";
  const isLogin = pathname?.toLowerCase() === "/login";
  const isSignup = pathname?.toLowerCase() === "/signup";
  // If forceAdminDashboard is true, always treat as admin dashboard route
  const isAdminDashboardRoute = !!forceAdminDashboard || pathname?.startsWith("/admin");
  // If forceAdminDashboard is true, never show user dashboard options
  const isDashboard = forceAdminDashboard ? true : (pathname?.startsWith("/dashboard") || pathname?.startsWith("/event") || pathname?.startsWith("/admin") || pathname?.startsWith("/send-email"));
  const showCreateEvent = forceAdminDashboard ? false : (pathname?.startsWith("/dashboard") || pathname?.startsWith("/event"));
  const onSearch = pathname === "/" || pathname === "/dashboard";

  if (loading) return null;

  const NAVBAR_HEIGHT = 80;
  const HR_HEIGHT = 1;
  const TOTAL_NAV_HEIGHT = NAVBAR_HEIGHT + HR_HEIGHT;

  return (
    <>
      <style>{`
        .main-content {
          margin-top: 81px !important;
        }
      `}</style>
  <nav className="fixed top-0 left-0 w-full z-50">
    {/* Desktop: everything in one row */}
    <div className="hidden lg:flex flex-row items-center justify-between bg-white bg-opacity-100 px-8 pt-2 pb-2 w-full">
      <div className="flex items-center">
        <img src="/icons/family.png" alt="EventSphere Logo" className="w-10 h-10 object-cover inline-block mr-2" />
        <button
          type="button"
          className={`text-3xl font-bold ${dancingScript.className} focus:outline-none`}
          style={{
            color: "#0031ac",
            letterSpacing: "2px",
            fontWeight: 700,
            textShadow: "0 2px 8px #fff6, 0 1px 0 #fff",
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
          onClick={() => {
            if (internalLoggedIn && isAdmin) {
              router.push("/admin");
            } else if (internalLoggedIn) {
              router.push("/dashboard");
            } else {
              router.push("/");
            }
          }}
        >
          EventSphere
        </button>
      </div>
      {/* Search bar in row */}
      {onSearch && (
        <div className="flex-1 mx-8">
          <SearchBar />
        </div>
      )}
      {/* Desktop nav options */}
      {!isLogin && !isSignup && (
  <div className="flex items-center gap-6">
          {/* Admin profile button */}
          {isAdmin && internalLoggedIn ? (
            <button
              className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 text-gray-700 font-semibold max-w-[180px] hover:bg-gray-300"
              onClick={() => setDashboardOpen((open) => !open)}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-300 text-gray-600 text-lg font-bold overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="object-cover w-full h-full rounded-full" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z" />
                  </svg>
                )}
              </span>
            </button>
          ) : (
            <>
              <button
                className="bg-transparent text-green-600 underline underline-offset-4 font-medium px-0 py-0 hover:text-green-800 transition-colors duration-150"
                style={{ boxShadow: "none", border: "none" }}
                onClick={() => { setMenuOpen(false); if (internalLoggedIn) { router.push("/event/create-event"); } else { router.push("Login"); } }}
              >
                Create Event
              </button>
              {!internalLoggedIn && (
                <>
                  <Link href="/Login" className="bg-transparent text-gray-800 underline underline-offset-4 font-medium px-0 py-0 hover:text-gray-900 transition-colors duration-150" style={{marginLeft: "8px", boxShadow: "none", border: "none"}}>Login</Link>
                  <Link href="/Signup" className="bg-transparent text-orange-500 underline underline-offset-4 font-medium px-0 py-0 hover:text-orange-600 transition-colors duration-150" style={{marginLeft: "8px", boxShadow: "none", border: "none"}}>Sign Up</Link>
                </>
              )}
              {internalLoggedIn && (
                <button className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 text-gray-700 font-semibold max-w-[180px] hover:bg-gray-300" onClick={() => setDashboardOpen((open) => !open)}>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-300 text-gray-600 text-lg font-bold overflow-hidden">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="Profile" className="object-cover w-full h-full rounded-full" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z" />
                      </svg>
                    )}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
    {/* Tablet/Mobile: logo+menu first row, search bar second row */}
    <div className="lg:hidden flex flex-col gap-2 bg-white bg-opacity-100 px-4 pt-2 pb-2 w-full">
      <div className="flex flex-row items-center justify-between w-full relative">
        <div className="flex items-center">
          <img src="/icons/family.png" alt="EventSphere Logo" className="w-8 h-8 object-cover inline-block mr-2" />
          <button
            type="button"
            className={`text-2xl font-bold ${dancingScript.className} focus:outline-none`}
            style={{
              color: "#0031ac",
              letterSpacing: "2px",
              fontWeight: 700,
              textShadow: "0 2px 8px #fff6, 0 1px 0 #fff",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
            onClick={() => {
              if (internalLoggedIn && isAdmin) {
                router.push("/admin");
              } else if (internalLoggedIn) {
                router.push("/dashboard");
              } else {
                router.push("/");
              }
            }}
          >
            EventSphere
          </button>
        </div>
        <button
          className="lg:hidden p-2 focus:outline-none"
          aria-label="Open menu"
          onClick={() => {
            if (internalLoggedIn) {
              setDashboardOpen(true);
              setMenuOpen(false);
            } else {
              setMenuOpen((open) => !open);
            }
          }}
        >
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </button>
      </div>
      {/* Search bar full width below logo/menu */}
      {onSearch && (
        <div className="w-full my-2 flex justify-center">
          <SearchBar />
        </div>
      )}
      {/* Main Nav (hamburger) */}
      <ul
        className={`
          flex flex-col items-center justify-center gap-6 text-black w-full mt-2
          ${menuOpen ? "flex" : "hidden"}
          bg-white rounded-lg shadow p-4 absolute top-16 right-0 z-50
        `}
      >
        {/* Only show nav links and action buttons in mobile when hamburger is open, stacked vertically */}
        {menuOpen && (
          <>
            {/* Profile image icon for mobile hamburger dropdown */}
            {internalLoggedIn && (
              <li className="w-full flex justify-center mb-2">
                <button className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 text-gray-700 font-semibold max-w-[180px] hover:bg-gray-300" onClick={() => setDashboardOpen((open) => !open)}>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-600 text-lg font-bold overflow-hidden">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="Profile" className="object-cover w-full h-full rounded-full" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z" />
                      </svg>
                    )}
                  </span>
                  <span className="hidden sm:inline">Profile</span>
                </button>
              </li>
            )}
            {isLogin && (
              <>
                <li className="w-full">
                  <Link href="/" className="block text-center w-full px-4 py-2 rounded font-medium bg-black text-white hover:bg-blue-600" onClick={() => setMenuOpen(false)}>Home</Link>
                </li>
                <li className="w-full">
                  <Link href="/Signup" className="block text-center w-full px-4 py-2 rounded font-medium bg-black text-white hover:bg-blue-600" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </li>
              </>
            )}
            {isSignup && (
              <>
                <li className="w-full">
                  <Link href="/" className="block text-center w-full px-4 py-2 rounded font-medium bg-black text-white hover:bg-blue-600" onClick={() => setMenuOpen(false)}>Home</Link>
                </li>
                <li className="w-full">
                  <Link href="/Login" className="block text-center w-full px-4 py-2 rounded font-medium bg-black text-white hover:bg-blue-600" onClick={() => setMenuOpen(false)}>Login</Link>
                </li>
              </>
            )}
            {/* Action buttons for mobile view */}
            {!isLogin && !isSignup && (
              <>
                <li className="w-full flex justify-center">
                  <button className="bg-transparent text-green-600 underline underline-offset-4 font-medium px-0 py-2 hover:text-green-800 transition-colors duration-150 text-center w-auto" style={{ boxShadow: "none", border: "none" }} onClick={() => { setMenuOpen(false); if (internalLoggedIn) { router.push("/event/create-event"); } else { router.push("Login"); } }}>Create Event</button>
                </li>
                {!internalLoggedIn && (
                  <>
                    <li className="w-full flex justify-center">
                      <Link href="/Login" className="bg-transparent text-gray-800 underline underline-offset-4 font-medium px-0 py-2 hover:text-gray-900 transition-colors duration-150 text-center w-auto" style={{ boxShadow: "none", border: "none" }} onClick={() => setMenuOpen(false)}>Login</Link>
                    </li>
                    <li className="w-full flex justify-center">
                      <Link href="/Signup" className="bg-transparent text-orange-500 underline underline-offset-4 font-medium px-0 py-2 hover:text-orange-600 transition-colors duration-150 text-center w-auto" style={{ boxShadow: "none", border: "none" }} onClick={() => setMenuOpen(false)}>Sign Up</Link>
                    </li>
                  </>
                )}
              </>
            )}
          </>
        )}
      </ul>
    </div>
        <hr className="h-px my-0 bg-gray-200 border-0 dark:bg-gray-700" />

        {/* Dashboard Side Drawer */}
        {dashboardOpen && internalLoggedIn && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 backdrop-blur-sm bg-white/30 z-[100]"
              onClick={() => setDashboardOpen(false)}
            ></div>

            {/* Right-side Drawer */}
            <aside className="fixed top-0 right-0 w-80 max-w-full h-full bg-white shadow-lg p-6 flex flex-col gap-6 z-[101] animate-slideInRight">
              {/* User info block */}
              <div className="flex flex-col items-center gap-2 border-b pb-4">
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl overflow-hidden">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z"
                      />
                    </svg>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{username}</p>
                  <p className="text-sm text-gray-600 break-all">
                    {email || "user@gmail.com"}
                  </p>
                </div>
              </div>

              {/* Navigation buttons: show only View Profile for admin, all for user */}

              <nav className="flex flex-col gap-3 flex-1">
                {/* Admin: Only show My Profile and Approved Events on admin dashboard */}
                {isAdmin && isAdminDashboardRoute ? (
                  <>
                    <button
                      onClick={() => {
                        router.push("/admin/edit-profile");
                        setDashboardOpen(false);
                      }}
                      className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        router.push("/admin/approved-events");
                        setDashboardOpen(false);
                      }}
                      className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg"
                    >
                      Approved Events
                    </button>
                     <button
                       onClick={() => {
                         router.push("/admin/all-payments");
                         setDashboardOpen(false);
                       }}
                       className="text-left px-2 py-1 rounded hover:bg-green-100 font-semibold text-lg"
                     >
                       View All Event Payments
                     </button>
                  </>
                ) : (
                  <>
                    {/* Regular user options */}
                    <button onClick={() => {router.push("/dashboard/edit-profile");setDashboardOpen(false);}} className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg">View Profile</button>
                    <button onClick={() => {router.push("/event/create-event");setDashboardOpen(false);}} className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg">Create Event</button>
                    <button onClick={() => {router.push("/dashboard/upcoming-organized-events");setDashboardOpen(false);}} className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg">Upcoming Organized Events</button>
                    <button onClick={() => {router.push("/dashboard/upcoming-registered-events");setDashboardOpen(false);}} className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg">Upcoming Registered Events</button>
                    <button onClick={() => {router.push("/dashboard/bookmarks");setDashboardOpen(false);}} className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg">Bookmarked Events</button>
                    <button onClick={() => {router.push("/dashboard/past-attended-events");setDashboardOpen(false);}} className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg">Past Attended Events</button>
                    <button onClick={() => {router.push("/dashboard/past-organized-events");setDashboardOpen(false);}} className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg">Past Organized Events</button>
                    <button onClick={() => {router.push("/dashboard/my-events-payments");setDashboardOpen(false);}} className="text-left px-2 py-1 rounded hover:bg-blue-100 font-semibold text-lg">My Events Payments</button>
                    <button onClick={() => {router.push("/dashboard/tickets");setDashboardOpen(false);}} className="text-left px-2 py-1 rounded hover:bg-gray-100 font-semibold text-lg">Tickets Booked</button>
                  </>
                )}
              </nav>

              {/* Logout and Delete Account */}
              <div className="flex gap-2 mt-auto">
                <button
                  className="flex-1 px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded bg-gray-300 text-black font-semibold hover:bg-gray-400 transition-colors duration-200"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete
                </button>
                <ConfirmationDialog
                  open={showDeleteDialog}
                  message="Are you sure you want to delete your account? This action cannot be undone."
                  confirmText="Delete"
                  cancelText="Cancel"
                  onConfirm={async () => {
                    setShowDeleteDialog(false);
                    const storedUser = localStorage.getItem("user");
                    const token = localStorage.getItem("token");
                    let userId = null;
                    if (storedUser) {
                      try {
                        const userObj = JSON.parse(storedUser);
                        userId = userObj.userId || userObj.id || userObj.UserId || userObj.Id;
                      } catch {}
                    }
                    if (userId && token) {
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5274"}/api/Users/${userId}`, {
                          method: "DELETE",
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                          handleLogout();
                        } else {
                          alert("Failed to delete account. Please try again.");
                        }
                      } catch {
                        alert("Failed to delete account. Please try again.");
                      }
                    } else {
                      alert("User not found or not logged in.");
                    }
                  }}
                  onCancel={() => setShowDeleteDialog(false)}
                />
              </div>
            </aside>
          </>
        )}
      </nav>
    </>
  );
}
