"use client";

import { DashboardContent } from "../layout";

export default function OperadorLayout({
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

