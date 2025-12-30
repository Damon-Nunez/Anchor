import { Router, Request, Response } from "express";
import {
  PrismaClient,
  HabitPriority,
  HabitRepeatInterval,
} from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /createHabit
 * NOTE: This assumes req.userId is set by an auth middleware.
 * If you don't have that yet, add it next.
 */
router.post("/createHabit", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      priority,
      category,
      repeatInterval,
      daysOfWeek,
      targetPerPeriod,
      startDate,
      endDate,
    } = req.body;

    // ---- Auth (temporary guard) ----
    const userId = (req as any).userId as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ---- Rule 1: title ----
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    // ---- Rule 2: repeatInterval default + validation ----
    const allowedIntervals: HabitRepeatInterval[] = [
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "CUSTOM",
    ];

    const interval = String(repeatInterval ?? "DAILY")
      .toUpperCase() as HabitRepeatInterval;

    if (!allowedIntervals.includes(interval)) {
      return res.status(400).json({
        error: "Invalid repeatInterval. Must be DAILY, WEEKLY, MONTHLY, or CUSTOM.",
      });
    }

    // ---- Rule 3: CUSTOM requires valid daysOfWeek ----
    if (interval === "CUSTOM") {
      if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
        return res.status(400).json({
          error: "CUSTOM habits require daysOfWeek (e.g., [1,3,5]).",
        });
      }

      const allValid = daysOfWeek.every(
        (d: any) => Number.isInteger(d) && d >= 0 && d <= 6
      );

      if (!allValid) {
        return res.status(400).json({
          error: "daysOfWeek must contain integers from 0 (Sun) to 6 (Sat).",
        });
      }

      const uniqueCount = new Set(daysOfWeek).size;
      if (uniqueCount !== daysOfWeek.length) {
        return res.status(400).json({
          error: "daysOfWeek must not contain duplicates.",
        });
      }
    }

    // ---- Rule 4: priority default + validation ----
    const allowedPriorities: HabitPriority[] = ["LOW", "MEDIUM", "HIGH"];

    const finalPriority = String(priority ?? "MEDIUM")
      .toUpperCase() as HabitPriority;

    if (!allowedPriorities.includes(finalPriority)) {
      return res.status(400).json({
        error: "Invalid priority. Must be LOW, MEDIUM, or HIGH.",
      });
    }

    // ---- Rule 5: targetPerPeriod default + validation ----
    const finalTargetPerPeriod = Number(targetPerPeriod ?? 1);

    if (
      !Number.isInteger(finalTargetPerPeriod) ||
      finalTargetPerPeriod < 1
    ) {
      return res.status(400).json({
        error: "targetPerPeriod must be an integer >= 1.",
      });
    }

    // ---- Rule 6: dates ----
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;

    if (isNaN(finalStartDate.getTime())) {
      return res.status(400).json({ error: "Invalid startDate." });
    }

    if (finalEndDate && isNaN(finalEndDate.getTime())) {
      return res.status(400).json({ error: "Invalid endDate." });
    }

    if (finalEndDate && finalEndDate <= finalStartDate) {
      return res.status(400).json({ error: "endDate must be after startDate." });
    }

    // ---- Final mapping ----
    const finalDaysOfWeek =
      interval === "CUSTOM" ? (daysOfWeek as number[]) : [];

    const finalDescription =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;

    const finalCategory =
      typeof category === "string" && category.trim()
        ? category.trim()
        : null;

    // ---- Create habit ----
    const newHabit = await prisma.habit.create({
      data: {
        userId,
        title: title.trim(),
        description: finalDescription,
        priority: finalPriority,
        category: finalCategory,
        repeatInterval: interval,
        daysOfWeek: finalDaysOfWeek,
        targetPerPeriod: finalTargetPerPeriod,
        startDate: finalStartDate,
        endDate: finalEndDate,
      },
    });

    return res.status(201).json({ habit: newHabit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
