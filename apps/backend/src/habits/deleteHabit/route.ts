import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * DELETE /habits/:habitId
 * Soft-delete (archive) a habit
 */
router.delete("/habits/:habitId", async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;

    const userId = (req as any).userId as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!habitId) {
      return res.status(400).json({ error: "habitId is required" });
    }

    // Ensure habit exists and belongs to user
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
        isArchived: false,
      },
    });

    if (!habit) {
      return res.status(404).json({
        error: "Habit not found or already archived",
      });
    }

    const archivedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: { isArchived: true },
    });

    return res.status(200).json({
      message: "Habit archived successfully",
      habit: archivedHabit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
