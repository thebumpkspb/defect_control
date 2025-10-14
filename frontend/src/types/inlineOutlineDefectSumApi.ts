import { inlineOutlineCauseOfAbnormal } from "@/lib/api";

export interface DefaultDefectSummaryResult {
  month: string;
  department: string[];
  section: string[];
  line: string[];
  target_percent: number;
  defect_percent: number;
  defect_status: boolean;
  total_defect: number;
  scrap_qty: number;
  scrap_percent: number;
  repeat_qty: number;
  repeat_percent: number;
  graph_yearly_defect_summary: GraphYearlyDefectSummary;
  graph_monthly_defect_summary: GraphMonthlyDefectSummary;
  graph_daily_defect_summary: GraphDailyDefectSummary;
  graph_defect_summary_by_type: GraphDefectSummaryByType;
  abnormal_occurrence_table: AbnormalOccurrenceTable[];
  defect_pareto_chart: DefectParetoChartType;
  description_of_defect: DescriptionOfDefect[];
}

export interface GraphYearlyDefectSummary {
  axis_x: string[];
  target_percent: number[];
  defect_percent: number[];
  defect_qty: DefectQty[];
}
export interface GraphYearlyDefectProcessSummary {
  inline: GraphYearlyDefectSummary;
  outline: GraphYearlyDefectSummary;
  inspection: GraphYearlyDefectSummary;
}
export interface DefectQty {
  name: string;
  qty: number[];
}

export interface GraphMonthlyDefectSummary {
  axis_x: string[];
  target_percent: number[];
  defect_percent: number[];
  defect_qty: DefectQty[];
}

//   export interface DefectQty2 {
//     name: string
//     qty: number[]
//   }

export interface GraphDailyDefectSummary {
  prod_vol: number;
  defect: number;
  defect_percent: number;
  axis_x: string[];
  axis_y_lift: string[];
  axis_y_right: string[];
  defect_percent_actual: number[];
  defect_qty: DefectQty[];
}

//   export interface DefectQty3 {
//     name: string
//     qty: number[]
//   }

export interface GraphDefectSummaryByType {
  total: number;
  defect: Defect[];
}

export interface Defect {
  name: string;
  qty: number;
  percent: number;
}

export interface AbnormalOccurrenceTable {
  date: string;
  part_no: string;
  trouble: string;
  action: string;
  in_charge: string;
  manager: string;
  defect_by: string;
  defect_details: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_namecause: string;
  cause: string;
  new_re_occur: string;
}

export interface DefectParetoChartType {
  axis_x: string[];
  axis_y_lift: string[];
  axis_y_right: string[];
  pareto: number[];
  defect_qty: number[];
}

export interface DescriptionOfDefect {
  date: string;
  line_name: string;
  part_no: string;
  part_name: string;
  trouble: string;
  prod_vol: number;
  defect_qty: number;
  percent_defect: number;
}

export interface InlineOutlineDefaultDefectResponse {
  default_defect_summary_result: DefaultDefectSummaryResult[];
}

export interface InlineOutlineDepartmentSectionChangeRequest {
  department: string;
  section: string;
}

export interface DepartmentSectionResult {
  department: string;
  section: string[];
  line: string[];
}

export interface InlineOutlineDepartmentSectionChangeResponse {
  department_section_result: DepartmentSectionResult[];
}

export interface InlineOutlineDefectSummaryRequest {
  month: string;
  department: string;
  section: string;
  line: string[] | null;
  shift: string;
}

export interface DefectSummaryResult {
  month: string;
  department: string;
  section: string;
  line: string[];
  target_percent: number;
  defect_percent: number;
  defect_status: boolean;
  total_defect: number;
  scrap_qty: number;
  scrap_percent: number;
  repeat_qty: number;
  repeat_percent: number;
  graph_yearly_defect_summary: GraphYearlyDefectProcessSummary;
  graph_monthly_defect_summary: GraphMonthlyDefectProcessSummary;
  graph_daily_defect_summary: GraphDailyDefectProcessSummary;
  graph_defect_summary_by_type: GraphDefectSummaryProcessByType;
}

//   export interface GraphYearlyDefectSummary {
//     axis_x: string[]
//     target_percent: number[]
//     defect_percent: number[]
//     defect_qty: DefectQty[]
//   }

export interface GraphMonthlyDefectSummary {
  axis_x: string[];
  target_percent: number[];
  defect_percent: number[];
  defect_qty: DefectQty[];
}
export interface GraphMonthlyDefectProcessSummary {
  inline: GraphMonthlyDefectSummary;
  outline: GraphMonthlyDefectSummary;
  inspection: GraphMonthlyDefectSummary;
}
export interface GraphDailyDefectSummary {
  prod_vol: number;
  defect: number;
  defect_percent: number;
  axis_x: string[];
  axis_y_lift: string[];
  axis_y_right: string[];
  defect_percent_actual: number[];
  defect_qty: DefectQty[];
}
export interface GraphDailyDefectProcessSummary {
  inline: GraphDailyDefectSummary;
  outline: GraphDailyDefectSummary;
  inspection: GraphDailyDefectSummary;
}

