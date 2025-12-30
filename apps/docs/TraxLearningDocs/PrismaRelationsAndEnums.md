# Prisma Relations and Enums

This document explains **Enums vs Relations in Prisma**, using Anchor’s Habit system as a concrete example.  
The goal is to clearly understand **what enums are**, **what relations are**, and **why both are used**.

---

## 1. What Is an Enum?

An **enum** (short for *enumeration*) is a **restricted set of allowed values** for a single column.

Instead of allowing *any* string, enums force a column to only accept predefined options.

### Example
```prisma
enum HabitPriority {
  LOW
  MEDIUM
  HIGH
}
```

This means:
- A value **must** be one of `LOW`, `MEDIUM`, or `HIGH`
- Invalid or misspelled values are rejected at the database level

---

## 2. Enums Are NOT Tables

Important clarification:

- ❌ Enums are **not** tables
- ❌ They do **not** store rows
- ❌ They do **not** create relationships

Enums are **types**, not data.

In Postgres, Prisma creates an enum type internally — not a queryable table.

---

## 3. How Enums Are Used in Models

Enums are attached directly to **columns** in a model.

### Example
```prisma
model Habit {
  priority HabitPriority
}
```

This means:
- `Habit.priority` uses the `HabitPriority` enum
- The database enforces valid values automatically

This is a **type constraint**, not a relationship.

---

## 4. Why Use Enums Instead of Strings?

Enums provide:

- ✅ Data safety (no invalid values)
- ✅ Backend + frontend consistency
- ✅ Cleaner conditional logic
- ✅ Compile-time + runtime enforcement

Example:
```ts
if (habit.priority === "HIGH") { ... }
```

No casing issues. No typos. No silent bugs.

---

## 5. What Is a Relation?

A **relation** connects two tables using a **foreign key**.

Relations represent **real data that grows over time**.

---

## 6. Habit vs HabitCheckIn (Rules vs Events)

### Habit = Rules
Stores *how* a habit behaves.

```prisma
model Habit {
  priority       HabitPriority
  repeatInterval HabitRepeatInterval
  checkIns       HabitCheckIn[]
}
```

Contains:
- Priority
- Schedule
- Category
- Start / end dates

---

### HabitCheckIn = Events
Stores *what actually happened*.

```prisma
model HabitCheckIn {
  habitId String
  habit   Habit @relation(fields: [habitId], references: [id])
  day     DateTime
}
```

Contains:
- Which habit was completed
- On which day

---

## 7. How `checkIns` Is “Used” in Habit

```prisma
checkIns HabitCheckIn[]
```

This means:
- One Habit → many HabitCheckIns
- `HabitCheckIn.habitId` is a foreign key
- Prisma joins these tables when requested

This is **relational usage**, not type usage.

---

## 8. Key Distinction (Critical)

There are **two different kinds of “use”** in Prisma:

### Enum Usage (Type Constraint)
```prisma
priority HabitPriority
```
- Narrows allowed values
- No relationship
- No table join

### Relation Usage (Data Connection)
```prisma
checkIns HabitCheckIn[]
```
- One-to-many relationship
- Uses foreign keys
- Represents real historical data

---

## 9. Why Streak Is NOT Stored as a Column

Streaks are **derived data**.

They should be:
- Computed from `HabitCheckIn`
- Not stored directly (to avoid desync bugs)

> Truth lives in events.  
> Stats are derived from truth.

---

## 10. Summary

- **Enums** = rules and constraints
- **Relations** = history and events
- Enums do not create tables
- Relations always involve foreign keys
- Habit defines behavior
- HabitCheckIn records reality

This separation keeps Anchor’s backend:
- Predictable
- Scalable
- Bug-resistant
- Easy to reason about
