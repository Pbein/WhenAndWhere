Okay, let’s zoom out and figure out what this thing absolutely has to do to be a real, working scheduling app — not just a pretty calendar.

I’ll break it into:

Core concepts / data model (what the app needs to represent)

Core workflows (what users need to do)

Main pages / views (what screens we actually need)

Shift/slot model (how Panama + custom blocks actually work)

Assignment UX (how Team Leads interact with the calendar)

Coverage & gap detection (how we know we’re “green”)

At the end I’ll give you a clean bullet list you can feed into Cursor as the “checklist.”

1. Core concepts / data model (must-haves)

These are the building blocks. If we don’t model these cleanly, everything else becomes a hack.

1.1 Missions

Represents a “thing that needs 24/7 coverage”: Lion, Seal, Panda.

Each Mission has:

Name, description.

Timezone.

Default shift types (Day 07–19, Night 19–07, etc.).

Coverage rules (e.g., min 2 people on at all times, maybe min 1 “Panda-certified”).

1.2 Crews / Teams

A Crew is a group of employees that rotate together (Crew A, Crew B, etc.).

Crews are associated with a mission (Crew A – Panda).

In a Panama schedule, there are typically 4 crews per mission.

1.3 Employees / Users

Each employee/user has:

Basic identity (name, email).

Role in the app: BasicUser, TeamLead, OperationsLead.

Which missions they’re allowed to work on.

Which crews they’re part of (could be multiple).

Qualifications (e.g., Panda-certified, Trainer, In-Training).

Status flags (active, on-leave, etc.).

1.4 Schedule Templates & Shift Schedules

We need two distinct but related pieces:

Schedule Template (pattern level)

Defines the general pattern: Panama 2-2-2-3 for a 4-crew mission.

Encodes which crews are on/off on which days and on which shift (Day/Night).

Doesn’t know about specific employees yet — just “Crew A on Day for these days.”

Shift Schedule / Generated Shifts (instance level)

Actual shift slots generated over a date range:

Mission + date + time window (start/end) + shift type (Day/Night or custom).

Crew responsible (if using crew-based assignment).

Coverage requirement (e.g., 2 slots to fill).

This is where we see a concrete calendar of “slots” to fill.

1.5 Shift Slots / Shift Assignments

Shift Slot (aka a shift instance):

A single time block that needs 1 or more people.

Fields:

missionId

startDateTime, endDateTime

shiftType (e.g., “Day”, “Night”, or “Custom”)

crewId (optional; which crew owns it, for Panama)

requiredCount (e.g., 2)

maybe required qualification tags.

Shift Assignment:

Connection between a shift slot and an employee.

Fields:

shiftSlotId

employeeId

role: PRIMARY / BACKUP / ON_CALL

status: assigned, removed, etc.

1.6 Availability / PTO / Callouts

PTO / Unavailability:

Employee-level records marking them unavailable for a date/time range.

Approved or pending (Team Lead handles approval).

Call-out:

Real-time “this employee can’t make this shift.”

Marks that particular shift assignment as unavailable and creates a coverage gap that needs a replacement.

1.7 Qualifications / Eligibility

Each employee has 0+ qualifications.

Each mission or shift slot can specify required or preferred qualifications.

“Panda mission – must have (Panda-certified OR Panda-in-training) as primary, everyone else is fallback.”

2. Core workflows (what the app actually has to support)

Think of what a Team Lead and Ops Lead actually do on a daily/weekly basis.

2.1 Setup / Configuration

Admin/Team Lead sets up:

Missions (Lion, Seal, Panda).

Mission default shift types (Day 07–19, Night 19–07).

Crews for each mission (Crew A–D).

The Panama 2-2-2-3 template (pattern of ON/OFF days per crew).

Employees: which missions they can work, what crews they’re in, their qualifications.

2.2 Generate a Schedule from a Template

Team Lead selects:

Mission (e.g., Panda).

Template (Panama 2-2-2-3, Day/Night pattern).

Date range (e.g., next 2 or 4 weeks).

System:

Generates shift slots for each day:

For each crew, whether they’re ON/OFF.

For each ON day, create shift slots (Day, Night) as needed.

Optionally also allow extra custom slots (e.g., 09–13 training block, or partial coverage).

2.3 Assign Crews / Employees to Slots

Two possible flows (you might support both):

Crew-first approach:

Template ties slots to Crew A/B/C/D.

Then the Team Lead assigns individual employees to each crew.

Helpful if crews are pretty stable.

Person-first approach:

Template just generates generic “Day slots” and “Night slots.”

Team Lead assigns employees directly to each slot.

The app must support:

Quickly finding eligible employees.

