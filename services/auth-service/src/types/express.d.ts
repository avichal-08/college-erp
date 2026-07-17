import type { users } from "@repo/db/schema";

declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect;
    }
  }
}

export {};