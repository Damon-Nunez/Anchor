# Anchor — Task 1: Setup & Structure

This document captures the decisions, boundaries, and small lessons learned during **Task #1 (Setup & Structure)** of the Anchor project.

Anchor is a **mobile-first, companion-based productivity app**. Early technical decisions intentionally prioritize stability, clarity, and emotional design over premature optimization.

---

## ✅ Task Scope (What Task 1 Covered)

Task 1 focused **only** on establishing a clean, reliable foundation.

**Included:**
- Monorepo creation
- Expo (TypeScript) mobile app initialization
- Node + TypeScript backend initialization
- Basic backend health route
- Minimal folder hygiene
- `.env.example` creation

**Explicitly Excluded:**
- Navigation
- UI polish
- Authentication
- AI logic
- Companion systems

This constraint was intentional to avoid overbuilding.

---

## 🧱 Repo Structure Decision

We chose a **monorepo** layout:

```
anchor/
├─ apps/
│  ├─ mobile/        # Expo (React Native)
│  └─ backend/       # Node + TypeScript API
├─ docs/
│  └─ struggles/     # Reflection & learning docs
├─ README.md
```

**Why:**
- Mobile and backend evolve together
- Shared context and future shared types
- Cleaner long-term scaling
- Avoids env/config drift

Deployment will target subdirectories, not the repo root.

---

## 📱 Mobile (Expo) — Important Distinction

A key clarification during Task 1:

> **Expo’s generated structure is not the same as “beginner React structure.”**

### What We Learned
- Expo generates a **canonical, opinionated structure**
- Files like `App.tsx` and `index.ts` are **bootstrapping layers**, not feature code
- Deleting or reorganizing these early creates unnecessary friction

### Decision
- **Do not restructure the mobile app during setup**
- Treat Expo defaults as stable infrastructure
- Introduce structure only when navigation and screens are added

This prevents premature abstraction and keeps onboarding simple.

---

## 🌐 Web Support Ruling

Although Anchor is **mobile-first**, web support was enabled for **developer convenience only**.

**Policy:**
- Web = faster iteration, debugging, layout checks
- Mobile = source of truth for feel, spacing, gestures, and emotional tone

If web and mobile ever conflict, **mobile wins**.

---

## 🔌 Backend Status

Backend was initialized with:
- Express
- TypeScript
- `/health` route for sanity checks

This provides a stable base for later deployment and auth work.

---

## 🧠 Reflection (Why Task 1 Matters)

Task 1 deliberately separated:
- **Infrastructure vs features**
- **Framework defaults vs product architecture**

This distinction prevents early technical debt and aligns with Anchor’s core philosophy:

> *Gentle consistency over forced complexity.*

---

## 📍 Outcome

Task 1 completed cleanly with no major blockers.

The main takeaway was **conceptual clarity**, not technical difficulty:
- Expo ≠ generic React
- Structure should follow intent, not habit

The project is now ready for **Task 2: Backend Deployment**.

---

_End of Task 1 documentation._