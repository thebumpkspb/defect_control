export interface PChartLine {
  line_id: number;
  line_name: string;
  line_fullname: string;
  line_code: string;
  work_center_code: string;
  process_code: string | null;
  line_group: string | null;
  group_type: string;
  section_id: number;
  section_line: string;
  line_code_rx: string;
}

export interface PChartLinesResponse {
  lines: PChartLine[];
}

export interface PChartPart {
  part_id: number;
  part_no: string;
  part_no_suffix: string | null;
  part_name: string;
  part_model: string | null;
  part_type: string | null;
  product_id: number | null;
  line_id: number;
}

export interface PChartSubLines {
  part_no: string;
  process: string;
  rxno_part: string;
}

export interface PChartPartsResponse {
  parts: PChartPart[];
}

export interface PChartSubLinesResponse {
  sub_lines: PChartSubLines[];
}

export interface PChartProdQuantity {
  production_date: string; // ISO 8601 date string
  plan_val: number;
  actual_val: number;
}

export interface PChartProdQuantityResponse {
  prod_qty: PChartProdQuantity[];
}

export interface PChartAbnormalOccurrenceRequest {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
}

export interface PChartAbnormalOccurrence {
  month: string;
  line_name: string;
  part_no: string;
  defect_item: any;
  category: string[];
  shift: string;
  process: string;
  sub_line: string;
  no: number;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
}

export interface PChartAbnormalOccurrenceResponse {
  abnormal_occurrence_view_result: PChartAbnormalOccurrence[];
}

export interface PChartGenaralInformationRequest {
  month: string;
  line_name: string;
  part_no: string | null;
  shift: string;
  process: string;
  sub_line: string | null;
}

export interface PChartGeneralInformation {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
  part_name: string | null;
  target_control: number | null;
  p_last_month: number | null;
  n_bar: number | null;
  p_bar: number | null;
  k: number | null;
  uclp: number | null;
  lclp: number | null;
  id: number | null;
}

export interface PChartGenaralInformationResponse {
  general_information_result: PChartGeneralInformation[];
}

export interface PChartAbnormalOccurrenceEditSaveRequest {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  no: number;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
}

export interface PChartAbnormalOccurrenceEditSave {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string;
  no: number | null;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
}

export interface PChartAbnormalOccurrenceEditSaveResponse {
  abnormal_occurrence_view_result: PChartAbnormalOccurrenceEditSave[];
}

export interface PChartAbnormalOccurrenceDeleteRequest {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  id: number;
}

export interface PChartAbnormalOccurrenceDelete {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  no: number;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
}

export interface PChartAbnormalOccurrenceDeleteResponse {
  abnormal_occurrence_view_result: PChartAbnormalOccurrenceDelete[];
}

export interface PChartAbnormalOccurrenceAddRowViewRequest {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
}

// { "month": "November-2024", "line_name": "414454 - Sta. Assy : PA70 Type", "part_no": "TG428000-0630", "shift": "B", "process": "Inline" }

export interface PChartAbnormalOccurrenceAddRowView {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  defect_item: number[];
  category: string[];
  process: string;
  sub_line: string;
  no: number;
  date: string | null;
  trouble: string | null;
  action: string | null;
  in_change: string | null;
  manager: string | null;
  detect_by: string | null;
  defect_detail: string | null;
  rank: string[];
  root_cause_process: string | null;
  process_name_supplier_name: string | null;
  cause: string | null;
  new_re_occur: string | null;
  id: number;
}

export interface PChartAbnormalOccurrenceAddRowViewResponse {
  abnormal_occurrence_add_view_result: PChartAbnormalOccurrenceAddRowView[];
}

export interface PChartAbnormalOccurrenceAddRowOkRequest {
  id: number | null;
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  defect_item: number[];
  category: string[];
  process: string;
  sub_line: string;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  creator: string;
}

export interface PChartAbnormalOccurrenceAddRowOk {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  no: number;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
}

