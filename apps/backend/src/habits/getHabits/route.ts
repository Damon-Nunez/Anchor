import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /habits
 * Fetch all active habits for the authenticated user
 */
router.get("/habits", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isArchived: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({ habits });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
