# WhenAndWhere Zoo Scheduler
## Design Walkthrough & UX Documentation

**Version:** 1.0  
**Date:** December 2024  
**Prepared For:** Development Team Review  
**Application Type:** Role-Based Operations Scheduling System

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Application Overview](#2-application-overview)
   - [Tech Stack](#tech-stack)
   - [User Roles](#user-roles)
   - [Navigation Structure](#navigation-structure)
3. [Authentication Flow](#3-authentication-flow)
4. [Role-Based Dashboards](#4-role-based-dashboards)
5. [Mission Management](#5-mission-management)
6. [Crew and Team Management](#6-crew-and-team-management)
7. [Personnel Directory](#7-personnel-directory)
8. [Schedule Management (Core Feature)](#8-schedule-management-core-feature)
9. [Template Management](#9-template-management)
10. [PTO Management](#10-pto-management)
11. [Approvals Center](#11-approvals-center)
12. [Admin Features](#12-admin-features)
13. [Appendix](#13-appendix)

---

## 1. Introduction

### Purpose of This Document

This document provides a comprehensive visual walkthrough of the WhenAndWhere Zoo Scheduler application, designed to give your development team a complete understanding of the user experience, UI design patterns, and feature implementation. 

### Application Summary

WhenAndWhere is a sophisticated scheduling application built specifically for zoo operations that require 24/7 coverage across multiple habitats (referred to as "Missions"). The system supports complex rotation patterns like the Panama 2-2-3 schedule, crew-based assignments, qualification tracking, and PTO management with approval workflows.

### Key Features

- **Panama 2-2-3 Schedule Generation**: Automated shift creation based on configurable rotation patterns
- **Role-Based Access Control**: Four distinct user roles with appropriate permissions
- **Real-Time Updates**: Live data synchronization powered by Convex
- **Coverage Gap Detection**: Visual indicators for understaffed shifts
- **Crew-Based Assignment**: Organize employees into rotating crews with qualification tracking
- **PTO Workflow**: Request, approve, and track time off with conflict detection
- **Schedule Approval Flow**: Multi-stage review process for shift schedules

### How to Use This Document

Each section contains:
- **Context**: What the feature does and who can access it
- **Screenshot Placeholders**: Numbered locations where you'll insert screenshots
- **UI State Guidance**: Specific instructions on what to capture in each screenshot
- **UX Notes**: Key interaction patterns and user flows

---

## 2. Application Overview

### Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components

**Backend:**
- Convex (database, real-time sync, serverless functions)
- Clerk (authentication with JWT claims)

**Key Libraries:**
- date-fns (date manipulation)
- Lucide React (icons)

### User Roles

| Role | Access Level | Key Capabilities |
|------|-------------|------------------|
| **BasicUser** | Limited | View own schedule, request PTO, read-only mission views |
| **TeamLead** | Mission-level | Generate schedules, assign crew, approve team PTO, manage mission shifts |
| **OperationsLead** | Organization-wide | Cross-mission oversight, approve schedules, global PTO approval |
| **Admin** | Full system | All permissions, user management, system configuration, qualifications |

### Navigation Structure

The application uses a persistent sidebar navigation with role-based menu items:

- **Dashboard** (All roles)
- **Missions** (TeamLead+)
- **Crews** (TeamLead+)
- **Personnel** (TeamLead+)
- **Schedules** (All roles)
- **Templates** (TeamLead+)
- **PTO** (All roles)
- **Approvals** (OperationsLead+)
- **Users** (Admin only)
- **Dev Tools** (All roles - development only)

**[Screenshot 1: Sidebar Navigation with Role Indicator]**

📸 **Capture:** Full sidebar showing navigation menu items, Zoo Scheduler branding at top (🐾 icon), and role indicator at bottom showing current user's role with green dot.

**UI State:** User should be logged in as TeamLead or OperationsLead to show most menu items.

---

## 3. Authentication Flow

**Accessible to:** Unauthenticated users

The authentication system uses Clerk for secure user management with custom theming to match the application's dark design aesthetic.

### Landing Page

**[Screenshot 2: Landing Page]**

📸 **Capture:** Full landing page showing the Zoo Scheduler branding (🐾 + title), tagline, Sign In and Sign Up buttons, and feature description at the bottom.

**UI State:** Visit root URL (/) while logged out.

**UX Notes:**
- Automatic redirect to /dashboard if user is already authenticated
- Gradient background (black to dark gray)
- Large, prominent call-to-action buttons

### Sign In Page

**[Screenshot 3: Sign In Page]**

📸 **Capture:** Clerk sign-in component with custom theming - dark background, emerald green accent buttons, input fields with dark styling.

**UI State:** Navigate to /sign-in while logged out.

**UX Notes:**
- Custom Clerk appearance matches application design system
- Emerald green (#10b981) primary actions
- Dark mode color scheme throughout

### Sign Up Page

**[Screenshot 4: Sign Up Page]**

📸 **Capture:** Clerk sign-up component with same custom theming as sign-in.

**UI State:** Navigate to /sign-up while logged out.

**UX Notes:**
- New users default to "BasicUser" role
- Admins must manually promote users to higher roles after registration
- Automatic redirect to /dashboard after successful sign-up

---

## 4. Role-Based Dashboards

**URL:** `/dashboard`

The dashboard provides a personalized view based on the user's role, showing the most relevant information and pending actions.

### BasicUser Dashboard

**Accessible to:** BasicUser, TeamLead, OperationsLead, Admin

**[Screenshot 5: BasicUser Dashboard]**

📸 **Capture:** BasicUser dashboard showing "My Upcoming Shifts" card with list of assigned shifts (dates, times, mission names) and "My PTO Status" card showing PTO history with status badges.

**UI State:** Log in as BasicUser role. Ideally with some shifts assigned and PTO requests submitted.

**UX Notes:**
- Focused on personal information only
- No management or approval actions available
- Read-only view of missions and schedules

### TeamLead Dashboard

**Accessible to:** TeamLead, OperationsLead, Admin

**[Screenshot 6: TeamLead Dashboard]**

📸 **Capture:** TeamLead dashboard showing mission health grid with multiple mission cards displaying coverage status (green/yellow/red indicators), shift counts, pending PTO count, and coverage gap alerts.

**UI State:** Log in as TeamLead with assigned missions. Best captured when there are some coverage gaps or pending PTO for visual interest.

**UX Notes:**
- Mission-focused view with health indicators
- Quick access to pending actions (PTO approvals, coverage gaps)
- Color-coded status: green (good), yellow (warning), red (critical)
- Cards show unassigned shifts, pending PTO, and next 7-day coverage status

### OperationsLead Dashboard

**Accessible to:** OperationsLead, Admin

**[Screenshot 7: OperationsLead/Admin Dashboard]**

📸 **Capture:** Operations dashboard showing cross-mission overview with metric cards at top (total schedules pending approval, PTO requests, coverage alerts), mission health grid below, and pending approvals summary.

**UI State:** Log in as OperationsLead or Admin. Ideally with multiple missions and some pending approvals.

**UX Notes:**
- Organization-wide perspective across all missions
- Approval-focused workflow
- Summary metrics with icons and color coding
- Prioritizes items needing attention

### Dashboard Navigation Elements

**[Screenshot 8: Top Bar]**

📸 **Capture:** Top navigation bar showing user profile area, possibly notifications or settings icons, and Clerk user button.

**UI State:** Any authenticated page.

**UX Notes:**
- Consistent top bar across all pages
- User menu for account management and sign out
- Clean, minimal design

---

## 5. Mission Management

**URL:** `/missions` and `/missions/[id]`  
**Accessible to:** TeamLead, OperationsLead, Admin

Missions represent zoo habitats or areas that require 24/7 coverage (e.g., Lion, Seal, Panda exhibits). Each mission has crews, shift definitions, and an active schedule template.

### Missions List View

**[Screenshot 9: Missions List Page]**

📸 **Capture:** Grid of mission cards showing mission names (Lion, Seal, Panda), status badges (Active/Paused/Terminated), descriptions, and "Add Mission" button in header.

**UI State:** Navigate to /missions with several missions created.

**UX Notes:**
- Card-based grid layout (responsive: 1-3 columns)
- Clickable cards navigate to mission detail
- Color-coded status badges (green=active, amber=paused, gray=terminated)
- Hover effect shows "View details →" link

### Mission Detail Page - Overview

**[Screenshot 10: Mission Detail Page - Top Section]**

📸 **Capture:** Mission detail page header with mission name, status badge, description, and setup checklist showing completion status of required configuration steps.

**UI State:** Navigate to /missions/[specific-mission-id] for a mission that is partially configured.

**UX Notes:**
- Breadcrumb navigation (Missions / [Mission Name])
- Setup checklist prominently displayed when configuration incomplete
- Visual progress indication (checkmarks for completed steps)
- Clear call-to-action buttons for incomplete steps

### Mission Lifecycle Card

**[Screenshot 11: Mission Lifecycle Card]**

📸 **Capture:** Card showing the mission's active template selection, cycle anchor date picker, current status indicator, and cycle position progress bar.

**UI State:** Capture a mission with an active template and anchor date set.

**UX Notes:**
- Shows which schedule pattern (template) is active
- Anchor date determines where in the rotation cycle the mission starts
- Visual cycle indicator shows current position in rotation (Day 1 of 14, etc.)
- Status controls for pausing/resuming mission operations

### Mission Status Actions

**[Screenshot 12: Mission Status Actions]**

📸 **Capture:** Action buttons for mission lifecycle management - "Pause Mission", "Resume Mission" (depending on state), and "Terminate Mission" button.

**UI State:** Capture an active mission showing the pause/terminate options.

**UX Notes:**
- Destructive actions (terminate) have warning colors and confirmation dialogs
- Status-dependent buttons (can't pause if already paused)
- Clear visual distinction between reversible (pause) and permanent (terminate) actions

### Crews and Shift Definitions

**[Screenshot 13: Crews Card and Shift Definitions Card]**

📸 **Capture:** Two-column layout showing "Crews" card on left (listing assigned crews with member counts) and "Shift Definitions" card on right (showing Day/Night shift times and coverage requirements).

**UI State:** Mission with multiple crews and standard shift definitions configured.

**UX Notes:**
- Crews card shows team count and color indicators
- Shift definitions display time ranges (e.g., "Day 07:00-19:00")
- Coverage requirements shown (min PRIMARY and BACKUP counts)
- Quick action buttons to manage crews and shifts

### Create Mission Dialog

**[Screenshot 14: Create Mission Dialog]**

📸 **Capture:** Modal dialog for creating a new mission with fields for name, description, timezone, and optional color selection.

**UI State:** Click "Add Mission" button from missions list page.

**UX Notes:**
- Clean form layout with validation
- Optional fields clearly marked
- Color picker for mission branding
- Cancel and Create buttons at bottom

---

## 6. Crew and Team Management

**URLs:** `/crews`, `/teams`, `/crew/[id]`  
**Accessible to:** TeamLead, OperationsLead, Admin

Crews (also called Teams) are groups of employees that rotate together through a schedule pattern. Each crew belongs to a mission.

### Crews List Page

**[Screenshot 15: Crews List Page]**

📸 **Capture:** List of expandable crew cards showing crew names, mission associations, shift preferences, and member counts when collapsed.

**UI State:** Navigate to /crews with multiple crews created.

**UX Notes:**
- Collapsible cards conserve space
- Color-coded by crew/mission
- Shows preview info when collapsed (mission, member count)
- "Create Team" button in header

### Teams Page with Requirements Banner

**[Screenshot 16: Teams Page with Template Requirements Banner]**

📸 **Capture:** Teams page filtered to a specific mission, showing prominent banner at top indicating template crew requirements (e.g., "Panama 2-2-3 requires 4 crews"). Banner should show insufficient crew count (red/warning state).

**UI State:** Navigate to /teams?mission=[id] for a mission with a template that requires more crews than currently exist.

**UX Notes:**
- Alert/warning banner with icon (AlertTriangle or CheckCircle)
- Color-coded: red if insufficient, green if requirements met
- Clear messaging: "You have X crews, need Y crews"
- Contextual help guides user to create missing crews

### Crew Card - Expanded View

**[Screenshot 17: Crew Card - Expanded with Members]**

📸 **Capture:** Single crew card expanded to show full list of members with avatars (initials), names, qualifications badges, and "Add Member" button.

**UI State:** Click to expand any crew card that has multiple members.

**UX Notes:**
- Member list shows qualifications as small badges
- Primary crew member indicated with star (★) icon
- Remove member action available for each
- Qualification status color-coded (green=active, amber=training)

### Add Member Dialog

**[Screenshot 18: Add Member to Crew Dialog]**

📸 **Capture:** Modal dialog with searchable/filterable list of employees, showing employee names, current crews, qualifications, with ability to mark as primary crew.

**UI State:** Click "Add Member" from an expanded crew card.

**UX Notes:**
- Search functionality for large employee lists
- Shows employee context (existing crews, qualifications)
- "Primary crew" checkbox option
- Visual indication of employees already in other crews

### Create Team Dialog

**[Screenshot 19: Create Team Dialog]**

📸 **Capture:** Modal dialog for creating new team with fields for team name, mission selection (dropdown), description, shift preference (Day/Night/Both), and optional color.

**UI State:** Click "Create Team" button from crews or teams page.

**UX Notes:**
- Mission dropdown shows all active missions
- Shift preference helps with assignment suggestions
- Color picker for visual distinction
- Form validation on required fields

---

## 7. Personnel Directory

**URL:** `/personnel`  
**Accessible to:** TeamLead, OperationsLead, Admin

Comprehensive directory of all staff members with advanced filtering and two view modes.

### Personnel List View (Table Mode)

**[Screenshot 20: Personnel Directory - Table View]**

📸 **Capture:** Full-width table showing employee rows with columns: Name (with avatar), Role, Status, Qualifications (badges), Crews (color dots), and PTO status. Include filter bar at top with search box and dropdowns.

**UI State:** Navigate to /personnel with "Everyone" view selected and multiple users in system.

**UX Notes:**
- Sortable columns (click headers to sort)
- Avatar circles with initials
- Inline badges for qualifications (max 3 shown, "+X more")
- Crew indicators with color dots and names
- PTO status badges (pending/approved counts)
- Click rows to navigate to employee detail

### Personnel By-Role View (Card Mode)

**[Screenshot 21: Personnel Directory - By Role View]**

📸 **Capture:** Grid layout with separate cards for each role category (Administrators, Operations Leads, Team Leads, Staff Members), each card showing count badge and scrollable list of members.

**UI State:** Click "By Role" view toggle button.

**UX Notes:**
- Grouped by role hierarchy
- Compact card format for each employee
- Shows essential info: name, status, qualifications, crews
- Scrollable within each role category
- Count badges show members per role

### Personnel Filters and Search

**[Screenshot 22: Personnel Filters - Active State]**

📸 **Capture:** Close-up of filter bar showing search input (with text entered), role dropdown (with selection), status filter, qualification filter, and mission filter all active. Show "Clear Filters" button and result count.

**UI State:** Apply multiple filters to demonstrate filtering capability.

**UX Notes:**
- Real-time search (filters as you type)
- Multiple simultaneous filters
- Result count updates dynamically
- "Clear Filters" button appears when any filter is active
- Filters persist across view mode switching

---

## 8. Schedule Management (Core Feature)

**URL:** `/schedules`  
**Accessible to:** All roles (with different permission levels)

The schedule management interface is the heart of the application, where Team Leads assign crew members to shifts and monitor coverage.

### Schedule Page Overview

**[Screenshot 23: Schedule Page - Full Layout]**

📸 **Capture:** Complete schedule page showing mission selector dropdown at top, date navigation controls, week/month view toggle, schedule status bar, filter bar, and week grid below with slot panel closed.

**UI State:** Navigate to /schedules, select a mission with generated schedule.

**UX Notes:**
- Three-tier header: mission selector, status bar, filters
- Mission selector dropdown shows all active missions
- Date navigation: prev/next arrows and "Today" button
- View toggle: Week vs Month
- "Extend Schedule" button for generating more shifts

### Week View - Enhanced Grid

**[Screenshot 24: Week View - Crews as Rows]**

📸 **Capture:** Week grid showing crews as rows (Crew A, B, C, D) and dates as columns, with shift cells showing Day/Night labels, assigned employee names, and coverage badges (green/yellow/red).

**UI State:** Week view for a mission with 4 crews on a Panama pattern, showing mix of filled and partially filled shifts.

**UX Notes:**
- Crew-based rows make rotation patterns visible
- Date columns (Sunday-Saturday)
- Shift cells show shift type (Day/Night), time, and assigned employees
- Coverage badges: green (fully staffed), yellow (partial), red (empty)
- Clickable cells open slot panel
- Alternating cell backgrounds for readability

### Month View - Coverage Indicators

**[Screenshot 25: Month View]**

📸 **Capture:** Calendar month view with each day showing high-level summary: day/night shift indicators, coverage status dots, and click-to-drill-down affordance.

**UI State:** Switch to Month view for a mission with generated schedule.

**UX Notes:**
- Traditional calendar grid layout
- Each day cell shows:
  - Date number
  - Day shifts summary (Crew letters or coverage status)
  - Night shifts summary
  - Visual coverage indicators (green dot = covered, red = gaps)
- Click day to switch to week view for that date
- Navigation arrows for previous/next month

### Filter Bar

**[Screenshot 26: Schedule Filter Bar]**

📸 **Capture:** Filter controls showing crew multi-select chips, shift type dropdown (All/Day/Night), and "Show Gaps Only" toggle switch.

**UI State:** Activate some filters to show the UI in use.

**UX Notes:**
- Crew filter: multi-select with color-coded chips
- Shift type: dropdown filter
- "Gaps Only" toggle: shows only understaffed shifts
- Filters apply immediately to grid
- Clear visual feedback for active filters

### Schedule Status Bar

**[Screenshot 27: Schedule Status Bar]**

📸 **Capture:** Status bar showing how far the schedule has been generated (e.g., "Schedule generated through February 15, 2025") with visual indicator and "Extend Schedule" button.

**UI State:** Show a mission with schedule generated for limited time period.

**UX Notes:**
- Shows last generated date
- Warning if schedule doesn't extend far enough
- Quick access to extend schedule function
- Visual calendar icon or progress indicator

### Shift Cell States

**[Screenshot 28: Shift Cell - Different States]**

📸 **Capture:** Arrange to show multiple shift cells side-by-side or in close proximity demonstrating different states:
- Fully staffed (green badge, 2 employees listed)
- Partially staffed (yellow badge, 1 of 2 employees)
- Unstaffed (red badge, "Unassigned")
- Past shift (grayed out)

**UI State:** Find or create schedule data showing these various states.

**UX Notes:**
- Color-coded coverage badges (green/yellow/red)
- Employee names shown in cell
- Role indicators (PRIMARY/BACKUP)
- Visual distinction for past dates (reduced opacity)
- Hover effect shows interactive affordance

### Slot Panel - Assignment Details

**[Screenshot 29: Slot Panel - Open]**

📸 **Capture:** Right-side panel opened showing detailed shift information: date/time, shift type, coverage status, current assignments (PRIMARY and BACKUP sections), and action buttons for assigning/removing employees.

**UI State:** Click any shift cell in week view to open slot panel.

**UX Notes:**
- Slides in from right side
- Shift details at top (date, time, mission, crew)
- Coverage status prominently displayed
- Assignments grouped by role (PRIMARY/BACKUP)
- "Assign" buttons for empty slots
- "Change" and "Remove" actions for filled slots
- Close button (X) and ESC key support

### Employee Picker - Eligible Replacements

**[Screenshot 30: Employee Selection List in Slot Panel]**

📸 **Capture:** Slot panel showing the employee picker/selector with searchable list of eligible employees, each showing name, qualifications badges, crew membership, and availability indicators.

**UI State:** Click "Assign" button in slot panel to show employee picker.

**UX Notes:**
- Filtered list: shows only eligible employees
- Prioritized sorting:
  - Mission qualifications first
  - Same crew members prioritized
  - Availability checked (no PTO conflicts)
- Search box at top
- Qualification badges for each employee
- Visual indicators for training vs. certified
- Click employee to assign

### Extend Schedule Modal

**[Screenshot 31: Extend Schedule Modal Dialog]**

📸 **Capture:** Modal dialog for extending schedule generation with date picker for "extend through" date, summary of shifts that will be generated, and confirmation buttons.

**UI State:** Click "Extend Schedule" button from schedule page or mission detail.

**UX Notes:**
- Date picker to select end date
- Preview/estimate of shifts to be generated
- Warning if extending too far (performance consideration)
- Cancel and Confirm buttons
- Shows last generated date for context

### Coverage Badge States

**[Screenshot 32: Coverage Badge Examples]**

📸 **Capture:** Close-up view showing the three coverage badge states with labels:
- Green badge: "2/2 FILLED"
- Yellow badge: "1/2 PARTIAL"  
- Red badge: "0/2 EMPTY"

**UI State:** Find or arrange cells showing each badge state.

**UX Notes:**
- Color-coded for quick visual scanning
- Shows filled count vs required count
- Consistent placement in shift cells
- Used in both week and month views

---

## 9. Template Management

**URL:** `/templates`  
**Accessible to:** TeamLead, OperationsLead, Admin

Templates define rotation patterns (like Panama 2-2-3) that generate shift schedules. Each template specifies which crews work which shifts on which days of the cycle.

### Templates List Page

**[Screenshot 33: Templates Page with Presets]**

📸 **Capture:** Templates page showing "Quick Start with Presets" card at top with preset buttons (Panama 2-2-3, Simple 4-Crew, Custom), and grid of existing template cards below.

**UI State:** Navigate to /templates with a few templates created.

**UX Notes:**
- Preset buttons for common patterns
- Template cards show key info: name, cycle length, usage count
- Visual pattern preview on cards
- "Create Pattern" button in header
- Cards indicate which missions use each template

### Template Card

**[Screenshot 34: Template Card - Detailed View]**

📸 **Capture:** Single template card showing template name, description, pattern summary (e.g., "14-day cycle, 12-hour shifts"), pattern preview grid, "View Pattern" and "Edit" buttons, and "Used by" section listing missions.

**UI State:** Show a template that's actively used by at least one mission.

**UX Notes:**
- Compact pattern visualization
- Usage indicator (which missions use this template)
- Can't delete templates that are in use
- Quick actions: View, Edit, Delete (if unused)
- Color-coded pattern preview (Off/Day/Night)

### Create/Edit Template Dialog

**[Screenshot 35: Template Form Dialog]**

📸 **Capture:** Modal dialog for creating/editing template with fields for name, description, cycle days, shift length hours, and note about configuring pattern separately.

**UI State:** Click "Create Pattern" button.

**UX Notes:**
- Basic metadata entry first
- Pattern editing is separate step (see next screenshot)
- Validation on numeric fields
- Info text explains what each field means
- Save button creates template, then opens pattern editor

### Pattern Builder - Visual Grid Editor

**[Screenshot 36: Pattern Editor Dialog - Grid Interface]**

📸 **Capture:** Large modal showing pattern editor with grid layout: days (1-14) as columns, crews (A-D) as rows, cells showing Off/Day/Night states with color coding and click-to-cycle functionality.

**UI State:** Open pattern editor for a template, showing partially configured Panama pattern.

**UX Notes:**
- Interactive grid: click cells to cycle through states
- Three states: OFF (gray), DAY (yellow/orange), NIGHT (blue/purple)
- Grid clearly shows rotation pattern visually
- Save/Cancel buttons
- Preview panel shows pattern summary
- Helps visualize the 2-2-3 rotation

### Pattern Preview - Read-Only

**[Screenshot 37: Pattern Preview - Read-Only View]**

📸 **Capture:** Compact read-only pattern visualization showing the complete cycle, possibly in the template card or a quick-view modal.

**UI State:** Click "View Pattern" on a template card.

**UX Notes:**
- Non-editable visualization
- Same color coding as editor
- Shows complete cycle at a glance
- Helps users understand pattern before selecting for mission
- Close button to dismiss

---

## 10. PTO Management

**URL:** `/pto`  
**Accessible to:** All roles (different views based on role)

PTO (Paid Time Off) management includes requesting time off, approval workflows, and conflict detection with scheduled shifts.

### PTO Page - My Requests

**[Screenshot 38: PTO Page - Employee View]**

📸 **Capture:** PTO page showing two sections: "My Requests" card on left listing employee's own PTO requests with dates, status badges (Pending/Approved/Denied), and "Pending Approvals" card on right (if user is TeamLead+).

**UI State:** Navigate to /pto as a BasicUser with some PTO requests submitted.

**UX Notes:**
- Two-column layout
- My Requests: chronological list with status badges
- Date ranges shown (e.g., "Jan 15 - Jan 18")
- Optional reason text
- "New Request" button in header

### PTO Pending Approvals (For Leads)

**[Screenshot 39: PTO Pending Approvals Section]**

📸 **Capture:** Close-up of "Pending Approvals" card showing PTO requests awaiting approval with employee names (or IDs), date ranges, and Approve/Deny buttons for each request.

**UI State:** View as TeamLead or OperationsLead with pending PTO requests to review.

**UX Notes:**
- Only visible to TeamLead, OperationsLead, Admin
- Shows requester information
- Date ranges prominent
- Inline Approve/Deny actions
- Quick approval workflow

### New PTO Request Flow

**[Screenshot 40: New PTO Request Dialog]**

📸 **Capture:** Modal dialog for submitting PTO request with date pickers for start/end dates, optional reason text area, and submit button.

**UI State:** Click "New Request" button from PTO page. (Note: current implementation shows simple form - capture this or create enhanced dialog if implemented)

**UX Notes:**
- Date range selection
- Optional reason/notes field
- Validation: end date must be after start date
- Shows employee's remaining PTO balance (if tracked)
- Conflict warning if overlaps with scheduled shifts

---

## 11. Approvals Center

**URL:** `/approvals`  
**Accessible to:** OperationsLead, Admin

Centralized hub for Operations Leads to approve schedules and review pending items across all missions.

### Approvals Page - Summary Cards

**[Screenshot 41: Approvals Page Overview]**

📸 **Capture:** Approvals page showing summary metric cards at top (Schedule Approvals count, PTO Requests count) with icons and counts, followed by detailed tables below.

**UI State:** Navigate to /approvals as OperationsLead with some pending items.

**UX Notes:**
- Summary metrics with icons (CheckSquare, Clock)
- Color-coded cards (amber for schedules, blue for PTO)
- Large numbers show pending counts
- Quick visual overview of workload

### Pending Approvals Tables

**[Screenshot 42: Schedule and PTO Approval Tables]**

📸 **Capture:** Two detailed tables/cards: "Schedule Approvals" table showing missions with pending schedules (mission name, date range, submitted by, approve/reject buttons) and "Pending PTO Requests" table below showing similar info for PTO.

**UI State:** Show with several items in each table for demonstration.

**UX Notes:**
- Schedule approvals show: mission, date range, who submitted, when
- PTO approvals show: employee, date range, reason, action buttons
- Inline approval actions (don't need to navigate away)
- Visual distinction between schedule and PTO approvals
- Recent items shown first

---

## 12. Admin Features

**URL:** `/admin/users`, `/admin/qualifications`  
**Accessible to:** Admin only

Administrative functions for user management and system configuration.

### User Management Table

**[Screenshot 43: Admin Users Page]**

📸 **Capture:** User management page showing table of all users with columns: Name, Email, Role (badge), and Actions (role dropdown selector). Show admin changing someone's role using the dropdown.

**UI State:** Navigate to /admin/users as Admin role.

**UX Notes:**
- Complete user list in table format
- Role badges for current role
- Dropdown to change roles inline
- No delete user function (users are deactivated, not deleted)
- Clean, administrative interface

### Qualifications Management

**[Screenshot 44: Qualifications Admin Page]**

📸 **Capture:** Qualifications administration page showing list of qualifications with names, descriptions, mission associations, and edit/delete actions. Include "Create Qualification" dialog if possible.

**UI State:** Navigate to /admin/qualifications (if accessible via dev tools or direct URL, as it may not be in main nav).

**UX Notes:**
- System-wide qualifications management
- Can be global or mission-specific
- CRUD operations: Create, Edit, Delete
- Shows which users have each qualification
- Basis for shift assignment eligibility

---

## 13. Appendix

### Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `ESC` | Close slot panel | Schedule page |
| `Arrow Keys` | Navigate dates | Schedule page (future enhancement) |
| `/` | Focus search | Personnel page (future enhancement) |

### Status & Color Legend

#### Coverage Status
- 🟢 **Green Badge**: Fully staffed (all required positions filled)
- 🟡 **Yellow Badge**: Partially staffed (some positions filled)
- 🔴 **Red Badge**: Unstaffed (no assignments)

#### Mission Status
- 🟢 **Active**: Mission is operational and generating schedules
- 🟡 **Paused**: Temporarily suspended (can be resumed)
- ⚫ **Terminated**: Permanently closed (cannot be resumed)

#### PTO Status
- 🟡 **Pending**: Awaiting approval from TeamLead or OpsLead
- 🟢 **Approved**: Time off granted
- 🔴 **Denied**: Request rejected

#### User Status
- 🟢 **Active**: Currently working
- 🟡 **On Leave**: Temporarily unavailable
- ⚫ **Inactive**: No longer with organization

#### Qualification Status
- 🟢 **Active**: Fully qualified
- 🟡 **In Training**: Learning, not yet certified
- 🔴 **Expired**: Needs recertification

### Glossary of Terms

**Anchor Date**: The starting date for a schedule template's rotation cycle. Determines which day of the pattern corresponds to which calendar date.

**Assignment**: The connection between an employee and a shift slot. Can be PRIMARY, BACKUP, or ON_CALL.

**Coverage**: Whether a shift has enough qualified employees assigned to meet minimum requirements.

**Crew / Team**: A group of employees who rotate together through a schedule pattern (e.g., Crew A, Crew B).

**Cycle**: The repeating pattern in a schedule template (e.g., 14 days for Panama 2-2-3).

**Eligibility**: Whether an employee can work a specific mission based on qualifications and mission assignments.

**Mission**: A zoo habitat or area requiring 24/7 coverage (e.g., Lion exhibit, Seal pool).

**Panama 2-2-3**: A common 24/7 rotating shift pattern with 4 crews working 2 days on, 2 days off, 3 days on, 2 days off, 2 days on, 3 days off, cycling every 28 days (14-day pattern × 2).

**Pattern**: The visual representation of which crews work which shifts on which days in a template.

**Qualification**: A certification or skill required for specific missions (e.g., "Panda-certified", "First Aid").

**Shift Definition**: The time parameters for a shift type (e.g., Day shift: 07:00-19:00).

**Shift Instance / Shift Slot**: A specific scheduled shift on a specific date that needs employees assigned.

**Slot Panel**: The right-side panel that opens when clicking a shift cell, showing assignment details.

**Template**: A reusable schedule pattern that can be applied to missions (e.g., Panama 2-2-3 template).

### Design System Notes

#### Colors
- **Background**: #0a0a0a (near black)
- **Card Background**: #111111 to #1a1a1a (dark gray)
- **Borders**: #2a2a2a (medium gray)
- **Text Primary**: #f5f5f5 (off-white)
- **Text Secondary**: #a1a1aa (gray)
- **Primary Action**: #10b981 (emerald green)
- **Primary Hover**: #059669 (darker emerald)

#### Typography
- **Font Family**: System fonts (Inter-like stack)
- **Headings**: Semibold weight
- **Body**: Regular weight
- **Small Text**: 0.875rem (14px) or 0.75rem (12px)

#### Component Patterns
- **Cards**: Dark background with subtle border, rounded corners
- **Buttons**: Emerald green primary, outline variant for secondary
- **Badges**: Small, rounded pills with color-coded backgrounds
- **Modals**: Centered overlays with dark backdrop
- **Tables**: Alternating row backgrounds for readability

---

## Notes for Screenshot Collection

### Recommended Order for Taking Screenshots

1. Start with authentication flow (logged out)
2. Log in as **BasicUser** → capture BasicUser dashboard
3. Admin changes your role to **TeamLead** → capture TeamLead dashboard and features
4. Create test data (missions, crews, templates) as you go
5. Generate a schedule and capture schedule management screenshots
6. Admin changes your role to **OperationsLead** → capture OpsLead dashboard and approvals
7. Admin changes your role to **Admin** → capture admin pages
8. Return to capture any detail views or dialogs

### Tips for Best Screenshots

- **Use consistent window size**: Recommend 1920×1080 or 1440×900
- **Show realistic data**: Use real-sounding names (not "Test User 1")
- **Capture meaningful states**: Show partial completion, not empty or fully complete
- **Include visual interest**: Coverage gaps, pending items, multiple missions
- **Avoid sensitive info**: Use generic zoo habitat names, dummy emails
- **Show UI in use**: Hover states, open dialogs, selected items where relevant

### Screenshot Naming Convention

Suggest naming files: `screenshot-[number]-[description].png`

Example: `screenshot-23-schedule-page-full-layout.png`

---

## Document Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | December 2024 | Initial walkthrough document created | - |

---

**End of Document**

Total Screenshots: 44 (numbered 1-44 throughout document)

