# TraxDocs — Habit Create & Update Rules

This document explains the **rule system** behind the `createHabit` and `updateHabit` routes in Anchor.
These rules are **core**, intentional, and designed to prevent invalid state, data loss, and logic bugs.

---

## Core Philosophy

- **Create** = full intent (define a habit)
- **Update** = partial intent (mutate safely)
- **Backend enforces truth**
- **Defaults are not errors**
- **Enums enforce correctness**
- **Relations preserve history**

---

# CREATE HABIT (`POST /habits`)

## Rule 1 — Title (Required)
- Must exist
- Must be a non-empty string
- Trimmed before saving

Why:
- A habit without a title is meaningless
- Cannot be defaulted safely

---

## Rule 2 — repeatInterval (Default + Enum Validation)

Allowed values:
- `DAILY`
- `WEEKLY`
- `MONTHLY`
- `CUSTOM`

Rules:
- If missing → defaults to `DAILY`
- If provided → must be a valid enum value
- Normalized to uppercase

Why:
- Enforces scheduling logic
- Prevents invalid strings reaching Prisma

---

## Rule 3 — CUSTOM Requires daysOfWeek

Applies only when:
```
repeatInterval === "CUSTOM"
```

Rules:
- `daysOfWeek` must exist
- Must be an array
- Must not be empty
- Values must be integers `0–6` (Sun–Sat)
- No duplicates allowed

Why:
- CUSTOM without days is invalid
- Prevents undefined scheduling behavior

---

## Rule 4 — priority (Default + Enum Validation)

Allowed values:
- `LOW`
- `MEDIUM`
- `HIGH`

Rules:
- If missing → defaults to `MEDIUM`
- If provided → must be valid enum
- Normalized to uppercase

Why:
- Priority is constrained and predictable
- Prevents casing and typo bugs

---

## Rule 5 — targetPerPeriod

Rules:
- If missing → defaults to `1`
- Must be an integer
- Must be `>= 1`

Why:
- Supports weekly/monthly habits
- Prevents zero or negative goals

---

## Rule 6 — Dates

### startDate
- If missing → defaults to now
- Must be a valid date

### endDate
- Optional
- If provided → must be valid
- Must be **after** startDate
- May be `null` (remove end)

Why:
- Preserves timeline integrity
- Prevents impossible date ranges

---

## Final Create Guarantees

After validation:
- All enums are valid
- daysOfWeek is correct or empty
- Habit is always created in a valid state
- No system fields are client-controlled

---

# UPDATE HABIT (`PATCH /habits/:habitId`)

## First Principle — Update Is Partial

- Client sends **only fields to change**
- Backend validates **only fields present**
- Unsent fields remain untouched

Why:
- Prevents accidental overwrites
- Enables safe incremental edits

---

## Step 1 — Ownership & Existence

Before updating:
- Habit must exist
- Must belong to authenticated user
- Must not be archived

Why:
- Security
- Consistency with read/delete routes

---

## Editable Field Categories

### Fully Editable (Safe)
- `title`
- `description`
- `category`
- `priority`

These have no side effects.

---

### Conditionally Editable (Rules Required)
- `repeatInterval`
- `daysOfWeek`
- `targetPerPeriod`
- `endDate`

These affect habit logic and must be validated carefully.

---

### Never Editable
- `id`
- `userId`
- `createdAt`
- `updatedAt`
- `isArchived`
- `startDate`

Why:
- These are system-owned
- Changing them breaks history and meaning

---

## Update Rules

### Title (if present)
- Must be non-empty string
- Trimmed before saving

---

### Priority (if present)
- Must be enum value
- Same validation as create

---

### repeatInterval (if present)
- Must be valid enum
- If changed to `CUSTOM`, daysOfWeek must be valid
- If changed away from `CUSTOM`, daysOfWeek is cleared

Why:
- Prevents invalid schedule states

---

### daysOfWeek (if present)
- Only allowed when repeatInterval is `CUSTOM`
- Same validation rules as create

---

### targetPerPeriod (if present)
- Must be integer `>= 1`

---

### endDate (if present)
- May be `null`
- If date → must be valid
- Must be after startDate

---

## Partial Update Pattern (Critical)

❌ Never do:
```ts
prisma.habit.update({ data: req.body })
```

✅ Always do:
- Build `updateData` manually
- Add fields only after validation
- Pass only validated fields to Prisma

Why:
- Prevents invalid states
- Protects system fields
- Makes updates predictable

---

## Final Update Guarantees

- Habit always remains valid
- No accidental data loss
- Scheduling logic stays consistent
- History (check-ins) remains meaningful

---

## Summary

- Create defines intent
- Update mutates safely
- Enums constrain values
- Relations preserve truth
- Rules prevent impossible states

This rule system is foundational to Anchor’s backend and should be followed for all future routes.
