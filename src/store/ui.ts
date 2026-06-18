import { create } from "zustand";

type Theme = "light" | "dark";

const THEME_KEY = "notas-theme";

export function applyStoredTheme() {
  const stored = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light";
  document.documentElement.classList.toggle("dark", stored === "dark");
}

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  searchOpen: boolean;
  savingState: "idle" | "saving" | "saved";
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setSaving: (s: UIState["savingState"]) => void;
}

export const useUI = create<UIState>((set) => ({
  theme: (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light",
  sidebarOpen: true,
  searchOpen: false,
  savingState: "idle",
  toggleTheme: () =>
    set((s) => {
      const theme: Theme = s.theme === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
      return { theme };
    }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setSaving: (savingState) => set({ savingState }),
}));
