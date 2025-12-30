import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /habits/:habitId
 * Fetch a single habit for the authenticated user
 */
router.get("/habits/:habitId", async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const userId = (req as any).userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!habitId) {
      return res.status(400).json({ error: "habitId is required" });
    }

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

    return res.status(200).json({ habit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
