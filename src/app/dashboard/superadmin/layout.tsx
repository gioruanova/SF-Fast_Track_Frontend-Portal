"use client";

import { DashboardContent } from "../layout";

export default function SuperadminLayout({
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