export interface PChartAbnormalOccurrenceAddRowOkResponse {
  abnormal_occurrence_view_result: PChartAbnormalOccurrenceAddRowOk[];
}

export interface PChartRecordGraphRequest {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
}

export interface PChartRecordGraphResult {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  defect: PChartRecordDefect[];
  percent_defect: number[];
  p_bar: number[];
  ucl_target: number[];
  x_axis_label: string[];
  x_axis_value: number[];
  x_axis_maxmin: number[];
  y_left_axis: number[];
  y_right_axis: number[];
}

export interface PChartRecordDefect {
  id: number;
  defect_name: string;
  value: number[];
  color?: string;
  itemStyle?: any;
}

export interface PChartRecordGraphResponse {
  p_chart_graph_result: PChartRecordGraphResult[];
}

export interface PChartRecordTableRequest {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
}

export interface PChartRecordTableResult {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  index: string[];
  prod_qty: number[];
  defect_qty: number[];
  defect_ratio: number[];
  defect_table: DefectTable[];
  record_by: string[];
  review_by_tl: any;
  review_by_mgr: any;
  review_by_gm: any;
  ucl_target: number[];
  over_target_by_piece: boolean[];
}

export interface DefectTable {
  id: number;
  defect_type: string;
  defect_item: string;
  target_by_piece: number;
  category: string[];
  value: number[];
}

export interface PChartRecordTableResponse {
  p_chart_record_table_result: PChartRecordTableResult[];
}

export interface AddNewRecordViewRequest {
  date: string | null;
  line_name: string;
  defect_type: string | null;
  process: string;
  sub_line: string | null;
  part_no: string | null;
}

export interface AddNewRecordViewResult {
  date: string;
  line_name: string[];
  process: string[];
  sub_line: string[];
  part_no: string[];
  defect_type: string;
  defect_mode: string[];
  defect_qty_A: number;
  defect_qty_B: number;
  id: number;
  creator: string | null;
  comment_shift_A: string;
  comment_shift_B: string;
}

export interface DefectData {
  date: string;
  line_name: string;
  process: string;
  sub_line: string;
  part_no: string;
  defect_type: string;
  defect_mode: string;
}

export interface AddNewRecordViewResponse {
  add_new_record_view_result: AddNewRecordViewResult[];
}

export interface ChangeNewRecordViewRequest {
  date: string;
  line_name: string;
  defect_type: string;
  process: string;
  sub_line: string;
  part_no: string;
  defect_mode: string;
}

export interface ChangeAddNewRecordViewResult {
  date: string;
  line_name: string[];
  process: string[];
  sub_line: string[];
  part_no: string[];
  defect_type: string;
  defect_mode: string[];
  defect_qty_A: number;
  defect_qty_B: number;
  id: number;
  creator: string | null;
  comment_shift_A: string;
  comment_shift_B: string;
}

export interface ChangeNewRecordViewResponse {
  add_new_record_view_result: ChangeAddNewRecordViewResult[];
}

export interface AddNewRecordSaveRequest {
  date: string;
  line_name: string;
  defect_type: string;
  process: string;
  sub_line: string | null;
  part_no: string;
  defective_items: string;
  defect_qty_A: number | null;
  defect_qty_B: number | null;
  pic: string | null;
  comment: string;
  id: number | null;
  creator: string;
}

export interface CheckOverUCLTargetRequest {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
  date: string | undefined;
  defect_qty: number;
  defect_type: string;
  ucl_target?: number;
  defect_ratio?: number;
  is_over?: boolean;
}

export interface CheckOverUCLTargetResponse {
  check_over_ucl_target: CheckOverUCLTargetRequest;
}

export interface GetAmountActionRecordRequest {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
  date: string | undefined;
  amount_action_record?: number;
}

export interface GetAmountActionRecordResponse {
  get_amount_action_record: GetAmountActionRecordRequest;
}

