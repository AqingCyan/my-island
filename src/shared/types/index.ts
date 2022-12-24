import { UserConfig as ViteConfiguration } from 'vite';

export type NavItemWithLink = {
  text: string;
  link: string;
};

export interface SidebarGroup {
  text: string;
  link: string;
}

export interface SideBar {
  [path: string]: SidebarGroup[];
}

export interface Footer {
  message: string;
}

export interface ThemeConfig {
  nav?: NavItemWithLink[];
  sidebar?: SideBar;
  footer?: Footer;
}

export interface UserConfig {
  title: string;
  description: string;
  themeConfig: ThemeConfig;
  vite: ViteConfiguration;
}
