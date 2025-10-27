import { LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  isCreateAction?: boolean;
  disabled?: boolean;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
  disabled?: boolean;
}

export interface TeamData {
  name: string;
  logo: LucideIcon;
  plan: string;
  url: string;
}

export interface ProjectData {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
  disabled?: boolean;
}

