interface DefectType {
  value: string;
  hasDefectMode: boolean;
}

const defectType: DefectType[] = [
  {
    value: "Repeat",
    hasDefectMode: true,
  },
  {
    value: "Repeat NG",
    hasDefectMode: true,
  },
  {
    value: "Scrap",
    hasDefectMode: true,
  },
  {
    value: "Appearance",
    hasDefectMode: true,
  },
  {
    value: "Dimension",
    hasDefectMode: true,
  },
  {
    value: "Performance",
    hasDefectMode: true,
  },
  {
    value: "Other",
    hasDefectMode: true,
  },
  { value: "M/C Set up", hasDefectMode: true },
  { value: "Quality Test", hasDefectMode: true },
];
const defectTypeOutline: DefectType[] = [
  {
    value: "B-2",
    hasDefectMode: true,
  },
  {
    value: "Local",
    hasDefectMode: true,
  },
  {
    value: "CKD",
    hasDefectMode: true,
  },
  {
    value: "Sub Assy Line",
    hasDefectMode: true,
  },
  {
    value: "Store / Warehouse",
    hasDefectMode: true,
  },
];
interface TargetType {
  value: string;
}

const targetType: TargetType[] = [
  { value: "Monthly" },
  { value: "Fiscal Year" },
];

interface ProcessType {
  value: string;
}

const processType: ProcessType[] = [
  { value: "Inline" },
  { value: "Outline" },
  { value: "Inspection" },
];

// ------------- PChart ----------------

interface DetectBy {
  value: string;
}

const detectBy: DetectBy[] = [
  { value: "M/C" },
  { value: "Tools" },
  { value: "Man" },
];

interface RankType {
  value: string;
}
// interface ShiftType {
//     value: string;
// }
const rankList: RankType[] = [{ value: "A" }, { value: "B" }, { value: "C" }];
const shiftAbnormalList: ShiftType[] = [{ value: "A" }, { value: "B" }];

interface RootCauseProcess {
  value: string;
}

const rootCauseProcess: RootCauseProcess[] = [
  { value: "In-house" },
  { value: "Supplier" },
];

interface NewOrReoccurType {
  value: string;
}

const newOrReoccur: NewOrReoccurType[] = [
  { value: "New" },
  { value: "Re-occur" },
];

interface ShiftType {
  value: string;
}

const shiftList: ShiftType[] = [
  { value: "A" },
  { value: "B" },
  { value: "All" },
];

const settingMasterTypeList: string[] = [
  "organizational_target",
  "line_target",
  "defect_mode",
];

const settingTargetLevel: string[] = [
  "Division",
  "Department",
  "Section",
  //   "Line",
];

export {
  defectType,
  targetType,
  processType,
  detectBy,
  rankList,
  shiftAbnormalList,
  rootCauseProcess,
  newOrReoccur,
  shiftList,
  settingMasterTypeList,
  settingTargetLevel,
  defectTypeOutline,
};
export type {
  DefectType,
  TargetType,
  ProcessType,
  DetectBy,
  RankType,
  RootCauseProcess,
  NewOrReoccurType,
  ShiftType,
};
