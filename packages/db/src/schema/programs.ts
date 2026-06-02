import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { departments } from "./departments";

export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),

  departmentId: uuid("department_id")
    .references(() => departments.id, {
      onDelete: "cascade",
    })
    .notNull(),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  code: varchar("code", {
    length: 50,
  })
    .notNull()
    .unique(),

  durationYears: integer("duration_years")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});