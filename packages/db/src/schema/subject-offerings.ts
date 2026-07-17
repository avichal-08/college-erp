import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { subjects } from "./subjects";
import { teacherProfiles } from "./teacher-profiles";
import { semesters } from "./semesters";
import { relations } from "drizzle-orm";
import { subjectEnrollments } from "./subject-enrollments";
import { timetableEntries } from "./timetable-entries";

export const subjectOfferings = pgTable("subject_offerings", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").references(() => subjects.id).notNull(),
  teacherId: uuid("teacher_id").references(() => teacherProfiles.id).notNull(),
  semesterId: uuid("semester_id").references(() => semesters.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subjectOfferingsRelations = relations(subjectOfferings, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [subjectOfferings.subjectId],
    references: [subjects.id],
  }),
  teacher: one(teacherProfiles, {
    fields: [subjectOfferings.teacherId],
    references: [teacherProfiles.id],
  }),
  semester: one(semesters, {
    fields: [subjectOfferings.semesterId],
    references: [semesters.id],
  }),
  enrollments: many(subjectEnrollments),
  timetableEntries: many(timetableEntries),
}));