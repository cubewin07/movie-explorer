# Motion Showcase Plan — Standalone Showcase Page

## Purpose & Constraints
- No new routes in the existing app.
- Create a standalone landing page in a separate folder that showcases motion and interactivity.
- Include a single call‑to‑action button that navigates into the main project UI.
- Keep design clean, animated, and interactive with smooth scrolling.

## Prominent Feature To Showcase
- Real‑time chat: presence, typing indicator, grouped messages, unread states.
- References for authenticity:
  - [ChatConversation.jsx](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Frontend/src/components/pages/Chat/ChatConversation/ChatConversation.jsx)
  - [ChatProvider.jsx](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Frontend/src/context/ChatProvider.jsx)

## Folder Structure (Standalone)
  - CTA links to:
    - Production: `https://cubewin07.github.io/movie-explorer`
    - Local dev: `http://localhost:5173/` (adjust if your dev port differs)

## Page Sections
- Hero Overview
- Friends & Presence
- Create Chat Flow
- Conversation Showcase
- Notifications & Unread
- Offline & Error States
- Design System & Accessibility

## Technology Choices
- Animations: GSAP + ScrollTrigger (CDN) for robust scroll and timeline control.
- Smooth scrolling: Lenis (CDN) or native `scroll-behavior: smooth` with enhancements.
- Styling: CSS variables and utility classes in `styles.css` to keep it portable.
- Accessibility: ARIA roles, focus management, reduced motion support.

## Animation & Interaction Notes
- Hero entrance fades and lifts content on load.
- Section reveals stagger elements for readability and rhythm.
- Presence cards respond to hover with subtle scale.
- Typing indicator continuously animates dots.
- Composer sends an animated outgoing bubble; thread scrolls naturally.
- Stepper highlights each step on simulate.
- Notifications badges can scale and number‑flip with GSAP plugins if desired.

## Smooth Scrolling
- Lenis drives consistent easing across scroll.
- Prefer transform‑based animations; avoid expensive filters.
- Respect `prefers-reduced-motion` with the CSS rule.

## Accessibility
- Logical section structure with headings.
- Focusable interactive elements; visible focus styles.
- Button labels are descriptive; CTA is an anchor for navigation.

## Performance
- Batch animations into timelines; keep durations short.
- Limit simultaneous effects per section.
- Avoid large images; compress assets in `assets/`.

## CTA Behavior
- The `#cta` button navigates to production by default.
- For local development, set `href="http://localhost:5173/"`.

## Acceptance Criteria
- Smooth, artifact‑free entrance and scroll interactions.
- Clear micro‑interactions reflecting chat dynamics.
- Page loads quickly and feels responsive.
- CTA reliably navigates to the main app.
