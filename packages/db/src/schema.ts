import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgSchema,
  pgTable,
  pgView,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const storage = pgSchema("storage");
export const storageObjects = storage.table(
  "objects",
  {
    id: uuid("id").primaryKey().notNull(),
  },
);

export const companies = pgTable(
  "companies",
  {
    companyId: serial("company_id").primaryKey().notNull(),
    companyName: text("company_name").notNull(),
    orgNumber: text("org_number"),
    description: text(),
    companyImage: uuid("company_image"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.companyImage],
      foreignColumns: [storageObjects.id],
      name: "companies_company_image_fkey",
    }),
  ],
);

export const events = pgTable(
  "events",
  {
    eventId: serial("event_id").primaryKey().notNull(),
    title: text().notNull(),
    teaser: text(),
    description: text(),
    eventStart: timestamp("event_start", { withTimezone: true, mode: "string" }).notNull(),
    registrationOpens: timestamp("registration_opens", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    participantsLimit: integer("participants_limit").notNull(),
    location: text().notNull(),
    food: text().notNull(),
    language: text().default("Norsk").notNull(),
    ageRestrictions: text("age_restrictions"),
    externalUrl: text("external_url"),
    companyId: integer("company_id").notNull(),
    published: boolean().default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_events_company").using("btree", table.companyId.asc().nullsLast().op("int4_ops")),
    index("idx_events_registration_opens").using(
      "btree",
      table.registrationOpens.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("idx_events_start").using(
      "btree",
      table.eventStart.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.companyId],
      foreignColumns: [companies.companyId],
      name: "fk_events_company",
    }).onDelete("restrict"),
    check("chk_registration_before_event", sql`registration_opens < event_start`),
    check("events_participants_limit_check", sql`participants_limit > 0`),
  ],
);

export const jobListings = pgTable(
  "job_listings",
  {
    listingId: serial("listing_id").primaryKey().notNull(),
    title: text().notNull(),
    type: text().notNull(),
    teaser: text().notNull(),
    description: text().notNull(),
    applicationUrl: text("application_url").notNull(),
    published: boolean().default(false).notNull(),
    companyId: integer("company_id").notNull(),
    deadline: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_job_listings_company").using(
      "btree",
      table.companyId.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_job_listings_deadline").using(
      "btree",
      table.deadline.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.companyId],
      foreignColumns: [companies.companyId],
      name: "fk_job_listings_company",
    }).onDelete("restrict"),
  ],
);

export const jobListingContacts = pgTable(
  "job_listing_contacts",
  {
    contactId: serial("contact_id").primaryKey().notNull(),
    listingId: integer("listing_id").notNull(),
    name: text().notNull(),
    email: text(),
    phone: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_job_listing_contacts_listing").using(
      "btree",
      table.listingId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.listingId],
      foreignColumns: [jobListings.listingId],
      name: "fk_job_listing_contacts_listing",
    }).onDelete("cascade"),
    check(
      "chk_job_listing_contacts_contact_method",
      sql`(email IS NOT NULL) OR (phone IS NOT NULL)`,
    ),
  ],
);

export const registrations = pgTable(
  "registrations",
  {
    registrationId: serial("registration_id").primaryKey().notNull(),
    eventId: integer("event_id").notNull(),
    userId: text("user_id").default(sql`(auth.jwt() ->> \'sub\'::text)`).notNull(),
    note: text(),
    status: text().default("registered").notNull(),
    registrationTime: timestamp("registration_time", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    attendanceStatus: text("attendance_status"),
    attendanceTime: timestamp("attendance_time", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_registrations_event").using("btree", table.eventId.asc().nullsLast().op("int4_ops")),
    index("idx_registrations_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("idx_registrations_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.eventId],
      name: "fk_registrations_event",
    }).onDelete("cascade"),
    unique("registrations_event_id_user_id_key").on(table.eventId, table.userId),
    check(
      "chk_attendance_status",
      sql`(attendance_status IS NULL) OR (attendance_status = ANY (ARRAY['attended'::text, 'no_show'::text, 'late'::text]))`,
    ),
    check(
      "chk_registration_status",
      sql`status = ANY (ARRAY['registered'::text, 'transfer'::text, 'waitlist'::text])`,
    ),
  ],
);

export const points = pgTable(
  "points",
  {
    pointId: serial("point_id").primaryKey().notNull(),
    userId: text("user_id").default(sql`(auth.jwt() ->> \'sub\'::text)`).notNull(),
    reason: text().notNull(),
    severity: integer().notNull(),
    awardedTime: timestamp("awarded_time", { withTimezone: true, mode: "string" }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_points_awarded_time").using(
      "btree",
      table.awardedTime.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("idx_points_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
    check("points_severity_check", sql`(severity > 0) AND (severity <= 10)`),
  ],
);

export const students = pgTable(
  "students",
  {
    userId: text("user_id").default(sql`(auth.jwt() ->> \'sub\'::text)`).primaryKey().notNull(),
    studyProgram: text("study_program").notNull(),
    degree: text().notNull(),
    semester: integer().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  () => [check("students_semester_check", sql`semester > 0`)],
);

export const resources = pgTable(
  "resources",
  {
    resourceId: serial("resource_id").primaryKey().notNull(),
    title: text().notNull(),
    content: text().notNull(),
    excerpt: text(),
    tag: text(),
    published: boolean().default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_resources_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("idx_resources_title").using("btree", table.title.asc().nullsLast().op("text_ops")),
  ],
);

export const eventOrganizers = pgTable(
  "event_organizers",
  {
    eventId: integer("event_id").notNull(),
    userId: text("user_id").notNull(),
    role: text().default("assistant").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.eventId],
      name: "fk_event_organizers_event",
    }).onDelete("cascade"),
    primaryKey({ columns: [table.eventId, table.userId], name: "event_organizers_pkey" }),
    check("chk_organizer_role", sql`role = ANY (ARRAY['main'::text, 'assistant'::text])`),
  ],
);

export const companyImages = pgView("company_images", {
  companyId: integer("company_id"),
  id: uuid(),
  name: text(),
})
  .with({ securityInvoker: true })
  .as(
    sql`SELECT c.company_id, o.id, o.name FROM companies c JOIN storage.objects o ON c.company_image = o.id`,
  );
