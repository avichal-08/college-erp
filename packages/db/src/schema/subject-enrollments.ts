import { pgTable, uuid, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { studentProfiles } from "./student-profiles";
import { subjectOfferings } from "./subject-offerings";
import { relations } from "drizzle-orm";

export const subjectEnrollments = pgTable("subject_enrollments", {
  studentId: uuid("student_id").references(() => studentProfiles.id).notNull(),
  subjectOfferingId: uuid("subject_offering_id").references(() => subjectOfferings.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.studentId, table.subjectOfferingId] }),
}));

export const subjectEnrollmentsRelations = relations(subjectEnrollments, ({ one }) => ({
  student: one(studentProfiles, {
    fields: [subjectEnrollments.studentId],
    references: [studentProfiles.id],
  }),
  offering: one(subjectOfferings, {
    fields: [subjectEnrollments.subjectOfferingId],
    references: [subjectOfferings.id],
  }),
}));