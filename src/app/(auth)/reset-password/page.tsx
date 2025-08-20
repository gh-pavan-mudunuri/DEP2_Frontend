"use client";
import React, { Suspense } from "react";
import PasswordReset from "./password-reset";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordReset />
    </Suspense>
  );
}