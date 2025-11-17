"use client";

import { useMemo } from "react";

export function DashboardFooter() {
  
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="text-foreground flex justify-center gap-1 text-center pb-4 text-sm">
      {currentYear}
      <div className="italic flex-col">
        <span className="font-bold">Fast</span>
        <span className="font-extralight">Track</span>
      </div>.
      <span>Todos los derechos reservados.</span>
    </div>
  );
}

