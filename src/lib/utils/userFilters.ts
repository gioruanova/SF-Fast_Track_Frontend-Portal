import { User } from "@/types/users";

export function filterUsersByRole(users: User[], allowedRoles?: string[]): User[] {
  if (!allowedRoles || allowedRoles.length === 0) {
    return users;
  }
  return users.filter((user) => allowedRoles.includes(user.user_role));
}

export function excludeUserById(users: User[], userId: number): User[] {
  return users.filter((user) => user.user_id !== userId);
}

export function applyUserFilters(
  users: User[],
  options: {
    allowedRoles?: string[];
    excludeCurrentUser?: boolean;
    currentUserId?: number;
  }
): User[] {
  let filteredUsers = users;

  if (options.allowedRoles && options.allowedRoles.length > 0) {
    filteredUsers = filterUsersByRole(filteredUsers, options.allowedRoles);
  }

  if (options.excludeCurrentUser && options.currentUserId) {
    filteredUsers = excludeUserById(filteredUsers, options.currentUserId);
  }

  return filteredUsers;
}

