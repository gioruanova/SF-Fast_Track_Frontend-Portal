import { useMemo } from "react";
import { User } from "@/types/users";

interface UseUserPaginationOptions {
  users: User[];
  currentPage: number;
  itemsPerPage: number;
}

export function useUserPagination(options: UseUserPaginationOptions) {
  const { users, currentPage, itemsPerPage } = options;

  const pagination = useMemo(() => {
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      paginatedUsers,
    };
  }, [users, currentPage, itemsPerPage]);

  return pagination;
}

