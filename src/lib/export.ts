import type { Note } from "../data/db";

export function downloadMarkdown(note: Note, markdown: string): void {
  const front = `# ${note.emoji} ${note.title}\n\n`;
  const blob = new Blob([front + markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title.replace(/[^\p{L}\p{N} -]/gu, "").trim() || "nota"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export a PDF usando el diálogo de impresión del navegador. */
export function exportPdf(): void {
  window.print();
}
