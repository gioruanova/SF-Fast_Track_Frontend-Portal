import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function UserPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}: UserPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
        Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} usuarios
      </div>

      <div className="flex flex-wrap items-center gap-1 md:gap-2 justify-center md:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="text-xs md:text-sm px-2 md:px-3"
        >
          <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline ml-1">Anterior</span>
        </Button>

        <div className="flex flex-wrap items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-6 h-6 md:w-8 md:w-8 p-0 text-xs md:text-sm"
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="text-xs md:text-sm px-2 md:px-3"
        >
          <span className="hidden sm:inline mr-1">Siguiente</span>
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </div>
    </div>
  );
}

