# Mis Notas — app de notas (web, local-first)

Implementación de la interfaz diseñada en `interfaz.pen`, siguiendo `plan-tecnologia.md`.
App web estilo Notion: editor de bloques, pendientes, calendario, búsqueda `⌘K`, papelera,
historial de versiones y modo claro/oscuro. **Todos los datos viven en el navegador (IndexedDB)** —
sin backend ni cuentas.

## Stack

`Vite + React + TypeScript + Tailwind v4 + BlockNote + Dexie + Zustand + cmdk + MiniSearch`

## Cómo ejecutar

```bash
npm install
npm run dev      # desarrollo (http://localhost:5173)
npm run build    # typecheck + build de producción a /dist
npm run preview  # servir la build
```

La primera vez se cargan notas de ejemplo (seed). Para reiniciar los datos, borra la base
`notas-app` desde las DevTools del navegador (Application → IndexedDB) y recarga.

## Funcionalidades

- **Editor de bloques** (BlockNote) sin bordes, con atajos Markdown (`# `, `- `, `[] `),
  bloques arrastrables y autoguardado (~0.8 s) con indicador "Guardado ✓".
- **Menú contextual de formato** (clic derecho): encabezados, listas y estilos de texto.
- **Encabezado de nota**: emoji, título, y metadatos (fecha, etiquetas, grupo).
- **Pendientes**: métricas, barra de progreso, gráfico semanal y pestañas; las tareas se
  derivan de los checkboxes de las notas.
- **Calendario** mensual con indicador en días con contenido y panel del día.
- **Buscador global `⌘K`** (cmdk + MiniSearch) por título y contenido + comandos rápidos.
- **Favoritos**, **Papelera** (borrado reversible) e **historial de versiones** por nota.
- **Exportar** a Markdown (.md) y a PDF (impresión).
- **Modo claro/oscuro** con los tokens de diseño del `.pen`.

## Estructura

```
src/
  app/        App.tsx (router + layout de 3 zonas)
  components/ Sidebar, NavItem, TaskRow, MetricCard, Icon
  data/       db.ts (Dexie), repo.ts (CRUD), hooks.ts, tasks.ts, seed.ts
  features/   editor/ todos/ calendar/ trash/ favorites/ search/
  lib/        dates, export, templates
  store/      ui.ts (Zustand: tema, sidebar, estado de guardado)
  styles/     app.css (tokens + Tailwind)
```
