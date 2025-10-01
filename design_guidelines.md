# ChatPDF Application Design Guidelines

## Design Approach: Clean Utility System
**Selected Approach:** Design System (Utility-Focused)
**Justification:** This is a productivity tool prioritizing functionality, information density, and user efficiency over visual differentiation. The interface must support complex interactions (PDF viewing, chat, file upload) while maintaining clarity.

**Design System:** Clean, minimal approach inspired by productivity tools like Notion and Linear
**Key Principles:** 
- Information hierarchy and readability
- Functional clarity over decoration
- Seamless document-to-chat workflow

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 214 100% 47% (vibrant blue for actions/links)
- Background: 0 0% 100% (pure white)
- Surface: 220 13% 97% (subtle gray for cards/panels)
- Border: 214 20% 88% (soft blue-gray borders)
- Text Primary: 215 25% 27% (dark blue-gray)
- Text Secondary: 215 16% 47% (medium gray)

**Dark Mode:**
- Primary: 214 100% 60% (lighter blue for contrast)
- Background: 215 28% 17% (deep blue-gray)
- Surface: 215 25% 22% (elevated surface color)
- Border: 215 20% 30% (subtle borders)
- Text Primary: 214 20% 88% (light text)
- Text Secondary: 214 15% 70% (secondary text)

### B. Typography
**Font Families:** Inter (primary), JetBrains Mono (code/citations)
**Hierarchy:**
- H1: 2.25rem (36px), font-bold - Landing hero
- H2: 1.875rem (30px), font-semibold - Section headers
- H3: 1.5rem (24px), font-medium - Chat messages
- Body: 1rem (16px), font-normal - Main content
- Small: 0.875rem (14px), font-normal - Citations, metadata
- Caption: 0.75rem (12px), font-medium - Labels, timestamps

### C. Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Micro spacing (2, 4): Element padding, small gaps
- Component spacing (6, 8): Component internal spacing
- Layout spacing (12, 16, 24): Section spacing, major layout gaps

**Grid System:** 
- Landing: Single column, max-width-4xl, centered
- Chat Interface: Two-column (PDF viewer 60%, chat 40%)
- Mobile: Single column stack

### D. Component Library

**Navigation:**
- Clean header with logo left, navigation right
- Subtle border-bottom, bg-surface in dark mode
- Simple text links with hover states

**Upload Component:**
- Large dashed border drag-and-drop zone
- Subtle hover state with primary color accent
- Clear upload button with primary background

**Chat Interface:**
- Left Panel: PDF viewer with navigation controls
- Right Panel: Chat messages with clear user/AI distinction
- Message bubbles: User (primary color), AI (surface color)
- Citations as small badges with page numbers

**Buttons:**
- Primary: bg-primary, white text, rounded corners
- Secondary: border with text-primary, transparent background
- Icon buttons: subtle hover states

**Cards/Panels:**
- Subtle shadow, bg-surface, rounded corners
- Clear content hierarchy within

### E. Animations
**Minimal approach:**
- Subtle hover states (0.2s ease)
- Message appearance: gentle fade-in
- Page transitions: none (prioritize performance)
- Loading states: simple spinners, no elaborate animations

## Images
**Hero Section:** No large hero image - focus on clean typography and upload interface
**Icons:** Use Heroicons for consistency
- Upload icon for drag-drop zone
- Chat/message icons for interface
- PDF/document icons for file representations
- Navigation icons (minimal, functional)

## Layout Specifications

**Landing Page:**
- Header with logo and simple navigation
- Centered upload section with clear call-to-action
- Brief feature explanation below upload
- Simple footer with essential links

**Chat Interface:**
- Fixed header with document name and actions
- Split-view layout: PDF left, chat right
- Chat input fixed at bottom of chat panel
- Responsive: stack vertically on mobile

**Critical Constraints:**
- Maintain consistent spacing using defined units
- Ensure PDF viewer and chat have equal visual weight
- Keep interface elements out of the way of content consumption
- Prioritize text readability in both PDF and chat areas

This design emphasizes functionality and usability while maintaining a clean, professional appearance appropriate for a document analysis tool.