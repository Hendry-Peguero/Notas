import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { EditorView } from "../features/editor/EditorView";
import { TodosView } from "../features/todos/TodosView";
import { CalendarView } from "../features/calendar/CalendarView";
import { TrashView } from "../features/trash/TrashView";
import { FavoritesView } from "../features/favorites/FavoritesView";
import { CommandPalette } from "../features/search/CommandPalette";
import { useUI } from "../store/ui";

export function App() {
  const setSearchOpen = useUI((s) => s.setSearchOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  return (
    <HashRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-canvas text-text-primary">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/pendientes" replace />} />
            <Route path="/note/:id" element={<EditorView />} />
            <Route path="/pendientes" element={<TodosView />} />
            <Route path="/favoritos" element={<FavoritesView />} />
            <Route path="/calendario" element={<CalendarView />} />
            <Route path="/papelera" element={<TrashView />} />
          </Routes>
        </main>
        <CommandPalette />
      </div>
    </HashRouter>
  );
}
