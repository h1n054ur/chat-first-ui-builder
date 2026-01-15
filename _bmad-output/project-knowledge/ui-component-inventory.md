# UI Component Inventory: 02 - Chat-First UI Builder

## Page Components
| Component | Path | Description |
| :--- | :--- | :--- |
| **ZenSculptor** | `src/components/ui/ZenSculptor.tsx` | The initial "Zen" screen for project starts. |
| **UtilityMaster** | `src/components/ui/UtilityMaster.tsx` | The main workspace for editing and nudging. |
| **VibeGallery** | `src/components/ui/VibeGallery.tsx` | Gallery for selecting design vibes. |

## Core UI Components
| Component | Path | Description |
| :--- | :--- | :--- |
| **OmniBox** | `src/components/ui/OmniBox.tsx` | Large, centered chat input for ZenSculptor. |
| **OmniBoxFloat** | `src/components/ui/OmniBoxFloat.tsx` | Floating command bar for the workspace. |
| **DiffToast** | `src/components/ui/DiffToast.tsx` | Toast notification showing visual deltas. |
| **VibeCard** | `src/components/ui/VibeCard.tsx` | Individual card for the vibe gallery. |
| **Shell** | `src/components/ui/Shell.tsx` | Application shell and base layout elements. |

## Design Tokens (Tailwind v4)
The UI follows a "Functional Premium" aesthetic defined in `src/style.css`:
- **Background**: `#0b0f14` (Deep void)
- **Panel**: `#121a26` (Glassmorphic containers)
- **Accent**: `#8b5cf6` (Electric Indigo)
- **Radius**: `16px` (Modern rounding)
- **Font**: Space Grotesk (Sans), IBM Plex Mono (Code)

## Interactive Features
- **Cmd+K / Cmd+B**: Keyboard shortcuts for the command bar and sidebar.
- **Viewport Simulator**: Toggle between Desktop, Tablet, and Mobile views in the workspace.
- **Live Preview**: Real-time rendering via Iframe sandbox.
