import type { IncomingMessage } from "node:http";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { eq } from "drizzle-orm";

import { db } from "@repo/db";
import { users, teacherProfiles, studentProfiles } from "@repo/db/schema";

export type SocketAuth =
  | { role: "TEACHER"; userId: string; teacherProfileId: string }
  | { role: "STUDENT"; userId: string; studentProfileId: string };

interface AccessTokenPayload {
  userId: string;
  role: string;
  version: number;
}

/**
 * Verifies the same `accessToken` httpOnly cookie issued by auth-service.
 * Browsers attach cookies to the WebSocket upgrade request automatically
 * (cookie scoping is by domain, not port, so this works across services
 * running on the same host in dev). Returns null for anything invalid —
 * missing cookie, bad/expired JWT, stale session version, deactivated
 * user, or a role with no matching profile row.
 */
export async function authenticateConnection(
  req: IncomingMessage,
): Promise<SocketAuth | null> {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const token = parse(cookieHeader).accessToken;
    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return null;
    }

    const payload = jwt.verify(token, secret) as AccessTokenPayload;

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user || !user.isActive) return null;
    if (user.version !== payload.version) return null;

    if (user.role === "TEACHER") {
      const profile = await db.query.teacherProfiles.findFirst({
        where: eq(teacherProfiles.userId, user.id),
      });
      if (!profile) return null;
      return { role: "TEACHER", userId: user.id, teacherProfileId: profile.id };
    }

    if (user.role === "STUDENT") {
      const profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, user.id),
      });
      if (!profile) return null;
      return { role: "STUDENT", userId: user.id, studentProfileId: profile.id };
    }

    // ADMIN or any other role has no place in the attendance socket.
    return null;
  } catch {
    return null;
  }
}
