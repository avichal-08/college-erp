CREATE TYPE "public"."attendance_record_status" AS ENUM('PRESENT', 'ABSENT');--> statement-breakpoint
CREATE TYPE "public"."attendance_session_status" AS ENUM('OPEN', 'ACCEPTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('LECTURE', 'LAB');--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"session_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "attendance_record_status" NOT NULL,
	"marked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_records_session_id_student_id_pk" PRIMARY KEY("session_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "attendance_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_offering_id" uuid NOT NULL,
	"timetable_entry_id" uuid,
	"created_by" uuid NOT NULL,
	"session_type" "session_type" NOT NULL,
	"session_date" date NOT NULL,
	"status" "attendance_session_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_attendance_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."attendance_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_subject_offering_id_subject_offerings_id_fk" FOREIGN KEY ("subject_offering_id") REFERENCES "public"."subject_offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_timetable_entry_id_timetable_entries_id_fk" FOREIGN KEY ("timetable_entry_id") REFERENCES "public"."timetable_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_created_by_teacher_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."teacher_profiles"("id") ON DELETE no action ON UPDATE no action;