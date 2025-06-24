"use server";

import { db } from "../../index";
import { companies } from "../../schema";

export const getAllCompanies = async () => {
  try {
    const allCompanies = await db.select().from(companies);
    return allCompanies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};
