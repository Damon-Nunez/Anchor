import { Router, Request, Response } from "express";
import {
  PrismaClient,
  HabitPriority,
  HabitRepeatInterval,
} from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * PATCH /habits/:habitId
 * Update a habit (partial update)
 */
router.patch("/habits/:habitId", async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const userId = (req as any).userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!habitId) {
      return res.status(400).json({ error: "habitId is required" });
    }

    // 1️⃣ Fetch habit (ownership + existence)
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
        isArchived: false,
      },
    });

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    // 2️⃣ Build update payload safely
    const updateData: any = {};

    const {
      title,
      description,
      priority,
      category,
      repeatInterval,
      daysOfWeek,
      targetPerPeriod,
      endDate,
    } = req.body;

    // ---- Title ----
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Invalid title" });
      }
      updateData.title = title.trim();
    }

    // ---- Description ----
    if (description !== undefined) {
      updateData.description =
        typeof description === "string" && description.trim()
          ? description.trim()
          : null;
    }

    // ---- Category ----
    if (category !== undefined) {
      updateData.category =
        typeof category === "string" && category.trim()
          ? category.trim()
          : null;
    }

    // ---- Priority ----
    if (priority !== undefined) {
      const allowedPriorities: HabitPriority[] = ["LOW", "MEDIUM", "HIGH"];
      const finalPriority = String(priority).toUpperCase() as HabitPriority;

      if (!allowedPriorities.includes(finalPriority)) {
        return res.status(400).json({
          error: "Invalid priority. Must be LOW, MEDIUM, or HIGH.",
        });
      }

      updateData.priority = finalPriority;
    }

    // ---- repeatInterval + daysOfWeek ----
    let finalInterval: HabitRepeatInterval = habit.repeatInterval;

    if (repeatInterval !== undefined) {
      const allowedIntervals: HabitRepeatInterval[] = [
        "DAILY",
        "WEEKLY",
        "MONTHLY",
        "CUSTOM",
      ];

      finalInterval = String(repeatInterval).toUpperCase() as HabitRepeatInterval;

      if (!allowedIntervals.includes(finalInterval)) {
        return res.status(400).json({
          error:
            "Invalid repeatInterval. Must be DAILY, WEEKLY, MONTHLY, or CUSTOM.",
        });
      }

      updateData.repeatInterval = finalInterval;
    }

    // ---- daysOfWeek validation ----
    if (daysOfWeek !== undefined) {
      if (finalInterval !== "CUSTOM") {
        return res.status(400).json({
          error: "daysOfWeek is only allowed when repeatInterval is CUSTOM.",
        });
      }

      if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
        return res.status(400).json({
          error: "CUSTOM habits require a non-empty daysOfWeek array.",
        });
      }

      const allValid = daysOfWeek.every(
        (d: any) => Number.isInteger(d) && d >= 0 && d <= 6
      );

      if (!allValid) {
        return res.status(400).json({
          error: "daysOfWeek must contain integers from 0 to 6.",
        });
      }

      const uniqueCount = new Set(daysOfWeek).size;
      if (uniqueCount !== daysOfWeek.length) {
        return res.status(400).json({
          error: "daysOfWeek must not contain duplicates.",
        });
      }

      updateData.daysOfWeek = daysOfWeek;
    }

    // Clear daysOfWeek if moving away from CUSTOM
    if (
      repeatInterval !== undefined &&
      finalInterval !== "CUSTOM"
    ) {
      updateData.daysOfWeek = [];
    }

    // ---- targetPerPeriod ----
    if (targetPerPeriod !== undefined) {
      const finalTarget = Number(targetPerPeriod);

      if (!Number.isInteger(finalTarget) || finalTarget < 1) {
        return res.status(400).json({
          error: "targetPerPeriod must be an integer >= 1.",
        });
      }

      updateData.targetPerPeriod = finalTarget;
    }

    // ---- endDate ----
    if (endDate !== undefined) {
      if (endDate === null) {
        updateData.endDate = null;
      } else {
        const finalEndDate = new Date(endDate);

        if (isNaN(finalEndDate.getTime())) {
          return res.status(400).json({ error: "Invalid endDate." });
        }

        if (finalEndDate <= habit.startDate) {
          return res.status(400).json({
            error: "endDate must be after startDate.",
          });
        }

        updateData.endDate = finalEndDate;
      }
    }

    // 3️⃣ Apply update
    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: updateData,
    });

    return res.status(200).json({ habit: updatedHabit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
