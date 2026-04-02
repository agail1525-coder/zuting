export type {
  WaypointType,
  JourneyWaypoint,
  PatriarchMapData,
  FilterItem,
  LegendItem,
  AtlasConfig,
} from "./atlas-types";

export {
  DEFAULT_TYPE_LABELS,
  WAYPOINT_TYPE_COLORS,
  getSchoolColorFromConfig,
} from "./atlas-types";

export { default as AtlasFilterBar } from "./AtlasFilterBar";
export { default as AtlasLegend } from "./AtlasLegend";
export { default as AtlasSidePanel } from "./AtlasSidePanel";
export { default as AtlasTimeline } from "./AtlasTimeline";
export { createAtlasMapDynamic } from "./AtlasMapDynamic";
