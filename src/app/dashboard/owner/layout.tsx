"use client";

import { DashboardContent } from "../layout";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardContent>
      {children}
    </DashboardContent>
  );
}