//   export interface DefectQty3 {
//     name: string
//     qty: number[]
//   }

export interface GraphDefectSummaryByType {
  total: number;
  defect: Defect[];
}
export interface GraphDefectSummaryProcessByType {
  inline: GraphDefectSummaryByType;
  outline: GraphDefectSummaryByType;
  inspection: GraphDefectSummaryByType;
}

export interface Defect {
  name: string;
  qty: number;
  percent: number;
}

//   export interface AbnormalOccurrenceTable {
//     date: string
//     part_no: string
//     trouble: string
//     action: string
//     in_charge: string
//     manager: string
//     defect_by: string
//     defect_details: string
//     rank: string
//     root_cause_process: string
//     process_name_supplier_namecause: string
//     cause: string
//     new_re_occur: string
//   }

// export interface DefectParetoChart {
//   axis_x: string[];
//   axis_y_lift: string[];
//   axis_y_right: string[];
//   pareto: number[];
//   defect_qty: number[];
// }

// export interface DescriptionOfDefect {
//     date: string
//     line_name: string
//     part_no: string
//     part_name: string
//     trouble: string
//     prod_vol: number
//     defect_qty: number
//     percent_defect: number
// }

export interface InlineOutlineDefectSummaryResponse {
  defect_summary_result: DefectSummaryResult[];
}

export interface InlineOutlineExportAbnormalOccurenceRequest {
  month: string;
  line: string[];
}

export interface ExportAbnormalResult {
  month: string;
  line: string[];
  abnormal_occurrence_table: AbnormalOccurrenceTable[];
}

//   export interface AbnormalOccurrenceTable {
//     date: string
//     part_no: string
//     trouble: string
//     action: string
//     in_charge: string
//     manager: string
//     defect_by: string
//     defect_details: string
//     rank: string
//     root_cause_process: string
//     process_name_supplier_namecause: string
//     cause: string
//     new_re_occur: string
//   }

export interface InlineOutlineExportAbnormalOccurenceResponse {
  export_abnormal_result: ExportAbnormalResult[];
}

export interface InlineOutlineExportDescriptionRequest {
  month: string;
  line: string[];
}

export interface ExportDescriptionResult {
  month: string;
  line: string[];
  description_of_defect: DescriptionOfDefect[];
}

//   export interface DescriptionOfDefect {
//     date: string
//     line_name: string
//     part_no: string
//     part_name: string
//     trouble: string
//     prod_vol: number
//     defect_qty: number
//     percent_defect: number
//   }

export interface InlineOutlineExportDescriptionResponse {
  export_description_result: ExportDescriptionResult[];
}

export interface inlineOutlineCauseOfAbnormalRequest {
  month: string;
  department: string;
  section: string;
  line: string[] | null;
  shift: string;
}

export interface inlineOutlineCauseOfAbnormalResponse {
  cause_of_abnormal_result: CauseOfAbnormalResult[];
}

export interface CauseOfAbnormalResult {
  month: string;
  department: string;
  section: string;
  line: string[];
  abnormal_occurrence_table: AbnormalOccurrenceTable2[];
}

export interface AbnormalOccurrenceTable2 {
  date: string;
  part_no: string;
  sub_line: string;
  trouble: string;
  action: string;
  in_charge: string;
  manager: string;
  detect_by: string;
  defect_details: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_namecause: string;
  cause: string;
  new_re_occur: string;
}

export interface InlineOutlineDefectParetoChartRequest {
  month: string;
  department: string;
  section: string;
  line: string[] | null;
  shift: string;
}

export interface DefectParetoChartResult {
  month: string;
  department: string;
  section: string;
  line: string[];
  defect_pareto_chart: DefectParetoChartProcess;
  description_of_defect: DescriptionOfDefect2[];
}
export interface DefectParetoChartProcess {
  inline: DefectParetoChartType;
  outline: DefectParetoChartType;
  inspection: DefectParetoChartType;
}

// export interface DefectParetoChart {
//     axis_x: string[];
//     axis_y_lift: string[];
//     axis_y_right: string[];
//     pareto: number[];
//     defect_qty: number[];
// }

export interface DescriptionOfDefect2 {
  date: string;
  line_name: string;
  part_no: string;
  sub_line: string;
  part_name: string;
  process: string;
  trouble: string;
  prod_vol: number;
  defect_qty: number;
  percent_defect: number;
}

export interface InlineOutlineDefectParetoChartResonse {
  defect_pareto_chart_result: DefectParetoChartResult[];
}

export interface inlineOutlineExportDescriptionDownloadRequest {
  month: string;
  line: string[];
}
