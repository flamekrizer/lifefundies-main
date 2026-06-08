# LifeFundies — Technical Architecture & Codebase Guide

This document serves as a comprehensive technical guide for the **LifeFundies** repository. It explains the project's layout, files structure, module relationships, and implementation rationales, compiled to assist senior developers and project admins in reviewing the codebase.

---

## 🚀 1. Architectural Overview

LifeFundies is built as a **Single Page Application (SPA)** using **Vite + React (v18) + TypeScript**. 

### Rationale Behind the Stack:
*   **Vite**: Selected for fast developer tooling and instant Hot Module Replacement (HMR), compiling to clean static chunks.
*   **Firebase Core**: Utilized for serverless backend scalability:
    *   *Authentication*: Provides secure credential processing and standard forgot-password resets.
    *   *Firestore*: NoSQL document store with realtime listener support, storing users, bookings, and posts.
*   **Zustand**: A lightweight, hook-based global state manager chosen over Redux to simplify authentication state and notification alerts with near-zero boilerplate.
*   **Daily.co WebRTC**: Leveraged for reliable WebRTC live video room hosting without requiring custom media servers.
*   **Cashfree SDK**: Integrated directly to process secure INR payments on client bookings with sandbox testing support.

---

## 📁 2. Directory Structure & Key Files

The codebase is organized logically, separating design tokens, reusable components, pages, stores, and backend integrations.

```
lifefundies/
├── public/                 # Static assets (favicons, active manifest)
│   ├── icons/              # PWA launch icons (72px to 512px)
│   ├── logo.png            # Main transparent brand logo graphic
│   ├── manifest.json       # Progressive Web App web app manifest configuration
│   └── sw.js               # Service Worker script for offline capability
├── src/
│   ├── main.tsx            # App bootstrap entry point (mounts React to #root)
│   ├── App.tsx             # Routing configuration and protected path wrappers
│   ├── index.css           # Global typography, color variables, and design tokens
│   ├── components/         # Reusable layouts and feature components
│   │   ├── layout/         # Navigation bars and footer components
│   │   ├── BookingModal.tsx # Booking scheduler & Cashfree payment loader
│   │   ├── SlotSelection.tsx # Interactive date/time grid picker for sessions
│   │   └── VideoRoom.tsx    # Live WebRTC daily.co video frame
│   ├── pages/              # Views mapped directly to router paths
│   │   ├── Admin/          # Admin stats dashboard & verified status toggles
│   │   ├── Auth/           # Unified credential/reset cards
│   │   ├── Community/      # Discussion board with anonymous post options
│   │   ├── Dashboard/      # Interactive seeker workspace
│   │   ├── Landing/        # Promotional hero layouts and pricing grids
│   │   ├── MentorPortal/   # Dedicated dashboard for mentor calendars
│   │   ├── Mentors/        # Mentor listings with filter sidebars
│   │   ├── Onboarding/     # Post-signup domain selection wizard
│   │   ├── Sessions/       # Live room portals and booking history
│   │   └── Settings/       # Profile details & notification options
│   ├── stores/             # Zustand global state configurations (index.ts)
│   ├── lib/                # Client configurations & third-party service wrappers
│   │   ├── firebase.ts     # Firestore and Firebase Auth init instances
│   │   ├── bookingRepository.ts # Firestore CRUD operations for bookings & sessions
│   │   └── cashfree.ts     # Cashfree payment SDK loader and checkout handler
│   ├── types/              # TypeScript definitions and interfaces (index.ts)
│   └── utils/              # Pure formatting and initials parsing utilities (index.ts)
```

---

## ⚙️ 3. Core Workflows & Logic

### A. Authentication & Onboarding
*   **Auth Store (`src/stores/index.ts`)**: Tracks `user` profile state.
*   **Signup Wizard (`src/pages/Onboarding/Onboarding.tsx`)**: Completes signup profiles by mapping users to preferred life domains (e.g. Career, Relationships).
*   **Protected Routes (`src/App.tsx#L17-L22`)**: Relies on a wrapping component `<ProtectedRoute>` that matches the active user's roles (`user`, `mentor`, or `admin`) before rendering children, preventing unauthorized routes access.

### B. Scheduling & Booking Flow
*   **Session Grid Picker (`src/components/SlotSelection.tsx`)**: Renders available days and 60-minute time intervals dynamically, using key combinations to prevent double bookings.
*   **Cashfree Payment (`src/lib/cashfree.ts`)**: Integrates the Cashfree checkout:
    1. Loads the Cashfree SDK dynamically from CDN.
    2. Initiates secure payment collection in INR.
    3. Handles success/failure callbacks to confirm booking and create session in Firestore.

### C. Live Video Session Room (`src/components/VideoRoom.tsx`)
*   Uses `@daily-co/daily-js` to embed WebRTC video nodes inside the browser.
*   Handles event lifecycle (joining, leaving, mic/camera toggles) with automatic WebRTC frame cleanup when users exit the room.

---

## 🎨 4. Premium Styling System (`src/index.css`)

The style system is tailored to establish a premium, parchment-inspired design:

### 1. Variables & Harmonious Tokens (`:root`)
*   **Parchment Base**: `--clr-bg: #F8F5F0`, `--clr-bg-alt: #F1EDE6`
*   **Primary accents**: `--clr-primary: #1A58CF`, `--clr-accent: #C9A9A9`
*   **Soft Transitions**: Cubic-bezier spring transitions (`--ease-spring`) are assigned for modern interactive micro-interactions.

### 2. Autofill Layout Optimization
To keep autofilled credentials fields aligned with the parchment color scheme, browser defaults are overridden with an inset box shadow:
```css
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0px 1000px var(--clr-bg-alt) inset !important;
  -webkit-text-fill-color: var(--clr-text) !important;
}
```

### 3. Absolute Input Alignment System
To ensure user input text never collides with absolute icons, form inputs are refactored to specific side padding declarations:
*   `.input-with-icon`: Sets `padding-left: 2.75rem !important` (safely clearing the absolute icon at `left: 0.875rem`).
*   `.input-with-icon-right`: Sets `padding-right: 2.75rem !important` (clearing password toggle buttons).

---

## 🧹 5. Garbage Collection & Codebase Refactoring

We programmatically scanned all file imports starting from the entry points to clean up legacy prototypes:

*   **78 Redundant Files Removed**:
    *   Deleted the entire `src/app/` folder which contained dead Next.js app pages (Vite routes are configured exclusively in `src/App.tsx`).
    *   Removed 35 obsolete `.jsx` components (Vite compiles code using `.tsx` variants).
    *   Cleaned up 13 unused JS libraries inside `src/lib/`.
*   **24 Redundant Assets Removed**:
    *   Deleted unused high-resolution background assets (`bg1.jpg`, `bg2.jpg`) and default framework SVGs (`next.svg`, `vercel.svg`) to optimize the build size.
*   **Build Optimization**: The clean codebase compiles to a lightweight build bundle under **5.1s** with **zero compile/TS warnings**.
