# Plan 1.1: Global Responsiveness

## Objective
Fix the Navbar and Footer to ensure they look premium and functional on mobile devices.

## Context
- .gsd/SPEC.md
- src/components/layout/GlassNavbar.tsx
- src/components/layout/Footer.tsx

## Tasks

<task type="auto">
  <name>Refactor Footer Grid</name>
  <files>src/components/layout/Footer.tsx</files>
  <action>
    Modify the grid columns to stack better on mobile.
    - Change `grid-cols-2` to `grid-cols-1 sm:grid-cols-2` for the main content.
    - Ensure center alignment on mobile for the brand section.
  </action>
  <verify>Check footer in browser mobile view.</verify>
  <done>Footer sections stack vertically on small screens.</done>
</task>

<task type="auto">
  <name>Clean Mobile Navbar</name>
  <files>src/components/layout/GlassNavbar.tsx</files>
  <action>
    Optimize the mobile drawer:
    - Add a "Close" button or better overlay.
    - Group links logically.
    - Fix the transition for a smoother feel.
  </action>
  <verify>Test hamburger menu on mobile viewport.</verify>
  <done>Mobile menu is smooth and doesn't feel cluttered.</done>
</task>

## Success Criteria
- [ ] Footer is readable on 320px width.
- [ ] Navbar menu works flawlessly on mobile.
