// Calendar components
export { EnhancedWeekGrid } from "./enhanced-week-grid";
export { MonthView } from "./month-view";
export { ShiftCell, EmptyShiftCell } from "./shift-cell";
export { WeekGridHeader } from "./week-grid-header";
export { WeekGridRow } from "./week-grid-row";

// Assignment components
export { SlotPanel } from "./slot-panel";
export { EmployeeList } from "./employee-list";
export { AssignmentSection } from "./assignment-section";

// Coverage components
export { CoverageBadge } from "./coverage-badge";
export type { CoverageStatus } from "./coverage-badge";
export { CoverageSummary } from "./coverage-summary";

// Page components
export { ScheduleHeader } from "./schedule-header";
export { ScheduleStatus } from "./schedule-status";
export { ExtendScheduleModal } from "./extend-schedule-modal";
export { FilterBar, DEFAULT_FILTERS } from "./filter-bar";
export type { ScheduleFilters as FilterState } from "./filter-bar";

// Context and hooks
export { ScheduleProvider, useSchedule } from "./schedule-context";
export type { ViewMode, ScheduleFilters } from "./schedule-context";
export { useCalendarNavigation } from "./hooks/use-calendar-navigation";
export { useShiftSelection } from "./hooks/use-shift-selection";
