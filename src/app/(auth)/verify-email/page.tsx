"use client";

import React, { Suspense } from "react";
import VerifyEmail from "./verify-email-content";

// Prevent static export issues
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}
