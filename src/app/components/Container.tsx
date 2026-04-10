"use client";

import React from "react";

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${className ?? ""} panel-surface flex flex-col items-center justify-center rounded-[2rem] sm:p-8 xl:p-5 2xl:p-8`}
    >
      {children}
    </div>
  );
}