export interface DailyApprovalRequest {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
  date: string | undefined;
  user_uuid: string | undefined | null;
  user_name: string | null;
}

export interface DailyApprovalResponse {
  approval_daily: DailyApprovalRequest;
}

export interface WeeklyApprovalRequest {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
  date: string | undefined;
  user_uuid: string | undefined | null;
  user_name: string | null;
}

export interface WeeklyApprovalResponse {
  approval_weekly: WeeklyApprovalRequest;
}

export interface BiWeeklyApprovalRequest {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
  date: string | undefined;
  user_uuid: string | undefined | null;
  user_name: string | null;
}

export interface BiWeeklyApprovalResponse {
  approval_biweekly: BiWeeklyApprovalRequest;
}

export interface AddNewRecordSaveResult {
  date: string;
  line_name: string;
  defect_type: string;
  process: string;
  sub_line: string;
  part_no: string;
  defective_items: string;
  defect_qty_A: number | null;
  defect_qty_B: number | null;
  id: number | null;
  creator: string;
}

export interface AddNewRecordSaveResponse {
  add_new_record_result: AddNewRecordSaveResult[];
}

export interface AbnormalOccurrenceViewRequest {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
}

export interface AbnormalOccurrenceViewResult {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  no: number;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
  creator: string;
}

export interface AbnormalOccurrenceViewResponse {
  abnormal_occurrence_view_result: AbnormalOccurrenceViewResult[];
}

export interface AbnormalOccurrenceEditViewRequest {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  id: number;
}

export interface AbnormalOccurrenceEditViewResult {
  month: string | null;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  no: number | null;
  date: string;
  trouble: string;
  action: string | null;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string[];
  root_cause_process: string | null;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
}

export interface AbnormalOccurrenceEditViewResponse {
  abnormal_occurrence_edit_view_result: AbnormalOccurrenceEditViewResult[];
}

export interface AbnormalOccurrenceEditSaveRequest {
  // flatMap(arg0: (item: any) => any): Iterable<unknown> | null | undefined;
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  defect_item: any;
  category: string[];
  process: string;
  sub_line: string;
  no: number;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
  creator: string;
}

export interface AbnormalOccurrenceEditSaveResult {
  month: string | null;
  line_name: string | null;
  part_no: string | null;
  shift: string | null;
  process: string | null;
  sub_line: string | null;
  no: number | null;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
  creator: string;
}

export interface AbnormalOccurrenceEditSaveResponse {
  abnormal_occurrence_edit_save_result: AbnormalOccurrenceEditSaveResult[];
}

export interface AbnormalOccurrenceDeleteRequest {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  id: number;
  creator: string;
}

export interface AbnormalOccurrenceDeleteResult {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  no: number;
  date: string;
  trouble: string;
  action: string | null;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string | null;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
  creator: string | null;
}

export interface AbnormalOccurrenceDeleteResponse {
  abnormal_occurrence_delete_result: AbnormalOccurrenceDeleteResult[];
}

export interface AbnormalOccurrenceAddRowViewRequest {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
}

export interface AbnormalOccurrenceAddRowViewResult {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  no: number;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string[];
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
}

export interface AbnormalOccurrenceAddRowViewResponse {
  abnormal_occurrence_add_row_view_result: AbnormalOccurrenceAddRowViewResult[];
}

export interface AbnormalOccurrenceAddRowOkRequest {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  creator: string;
}

export interface AbnormalOccurrenceAddRowOkResult {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
  no: number;
  date: string;
  trouble: string;
  action: string;
  in_change: string;
  manager: string;
  detect_by: string;
  defect_detail: string;
  rank: string;
  root_cause_process: string;
  process_name_supplier_name: string;
  cause: string;
  new_re_occur: string;
  id: number;
  creator: string;
}

export interface AbnormalOccurrenceAddRowOkResponse {
  abnormal_occurrence_add_row_ok_result: AbnormalOccurrenceAddRowOkResult[];
}
