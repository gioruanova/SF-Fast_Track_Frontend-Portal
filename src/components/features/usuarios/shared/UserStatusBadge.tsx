import { USER_STATUS } from "@/types/users";

interface UserStatusBadgeProps {
  status: number;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const isActive = status === USER_STATUS.ACTIVO;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap uppercase ${
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