Swapping employees.

Adding backups/on-call for each slot.

2.4 Handle PTO & Call-outs

Employee requests PTO → Team Lead approves it.

Approved PTO blocks that employee from being assigned to slots during that time.

If PTO is approved after they’re already scheduled, system marks those slots as “conflicted”, prompting a replacement.

Day-of call-out:

Team Lead clicks a shift, marks “call-out.”

System highlights gap and surfaces replacement candidates (filtered & sorted).

2.5 Approve & Share Schedule

Once Team Lead is happy with coverage for a mission/date range:

Mark schedule as “ready for review.”

Ops Lead:

Views mission schedule (month or multi-week).

Confirms there are no coverage gaps (visual green/no warnings).

Approves schedule.

Schedule becomes official & visible to all crew.

3. Main pages / views the app needs

Now: what screens do we actually need to make all that happen?

3.1 Auth & Role-Based Shell

Login page

App shell:

Left navigation pane.

Top bar with mission selector, user info.

Content area that changes based on page.

Role-based:

BasicUser: sees “My Schedule,” maybe read-only mission schedule.

TeamLead: sees mission management & scheduling tools.

OpsLead: sees overview dashboards + approval views.

3.2 Dashboard

Purpose: quick situational awareness.

For TeamLead:

Summary by mission:

of unassigned shift slots upcoming.
of PTO requests pending.

Any “coverage gaps” warnings in next X days.

For OpsLead:

Cross-mission overview:

Which missions have pending schedules needing approval.

Which missions have uncovered slots in the next N days.

Basic health indicators per mission (green/yellow/red).

3.3 Mission Overview Page

For a given mission (Lion/Seal/Panda):

Basic info: description, crews, default shifts.

List of crews (Crew A–D).

Quick link to:

Mission schedule/calendar.

Crew management.

Template assignment.

3.4 Scheduling / Calendar Page (the heart of the app)

This is the big one. For each mission:

Views:

Month view:

Useful for big-picture coverage, weekends, holiday planning.

Week or multi-week view:

More detailed, good for editing.

How to avoid chaos with multiple crews:

Group rows logically:

Option A: Each crew is a row, days along the top → see the Panama pattern clearly.

Option B: Each employee is a row (for person-first scheduling).

Filters toggles:

Filter by crew, by shift type (Day/Night), by “only show open slots.”

Visual design:

Day shifts as one color, night shifts as another.

Missions (if multi-mission view) or roles could have icons or color accents.

Slots show:

Crew label (Crew A).

Shift label (Day 07–19).

Who is assigned (or “Unassigned”).

Interactions:

Click a shift slot → open a side panel or popover:

Show:

Current assignments (Primary, Backup, On Call).

Quick “Assign / Change” actions.

Show recommended employees list:

Priority: fully qualified for this mission.

Next: trainees.

Next: others (if allowed).

Use tags/colors for qualification level instead of one massive undifferentiated dropdown.

Add search + filters (by crew, by qualification).

Month view:

More high-level: maybe each day shows:

“Day: Crew A,B filled / gaps.”

“Night: Crew C,D filled / gaps.”

Click on a day to drill into detailed day or week view.

3.5 Template / Shift Schedule Setup Page

This is where you define how the Panama pattern actually works.

Manage Schedule Templates:

Panama 2-2-2-3 for 4 crews.

Each template encodes which crews are on/off for each day in the cycle and on which shift.

Manage Shift Types:

Day: 07:00–19:00.

Night: 19:00–07:00.

Custom blocks (e.g., 09:00–13:00).

Manage default coverage requirements for each mission/shift type:

e.g., Panda Day: min 2 people, 1 must be Panda-certified.

This page is more “once in a while” config than daily operations.

3.6 Crew & Employee Management Pages

Crew / Team page:

For each crew:

Name, mission, shift focus (Day/Night/both).

Members list.

TeamLead can:

Add/remove employees from crews.

Set “primary” crew for an employee.

Employee / Crew roster page:

Directory of all employees.

For each:

Missions they can work, crews they’re in, qualifications.

Current high-level schedule (e.g., show the next week’s assignments).

PTO status.

3.7 PTO & Call-out Management

PTO page (for the user):

Request PTO (date range, mission, reason).

See pending/approved history.

PTO admin view (for TeamLead):

List of pending PTO for their mission/team.

Approve/deny.

On approval:

See which shifts will be affected (list of conflicts).

Optionally be guided to reassign those slots.

Call-out handling integrated into calendar:

On the schedule page:

Right-click or action menu on an assignment → “Mark as call-out.”

Slot turns red/unassigned.

Side panel shows recommended replacements.

3.8 Settings / Admin

