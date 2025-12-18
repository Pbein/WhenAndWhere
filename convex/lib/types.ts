/**
 * Shared type constants for the scheduling app
 */

export const MISSION_STATUS = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  TERMINATED: "TERMINATED",
} as const;

export type MissionStatus = (typeof MISSION_STATUS)[keyof typeof MISSION_STATUS];

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  ON_LEAVE: "ON_LEAVE",
  INACTIVE: "INACTIVE",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_ROLE = {
  BASIC_USER: "BasicUser",
  TEAM_LEAD: "TeamLead",
  OPERATIONS_LEAD: "OperationsLead",
  ADMIN: "Admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const QUALIFICATION_STATUS = {
  ACTIVE: "ACTIVE",
  IN_TRAINING: "IN_TRAINING",
  EXPIRED: "EXPIRED",
} as const;

export type QualificationStatus = (typeof QUALIFICATION_STATUS)[keyof typeof QUALIFICATION_STATUS];

export const ASSIGNMENT_ROLE = {
  PRIMARY: "PRIMARY",
  BACKUP: "BACKUP",
  ON_CALL: "ON_CALL",
} as const;

export type AssignmentRole = (typeof ASSIGNMENT_ROLE)[keyof typeof ASSIGNMENT_ROLE];

export const SHIFT_STATUS = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  FINAL: "FINAL",
} as const;

export type ShiftStatus = (typeof SHIFT_STATUS)[keyof typeof SHIFT_STATUS];

export type CoverageStatus = "green" | "yellow" | "red";

export interface CoverageDetails {
  status: CoverageStatus;
  requiredPrimary: number;
  assignedPrimary: number;
  requiredBackup: number;
  assignedBackup: number;
  requiredQualifications: string[];
  missingQualifications: string[];
  message: string;
}

export interface CoverageGap {
  shiftInstanceId: string;
  date: number;
  shiftType: string;
  details: CoverageDetails;
}

export const CALLOUT_STATUS = {
  PENDING: "PENDING",
  REPLACED: "REPLACED",
  UNFILLED: "UNFILLED",
} as const;

export type CalloutStatus = (typeof CALLOUT_STATUS)[keyof typeof CALLOUT_STATUS];

export const PTO_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DENIED: "DENIED",
} as const;

export type PTOStatus = (typeof PTO_STATUS)[keyof typeof PTO_STATUS];

export const SHIFT_PREFERENCE = {
  DAY: "DAY",
  NIGHT: "NIGHT",
  BOTH: "BOTH",
} as const;

export type ShiftPreference = (typeof SHIFT_PREFERENCE)[keyof typeof SHIFT_PREFERENCE];




