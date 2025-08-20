"use client";
import React, { Suspense } from "react";
import SendEmailContent from "./send-email-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendEmailContent />
    </Suspense>
  );
}