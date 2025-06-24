import { db } from "@db/index";
import { events } from "@db/schema";

export const getAllEvents = async () => {
  try {
    const allEvents = await db.select().from(events)

    return allEvents
  } catch (error) {
    console.error(error)
    throw new Error('Failed to fetch events')
  }

};
