# US-3.4: Coverage Status Indicators

## User Story

**As a** Team Lead or Ops Lead  
**I want** clear visual indicators of coverage status  
**So that** I can quickly spot shifts that need attention

## Priority

P0 - Essential for usability

## Acceptance Criteria

- [ ] Green indicator for fully covered shifts
- [ ] Yellow indicator for partially covered shifts
- [ ] Red indicator for uncovered/critical gaps
- [ ] Consistent styling across all calendar views
- [ ] Accessible color contrast and icons for colorblind users
- [ ] Tooltip with details on hover

## Technical Details

### Status Types

```typescript
// lib/types.ts

export type CoverageStatus = "green" | "yellow" | "red";

export interface CoverageInfo {
  status: CoverageStatus;
  message: string;
  details?: {
    requiredPrimary: number;
    assignedPrimary: number;
    requiredBackup: number;
    assignedBackup: number;
  };
}
```

### Coverage Badge Component

```typescript
// components/schedule/coverage-badge.tsx

interface CoverageBadgeProps {
  status: CoverageStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  tooltip?: string;
}

export function CoverageBadge({ 
  status, 
  size = "sm", 
  showLabel = false,
  tooltip 
}: CoverageBadgeProps) {
  const config = {
    green: {
      bg: "bg-emerald-500",
      icon: CheckCircle,
      label: "Covered",
      ariaLabel: "Fully covered",
    },
    yellow: {
      bg: "bg-amber-500",
      icon: AlertCircle,
      label: "Partial",
      ariaLabel: "Partially covered",
    },
    red: {
      bg: "bg-red-500",
      icon: XCircle,
      label: "Gap",
      ariaLabel: "Coverage gap",
    },
  }[status];
  
  const sizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };
  
  const badge = (
    <span 
      className={cn(
        "inline-flex items-center gap-1",
        "rounded-full",
      )}
      role="status"
      aria-label={config.ariaLabel}
    >
      <span className={cn(config.bg, sizes[size], "rounded-full")} />
      {showLabel && (
        <span className="text-xs text-[#a1a1aa]">{config.label}</span>
      )}
    </span>
  );
  
  if (tooltip) {
    return (
      <Tooltip content={tooltip}>
        {badge}
      </Tooltip>
    );
  }
  
  return badge;
}
```

### Usage Examples

```tsx
// In shift cell
<CoverageBadge status="green" size="sm" />

// In month day summary
<CoverageBadge status="yellow" showLabel tooltip="Need 1 more backup" />

// In slot panel
<CoverageBadge status="red" size="lg" showLabel />
```

### Coverage Summary Component

For showing aggregated coverage info:

```typescript
// components/schedule/coverage-summary.tsx

interface CoverageSummaryProps {
  shiftId: Id<"shiftInstances">;
  compact?: boolean;
}

export function CoverageSummary({ shiftId, compact }: CoverageSummaryProps) {
  const coverage = useQuery(api.schedules.getShiftCoverageStatus, { 
    shiftInstanceId: shiftId 
  });
  
  if (!coverage) return <Skeleton />;
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <CoverageBadge status={coverage.status} />
        <span className="text-xs text-[#a1a1aa]">
          {coverage.assignedPrimary}/{coverage.requiredPrimary}
        </span>
      </div>
    );
  }
  
  return (
    <div className="coverage-summary space-y-1">
      <div className="flex items-center gap-2">
        <CoverageBadge status={coverage.status} size="md" />
        <span className="text-sm font-medium text-[#f5f5f5]">
          {coverage.message}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#a1a1aa]">
        <div>Primary: {coverage.assignedPrimary}/{coverage.requiredPrimary}</div>
        <div>Backup: {coverage.assignedBackup}/{coverage.requiredBackup}</div>
      </div>
    </div>
  );
}
```

### Color Palette

```typescript
// lib/constants.ts

export const COVERAGE_COLORS = {
  green: {
    bg: "#10b981",        // emerald-500
    bgSubtle: "#10b98120",
    border: "#059669",    // emerald-600
  },
  yellow: {
    bg: "#f59e0b",        // amber-500
    bgSubtle: "#f59e0b20",
    border: "#d97706",    // amber-600
  },
  red: {
    bg: "#ef4444",        // red-500
    bgSubtle: "#ef444420",
    border: "#dc2626",    // red-600
  },
} as const;
```

### Accessibility

- All color indicators include icons for colorblind users
- ARIA labels describe the status
- Minimum color contrast ratio of 4.5:1
- Tooltips provide detailed information

## Files Created

- `components/schedule/coverage-badge.tsx`
- `components/schedule/coverage-summary.tsx`
- `lib/constants.ts` (add coverage colors)

## Dependencies

None (but integrates with E02 Coverage API)

## Estimate

Small (S)
