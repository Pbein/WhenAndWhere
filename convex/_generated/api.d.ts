/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as callouts from "../callouts.js";
import type * as helpers_coverage from "../helpers/coverage.js";
import type * as helpers_eligibility from "../helpers/eligibility.js";
import type * as helpers_schedule from "../helpers/schedule.js";
import type * as http from "../http.js";
import type * as lib_types from "../lib/types.js";
import type * as missions from "../missions.js";
import type * as pto from "../pto.js";
import type * as qualifications from "../qualifications.js";
import type * as rbac from "../rbac.js";
import type * as schedules from "../schedules.js";
import type * as shiftDefinitions from "../shiftDefinitions.js";
import type * as teams from "../teams.js";
import type * as templates from "../templates.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  callouts: typeof callouts;
  "helpers/coverage": typeof helpers_coverage;
  "helpers/eligibility": typeof helpers_eligibility;
  "helpers/schedule": typeof helpers_schedule;
  http: typeof http;
  "lib/types": typeof lib_types;
  missions: typeof missions;
  pto: typeof pto;
  qualifications: typeof qualifications;
  rbac: typeof rbac;
  schedules: typeof schedules;
  shiftDefinitions: typeof shiftDefinitions;
  teams: typeof teams;
  templates: typeof templates;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
