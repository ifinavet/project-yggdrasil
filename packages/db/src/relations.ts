import {
  companies,
  eventOrganizers,
  events,
  jobListingContacts,
  jobListings,
  registrations,
  storageObjects,
} from "@db/schema.js";
import { relations } from "drizzle-orm/relations";

export const companiesRelations = relations(companies, ({ one, many }) => ({
  objectsInStorage: one(storageObjects, {
    fields: [companies.companyImage],
    references: [storageObjects.id],
  }),
  events: many(events),
  jobListings: many(jobListings),
}));

export const objectsInStorageRelations = relations(storageObjects, ({ many }) => ({
  companies: many(companies),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  company: one(companies, {
    fields: [events.companyId],
    references: [companies.companyId],
  }),
  registrations: many(registrations),
  eventOrganizers: many(eventOrganizers),
}));

export const jobListingsRelations = relations(jobListings, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobListings.companyId],
    references: [companies.companyId],
  }),
  jobListingContacts: many(jobListingContacts),
}));

export const jobListingContactsRelations = relations(jobListingContacts, ({ one }) => ({
  jobListing: one(jobListings, {
    fields: [jobListingContacts.listingId],
    references: [jobListings.listingId],
  }),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  event: one(events, {
    fields: [registrations.eventId],
    references: [events.eventId],
  }),
}));

export const eventOrganizersRelations = relations(eventOrganizers, ({ one }) => ({
  event: one(events, {
    fields: [eventOrganizers.eventId],
    references: [events.eventId],
  }),
}));