Manage roles, add new users, reset passwords (if using credentials).

Manage missions, shift types, templates.

Global settings (time zone defaults, etc.).

4. Shift & slot model (Panama + custom blocks)

You were spot-on with “slot and shift mindset”.

We need to support:

Standard Day/Night 12-hour Panama:

Day: 07:00–19:00.

Night: 19:00–07:00.

Template describes which crew is on each Day/Night across 14 days.

Custom time blocks:

Maybe some shifts are 09:00–17:00, or 06:00–12:00, etc.

The data model must treat a shift as: startDateTime, endDateTime, missionId, crewId?, shiftType.

Conceptually:

Mission → Template → Generated Shift Slots → Assign Crew/Employees

Or more concretely:

Mission → ScheduleTemplate (Panama pattern) → ShiftSlots for a date range → ShiftAssignments (employees filling those slots)

This gives you a structured, flexible pipeline:

You can reuse templates.

You can inject custom slots into the schedule (extra coverage, training blocks).

You can always see, at the slot level, whether coverage requirements are satisfied.

5. Assignment UX (Team Lead view)

For a Team Lead to be effective, they need:

A calendar that’s not overwhelming:

Filters by crew, by shift type, by “show only unassigned slots”.

A slot detail popout:

Current assignments (Primary, Backup, On-call).

Easy button to “Add/Change” each.

A recommendations list of employees:

Filtered by:

Mission eligibility.

Not on PTO at that time.

Not assigned to overlapping shift.

Sorted by:

Qualification match (Panda-certified first).

Crew membership (their own crew first).

Displayed with:

Name, crew, qualification tags, small icons for training vs certified.

To avoid dropdown hell for 100+ people:

Use a searchable list with filters and tags instead of a single giant dropdown.

Possibly show “shortlist” first (own crew and fully qualified), with a “Show all” toggle.

6. Coverage & gap detection (zero gaps)

We must be able to confidently answer:
“Is this mission fully covered 24/7 for this period?”

So we need:

For each mission:

Defined coverage rules (e.g., min 2 people on at all times).

For each generated shift slot:

requiredCount vs assignedCount.

requiredQualifications vs assignedQualifications.

The system needs to compute:

Per-shift status:

Green: requiredCount met with qualified people.

Yellow: partially filled (some people, but not enough / not fully qualified).

Red: unassigned or missing critical qualification.

Per-day / per-mission summary:

e.g., a small indicator at top of each day in month view:

Green dot if all shifts satisfied.

Red exclamation if any gap exists.

This is what Ops Leads look at when deciding to approve.

7. Summary checklist of “main things required”

Here’s the part you’ll likely copy into your Cursor prompt as the checklist. These are the must-have components for the app to function as intended:

Core entities & relationships

Missions (Lion, Seal, Panda).

Crews/Teams per mission.

Employees/Users with:

App role (BasicUser, TeamLead, OperationsLead).

Mission eligibility & crew membership.

Qualifications.

ScheduleTemplates (Panama 2-2-2-3 pattern + others).

ShiftSlots (mission, time window, crew, required count, shift type).

ShiftAssignments (which employee is filling which slot, primary/backup/on-call).

PTO/Unavailability records.

Call-out flags.

Core workflows

Configure missions, default shifts, crews, templates.

Generate shift slots for a mission over a date range from a template.

Assign employees to shift slots (primary, backup, on-call).

Handle PTO requests and approvals, and reassign affected slots.

Handle live call-outs and find replacements.

Ops Lead reviews and approves schedules as the “official” record.

Main pages/views

Auth & role-based shell (with nav & mission selector).

Dashboard (TeamLead & OpsLead flavors).

Mission overview page.

Scheduling / Calendar page for each mission with:

Month view + week/multi-week view.

Multiple crews visible in a non-chaotic way (rows per crew / filter controls).

Slot-level clicks to open assignment popouts.

Template & shift configuration page.

Crew/Team management page.

Employee directory page with qualifications & mission eligibility.

PTO & call-out management views.

Settings/Admin page for users, missions, templates.

Shift/slot & coverage logic

Ability to define Day (07–19) and Night (19–07) shifts for Panama.

Ability to define arbitrary custom time-block shifts.

Template engine to generate slots from Panama patterns over 2+ weeks.

Coverage validation: requiredCount vs assignedCount, plus qualification checks.

Visual indicators for coverage gaps at both shift and day levels.

Assignment UX

Clean calendar UI with filters (crew, shift type, unassigned only).

Slot popout/side panel for assignment and replacement.

Smart employee list: filtered, sorted, and tagged by qualification & crew.

Support for large teams (search + filters, not one giant dropdown).