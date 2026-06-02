import {
  date,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { programs } from "./programs";
import { semesters } from "./semesters";

export const studentProfiles = pgTable(
  "student_profiles",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull()
      .unique(),

    programId: uuid("program_id")
      .references(() => programs.id)
      .notNull(),

    semesterId: uuid("semester_id")
      .references(() => semesters.id)
      .notNull(),

    sectionRollNo: varchar("section_roll_no", {
      length: 50,
    })
      .notNull()
      .unique(),

    universityRollNo: varchar("university_roll_no", {
      length: 50,
    })
      .notNull()
      .unique(),

    registrationNo: varchar(
      "registration_no",
      {
        length: 50,
      }
    )
      .notNull()
      .unique(),

    phone: varchar("phone", {
      length: 20,
    }),

    joinedAt: date("joined_at"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  }
);