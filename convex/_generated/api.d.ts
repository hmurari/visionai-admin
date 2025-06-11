/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as customers from "../customers.js";
import type * as dealComments from "../dealComments.js";
import type * as deals from "../deals.js";
import type * as debug from "../debug.js";
import type * as email from "../email.js";
import type * as forms from "../forms.js";
import type * as http from "../http.js";
import type * as learningMaterials from "../learningMaterials.js";
import type * as migrations_addContactNameToAdmin from "../migrations/addContactNameToAdmin.js";
import type * as migrations_learningMaterialsMigration from "../migrations/learningMaterialsMigration.js";
import type * as migrations from "../migrations.js";
import type * as partners from "../partners.js";
import type * as quotes from "../quotes.js";
import type * as stripe from "../stripe.js";
import type * as subscriptions from "../subscriptions.js";
import type * as tasks from "../tasks.js";
import type * as userPreferences from "../userPreferences.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  customers: typeof customers;
  dealComments: typeof dealComments;
  deals: typeof deals;
  debug: typeof debug;
  email: typeof email;
  forms: typeof forms;
  http: typeof http;
  learningMaterials: typeof learningMaterials;
  "migrations/addContactNameToAdmin": typeof migrations_addContactNameToAdmin;
  "migrations/learningMaterialsMigration": typeof migrations_learningMaterialsMigration;
  migrations: typeof migrations;
  partners: typeof partners;
  quotes: typeof quotes;
  stripe: typeof stripe;
  subscriptions: typeof subscriptions;
  tasks: typeof tasks;
  userPreferences: typeof userPreferences;
  users: typeof users;
  webhooks: typeof webhooks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
