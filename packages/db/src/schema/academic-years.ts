import {
  boolean,
  date,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const academicYears = pgTable(
  "academic_years",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
      length: 50,
    }).notNull(),

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
  }
);