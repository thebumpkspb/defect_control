export interface PChartPreviewPopupInput {
  month: string | null;
  line_name: string | null;

  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
  line_id?: number | string | null;
}

export interface PChartInput {
  month: string | null;
  line_name: string | null;
  line_id: number | string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
}

export interface PChartTableInput {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
  line_code_rx: string | null;
}

export interface PChartPreviewPopupAddRowFormData {
  date?: string; // Assuming the date is in string format (e.g., "2024-12-31"). Use `Date` if it's an actual Date object.
  partNo?: string;
  shift?: string;
  line_name?: string;
  defect_item?: number[];
  category?: string[];
  trouble?: string;
  action?: string;
  inCharge?: string;
  manager?: string;
  detectBy?: "M/C" | "Tools" | "Man"; // Union type for the radio options
  defectDetails?: string;
  rank?: "A" | "B" | "C"; // Union type for the select options
  rootCauseProcess?: "In-house" | "Supplier"; // Union type for the radio options
  processNameOrSupplierName?: string;
  cause?: string;
  newOrReoccur?: "New" | "Re-occur"; // Union type for the radio options
  id: number;
}

export interface PChartDefectBar {
  name: string;
  type: string;
  stack: string;
  data: number[];
  itemStyle: {
    color: string;
  } | null;
}
