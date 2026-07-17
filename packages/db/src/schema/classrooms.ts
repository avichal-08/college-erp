import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { timetableEntries } from "./timetable-entries";

export const classrooms = pgTable("classrooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomNo: varchar("room_no", { length: 50 }).notNull(),
  building: varchar("building", { length: 100 }).notNull(),
  floor: integer("floor").notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const classroomsRelations = relations(classrooms, ({ many }) => ({
  timetableEntries: many(timetableEntries),
}));