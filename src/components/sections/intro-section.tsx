import NumbersCard from "../cards/numbers-card";
import { Dancing_Script as IntroDancingScript } from "next/font/google";
import { useEffect, useState } from "react";
import axios from "axios";

const introDancingScript = IntroDancingScript({
  subsets: ["latin"],
  weight: ["400", "700"],
});

import Image from "next/image";
export default function IntroSection() {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    registrations: 0,
    reviews: 0,
    avgRating: 0,
    locations: 0,
  });
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComments, setReviewComments] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get("https://dep2-backend.onrender.com/api/stats/intro");
        const data = res.data;
        setStats({
          users: data.users || 0,
          events: data.events || 0,
          registrations: data.registrations || 0,
          reviews: data.reviews || 0,
          avgRating: data.avgRating || 0,
          locations: data.locations || 0,
        });
      } catch {
        setStats({ users: 0, events: 0, registrations: 0, reviews: 0, avgRating: 0, locations: 0 });
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchReviews() {
      try {
        // Fetch reviews from backend
        const res = await axios.get("https://dep2-backend.onrender.com/api/WebsiteReview");
        const reviews = res.data;
        let avgRating = 0;
        if (Array.isArray(reviews) && reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + r.rating, 0);
          avgRating = total / reviews.length;
        }
        setStats((prev) => ({
          ...prev,
          reviews: Array.isArray(reviews) ? reviews.length : 0,
          avgRating,
        }));
      } catch {
        setStats((prev) => ({ ...prev, reviews: 0, avgRating: 0 }));
      }
    }
    fetchReviews();
  }, []);

  const handleReviewSubmit = () => {
    // Handle review submission logic here
    console.log("Review Submitted:", { reviewTitle, reviewComments });
    // Clear the input fields after submission
    setReviewTitle("");
    setReviewComments("");
  };

  return (
    <>
      <div className="main-content flex flex-col md:flex-row justify-center text-center md:text-left md:justify-around items-center mt-[90px] md:mt-80 lg:mt-86 px-3">
        {/* Title Section */}
        <div className="flex flex-col space-y-2 mt-[26px]">
          <h1 style={{color: "#0031ac"}} className={`text-4xl ${introDancingScript.className} lg:text-5xl xl:text-6xl font-extrabold text-gray-800 mt-6`}>
            Event Sphere
          </h1>
          <h2 className="text-1xl xl:text-2xl font-italics text-blue-300">
            ~ where events come to life.
          </h2>
          <div className="text-sm xl:text-base text-gray-600 max-w-xs xl:max-w-md">
            Join a vibrant world of events tailored to your interests.
            EventSphere helps you find, manage, and experience events like never
            before.
          </div>
        </div>

        <div className="flex flex-col justify-center align-middle gap-2 sm:gap-3 md:mt-0 mt-3 md:gap-0 md:flex-row">
          <div className="flex md:flex-col gap-1 sm:gap-3 md:gap-0 relative">
            <div className="absolute top-[105px] left-[-125px] xl:top-[145px] xl:left-[-150px]  xl: w-[120px] xl:w-[140px]">
              <img
                src="/icons/hello.png"
                alt="Intro Background"
                className="invisible lg:visible w-full h-auto"
              />
            </div>

            <div className="md:mb-8 md:mt-8 lg:mb-4 lg:mt-4 xl:mb-6 xl:mt-6">
              <NumbersCard
                title="Registered Users"
                number={stats.users}
                icon="group"
              />
            </div>
            <div>
              <NumbersCard
                title="Events Created"
                number={stats.events}
                icon="party"
              />
            </div>
          </div>
          <div className="flex md:flex-col gap-1 sm:gap-3 md:gap-0">
            <div className="md:ml-8 md:mb-8 lg:ml-4 lg:mb-4 xl:ml-6 xl:mb-6 flex flex-col items-center">
  <NumbersCard
  title="User Reviews"
  number={stats.reviews}
  icon="satisfaction"
>
  <span className="block mt-2">
    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded-full text-sm shadow">
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4 text-yellow-400"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.97z"/></svg>
      {stats.avgRating.toFixed(1)} / 5
    </span>
  </span>
</NumbersCard>
  
</div>
            <div className="md:ml-4 lg:ml-2 xl:ml-4">
              <NumbersCard
                title="Locations Covered"
                number={stats.locations}
                icon="map"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}