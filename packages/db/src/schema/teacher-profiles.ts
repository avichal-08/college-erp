import {
  date,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const teacherProfiles = pgTable(
  "teacher_profiles",
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

    employeeId: varchar(
      "employee_id",
      {
        length: 50,
      }
    )
      .notNull()
      .unique(),

    designation: varchar(
      "designation",
      {
        length: 255,
      }
    ),

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