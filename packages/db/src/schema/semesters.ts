import {
  boolean,
  date,
  integer,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { academicYears } from "./academic-years";

export const semesters = pgTable("semesters", {
  id: uuid("id").defaultRandom().primaryKey(),

  academicYearId: uuid("academic_year_id")
    .references(() => academicYears.id, {
      onDelete: "cascade",
    })
    .notNull(),

  semesterNo: integer("semester_no")
    .notNull(),

  startDate: date("start_date")
    .notNull(),

  endDate: date("end_date")
    .notNull(),

  isCurrent: boolean("is_current")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});