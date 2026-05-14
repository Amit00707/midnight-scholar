# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Midnight Scholar should feel premium and lightning-fast on all devices, with a focus on mobile usability and efficient resource loading.

## Goals
1. **Mobile First**: Ensure all core pages (Landing, Dashboard, Book Details, Reader) are fully responsive and intuitive on small screens.
2. **Resource Efficiency**: Implement lazy loading for images and non-critical components to reduce initial load times.
3. **UI Refinement**: Fix layout glitches like overlapping text, oversized images, and cluttered menus on mobile.

## Non-Goals
- Adding new features.
- Changing the backend logic.
- Complete redesign of the UI.

## Users
Students and scholars using mobile devices or tablets to read and study on the go.

## Constraints
- Must maintain the existing "Midnight" aesthetic.
- Must work within the Next.js App Router structure.

## Success Criteria
- [ ] No horizontal scrolling on 375px+ viewports.
- [ ] Book covers use lazy loading.
- [ ] Mobile menu is clean and functional.
