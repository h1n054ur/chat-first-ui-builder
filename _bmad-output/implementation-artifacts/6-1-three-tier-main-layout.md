# Story 6.1: Three-Tier Main Layout

Status: ready-for-dev

## Story

As a user,
I want a professional workspace layout that separates my chat, my preview, and my tools,
so that I can focus on sculpting my UI without interface clutter.

## Acceptance Criteria

1. **Given** the application is loaded
   **When** I view the main screen
   **Then** I see a three-tier layout:
     - Left Sidebar (Chat/History - collapsible)
     - Center Canvas (Full-bleed Preview area)
     - Top/Right Precision Panels (Code/Vibe controls)
2. **Given** the layout
   **When** I resize the window
   **Then** the preview canvas remains centered and the sidebar maintains a fixed width (e.g., 380px).
3. **Given** the split layout
   **When** I toggle the sidebar
   **Then** the preview area expands smoothly to fill the screen.

## Tasks / Subtasks

- [ ] Create `MainLayout` shell component
- [ ] Implement responsive grid/flex layout with Tailwind v4
- [ ] Add collapsible sidebar mechanism
- [ ] Create the high-fidelity "Empty State" for the preview canvas

## Dev Notes

- Use "Functional Premium" colors: Slate-950 for chrome, pure white for canvas.
- Sidebar should have a dense, technical feel (pilot's cockpit style).
- Preview area must be clearly delineated with a subtle border or shadow.
