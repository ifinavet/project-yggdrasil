-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "companies" (
	"company_id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"org_number" text,
	"description" text,
	"company_image" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"event_id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"teaser" text,
	"description" text,
	"event_start" timestamp with time zone NOT NULL,
	"registration_opens" timestamp with time zone NOT NULL,
	"participants_limit" integer NOT NULL,
	"location" text NOT NULL,
	"food" text NOT NULL,
	"language" text DEFAULT 'Norsk' NOT NULL,
	"age_restrictions" text,
	"external_url" text,
	"company_id" integer NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "chk_registration_before_event" CHECK (registration_opens < event_start),
	CONSTRAINT "events_participants_limit_check" CHECK (participants_limit > 0)
);
--> statement-breakpoint
CREATE TABLE "job_listings" (
	"listing_id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"teaser" text NOT NULL,
	"description" text NOT NULL,
	"application_url" text NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"company_id" integer NOT NULL,
	"deadline" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_listing_contacts" (
	"contact_id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "chk_job_listing_contacts_contact_method" CHECK ((email IS NOT NULL) OR (phone IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"registration_id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" text DEFAULT (auth.jwt() ->> 'sub'::text) NOT NULL,
	"note" text,
	"status" text DEFAULT 'registered' NOT NULL,
	"registration_time" timestamp with time zone DEFAULT now(),
	"attendance_status" text,
	"attendance_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "registrations_event_id_user_id_key" UNIQUE("event_id","user_id"),
	CONSTRAINT "chk_attendance_status" CHECK ((attendance_status IS NULL) OR (attendance_status = ANY (ARRAY['attended'::text, 'no_show'::text, 'late'::text]))),
	CONSTRAINT "chk_registration_status" CHECK (status = ANY (ARRAY['registered'::text, 'transfer'::text, 'waitlist'::text]))
);
--> statement-breakpoint
CREATE TABLE "points" (
	"point_id" serial PRIMARY KEY NOT NULL,
	"user_id" text DEFAULT (auth.jwt() ->> 'sub'::text) NOT NULL,
	"reason" text NOT NULL,
	"severity" integer NOT NULL,
	"awarded_time" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "points_severity_check" CHECK ((severity > 0) AND (severity <= 10))
);
--> statement-breakpoint
CREATE TABLE "students" (
	"user_id" text PRIMARY KEY DEFAULT (auth.jwt() ->> 'sub'::text) NOT NULL,
	"study_program" text NOT NULL,
	"degree" text NOT NULL,
	"semester" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "students_semester_check" CHECK (semester > 0)
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"resource_id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"tag" text,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_organizers" (
	"event_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'assistant' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "event_organizers_pkey" PRIMARY KEY("event_id","user_id"),
	CONSTRAINT "chk_organizer_role" CHECK (role = ANY (ARRAY['main'::text, 'assistant'::text]))
);
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_company_image_fkey" FOREIGN KEY ("company_image") REFERENCES "storage"."objects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "fk_events_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "fk_job_listings_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_contacts" ADD CONSTRAINT "fk_job_listing_contacts_listing" FOREIGN KEY ("listing_id") REFERENCES "public"."job_listings"("listing_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "fk_registrations_event" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_organizers" ADD CONSTRAINT "fk_event_organizers_event" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_events_company" ON "events" USING btree ("company_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_events_registration_opens" ON "events" USING btree ("registration_opens" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_events_start" ON "events" USING btree ("event_start" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_job_listings_company" ON "job_listings" USING btree ("company_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_job_listings_deadline" ON "job_listings" USING btree ("deadline" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_job_listing_contacts_listing" ON "job_listing_contacts" USING btree ("listing_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_registrations_event" ON "registrations" USING btree ("event_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_registrations_status" ON "registrations" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_registrations_user" ON "registrations" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_points_awarded_time" ON "points" USING btree ("awarded_time" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_points_user" ON "points" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_resources_created_at" ON "resources" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_resources_title" ON "resources" USING btree ("title" text_ops);--> statement-breakpoint
CREATE VIEW "public"."company_images" WITH (security_invoker = on) AS (SELECT c.company_id, o.id, o.name FROM companies c JOIN storage.objects o ON c.company_image = o.id);
*/