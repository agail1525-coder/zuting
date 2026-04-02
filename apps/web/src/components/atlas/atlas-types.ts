// ═══════════════════════════════════════════════════════════════════════════
// 共享Atlas引擎 — 类型定义
// Shared Atlas Engine — Type Definitions
// ═══════════════════════════════════════════════════════════════════════════

export type WaypointType =
  | "birth"
  | "ordination"
  | "dharma"
  | "teaching"
  | "founding"
  | "pilgrimage"
  | "exile"
  | "death"
  | "other";

export interface JourneyWaypoint {
  lat: number;
  lng: number;
  year: number | null;
  yearEnd?: number;
  event: string;
  eventEn: string;
  type: WaypointType;
}

export interface PatriarchMapData {
  name: string;
  nameEn: string;
  school: string;
  primaryLat: number;
  primaryLng: number;
  journeyWaypoints: JourneyWaypoint[];
}

export interface FilterItem {
  key: string;
  name: string;
  color: string;
}

export interface LegendItem {
  name: string;
  color: string;
}

export interface AtlasConfig {
  religionKey: string;
  title: string;
  subtitle: string;
  themeColor: string;
  backUrl: string;
  detailUrlPrefix: string;
  defaultCenter: [number, number];
  defaultZoom: number;
  filters: FilterItem[];
  legendItems: LegendItem[];
  schoolColors: Record<string, string>;
  typeLabels: Record<WaypointType, string>;
  overseasSchools?: string[];
  emptyJourneyText?: string;
  emptyJourneySubtext?: string;
  loadingText?: string;
}

// Default Buddhist type labels
export const DEFAULT_TYPE_LABELS: Record<WaypointType, string> = {
  birth: "出生",
  ordination: "剃度",
  dharma: "得法",
  teaching: "弘法",
  founding: "开山",
  pilgrimage: "行脚",
  exile: "隐修",
  death: "圆寂",
  other: "事件",
};

export const WAYPOINT_TYPE_COLORS: Record<WaypointType, string> = {
  birth: "#22c55e",
  ordination: "#3b82f6",
  dharma: "#eab308",
  teaching: "#C4A265",
  founding: "#C4A265",
  pilgrimage: "#a855f7",
  exile: "#64748b",
  death: "#6b7280",
  other: "#94a3b8",
};

export function getSchoolColorFromConfig(
  school: string,
  schoolColors: Record<string, string>,
  fallback: string = "#C4A265"
): string {
  return schoolColors[school] || fallback;
}
