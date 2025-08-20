"use client";
import React, { Suspense } from "react";
import VerifyEmail from "./verify-email-content";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}