"use client";

import { ProtectedPage } from "@/components/auth/protected-page";

export default function ProfesionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedPage>
      {children}
    </ProtectedPage>
  );
}

