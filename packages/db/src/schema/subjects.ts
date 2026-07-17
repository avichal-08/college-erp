import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { departments } from "./departments";
import { relations } from "drizzle-orm";
import { subjectOfferings } from "./subject-offerings";

export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  departmentId: uuid("department_id").references(() => departments.id).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  credits: integer("credits").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
  offerings: many(subjectOfferings),
}));