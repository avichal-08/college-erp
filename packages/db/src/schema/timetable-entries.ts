import { pgTable, uuid, time, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { subjectOfferings } from "./subject-offerings";
import { classrooms } from "./classrooms";
import { relations } from "drizzle-orm";

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
]);

export const timetableEntries = pgTable("timetable_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectOfferingId: uuid("subject_offering_id").references(() => subjectOfferings.id).notNull(),
  classroomId: uuid("classroom_id").references(() => classrooms.id).notNull(),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const timetableEntriesRelations = relations(timetableEntries, ({ one }) => ({
  offering: one(subjectOfferings, {
    fields: [timetableEntries.subjectOfferingId],
    references: [subjectOfferings.id],
  }),
  classroom: one(classrooms, {
    fields: [timetableEntries.classroomId],
    references: [classrooms.id],
  }),
}));