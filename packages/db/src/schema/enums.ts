import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "ADMIN",
  "TEACHER",
  "STUDENT",
]);