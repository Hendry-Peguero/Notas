import Dexie, { type Table } from "dexie";

export interface Group {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  groupId: string | null;
  emoji: string;
  title: string;
  blocks: unknown; // documento BlockNote (JSON)
  tagIds: string[];
  coverUrl?: string;
  date?: string; // fecha asignada / recordatorio (ISO yyyy-mm-dd)
  favorite: boolean;
  trashed: boolean;
  trashedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  noteId: string;
  text: string;
  done: boolean;
  date?: string;
  createdAt: number;
}

export interface Version {
  id: string;
  noteId: string;
  blocks: unknown;
  title: string;
  createdAt: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

export class NotasDB extends Dexie {
  notes!: Table<Note, string>;
  groups!: Table<Group, string>;
  tags!: Table<Tag, string>;
  tasks!: Table<Task, string>;
  versions!: Table<Version, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super("notas-app");
    this.version(1).stores({
      notes: "id, groupId, favorite, trashed, updatedAt, date",
      groups: "id, order",
      tags: "id",
      tasks: "id, noteId, done, date",
      versions: "id, noteId, createdAt",
      settings: "key",
    });
  }
}

export const db = new NotasDB();

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
