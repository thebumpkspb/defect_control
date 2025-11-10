export interface SettingDefectModeRequest {
  line_name: string | null;
  process?: string | null;
  part_no: string | null;
  part_name: string | null;
}

export interface SettingSubPartRequest {
  line_name: string | null;
  line_code_rx: string | null;
}
export interface SettingTableResult {
  line_name: string;
  part_name: string;
  part_no: string;
  id: number;
  process: string;
  defect_type: string;
  defect_mode: string;
  target_by_piece: number | null;
  category: string[];
  master_defect_index?: number | null;
}
export interface SubPartTableResult {
  group_name: string;
  line_name: string;
  part_name: string;
  part_no: string;
  sub_line: string;
  sub_line_label: string;
  id: number;
  process: string;
  sub_part_no: string;
  sub_part_name: string;
  unit_consumption: number;
  supplier?: string;
}
export interface SettingDefectModeResponse {
  setting_table_result: SettingTableResult[];
}
export interface SettingSubPartResponse {
  setting_subpart_table_result: SubPartTableViewResult[];
}

export interface Part {
  part_id: number;
  part_no: string;
  part_no_suffix: any;
  part_name: string;
  part_model: any;
  part_type: any;
  product_id: any;
  line_id: number;
}

export interface SettingPartByLineResponse {
  parts: Part[];
}

export interface Line {
  line_id: number;
  line_name: string;
  line_fullname: string;
  line_code: string;
  work_center_code: string;
  process_code: any;
  line_group: any;
  group_type: string;
  section_id: number;
  section_line: string;
  line_code_rx: string;
}

export interface SettingLineResponse {
  lines: Line[];
}

export interface SettingDefectModeAddRowViewRequest {
  line_name: string;
  part_no: string;
  part_name: string;
}

// export interface DefectModeAddRowViewResult {
//     line_name: string[]
//     part_no: string[]
//     part_name: string
//     process: string[]
//     defect_type: string[]
//     defect_mode: string
// }

export interface DefectModeAddRowViewResult {
  line_name: string[];
  parts: SettingDefectModeAddRowViewPart[];
  process: string[];
  defect_type: string[];
  defect_mode: string;
}

export interface SettingDefectModeAddRowViewPart {
  part_no: string;
  part_name: string;
}

export interface SettingDefectModeAddRowViewResponse {
  add_row_view_result: DefectModeAddRowViewResult[];
}

export interface SettingDefectModeAddRowViewLineNameChangeRequest {
  line_name: string;
  part_no: string | null;
  part_name: string | null;
  process?: string;
}

export interface DefectModeAddRowViewLineNameChangePart {
  part_no: string;
  part_name: string;
}

// export interface DefectModeAddRowViewLineNameChangeResult {
//     line_name: string[]
//     part_no: string[]
//     part_name: string
//     process: string[]
//     target_type: string[]
//     // month_year: string
//     // target_percent: number
//     defect_type: string[]
//     defect_mode: string
// }

export interface DefectModeAddRowViewLineNameChangeResult {
  line_name: string[];
  parts: DefectModeAddRowViewLineNameChangePart[];
  process: string[];
  defect_type: string[];
  defect_mode: string;
}

export interface SettingDefectModeAddRowViewLineNameChangeResponse {
  add_row_view_result: DefectModeAddRowViewLineNameChangeResult[];
}

export interface SettingDefectModeAddRowOkRequest {
  line_name: string;
  part_no: string | null;
  part_name: string | null;
  process: string;
  defect_type: string;
  defect_mode: string;
  target_by_piece: number | null;
  category: string[];
  creator: string;
}

export interface DefectModeAddRowOkResult {
  line_name: string;
  part_name: string;
  part_no: string;
  process: string;
  defect_type: string;
  defect_mode: string;
  creator: string;
}

export interface SettingDefectModeAddRowOkResponse {
  add_row_ok_result: DefectModeAddRowOkResult[];
}

export interface SettingDefectModeAddRowOkRequest {
  line_name: string;
  part_no: string | null;
  part_name: string | null;
  process: string;
  defect_type: string;
  defect_mode: string;
  creator: string;
}

export interface AddRowOkResult {
  line_name: string;
  part_name: string;
  part_no: string;
  process: string;
  defect_type: string;
  defect_mode: string;
  creator: string;
}

// /api/settings_defect_mode/table_delete

export interface SettingDefectModeTableDeleteRequest {
  id: number;
  line_name: string;
  part_no: string;
  part_name: string;
  process: string;
  defect_type: string;
  defect_mode: string;
}

export interface SettingDefectModeTableDeleteResponse {
  setting_table_result: SettingTableResult[];
}

// export interface SettingDefectModeTableEditViewRequest {
//     line_name: string
//     part_no: string
//     part_name: string
//     process: string
//     defect_type: string
//     defect_mode: string
// }

// export interface SettingTableEditResult {
//     id: number
//     line_name: string[]
//     process: string[]
//     part_no: string[]
//     part_name: string
//     defect_type: string[]
//     defect_mode: string
// }

// export interface SettingDefectModeTableEditViewResponse {
//     setting_table_edit_result: SettingTableEditResult[]
// }

// export interface SettingDefectModeTableEditOkRequest {
//     line_name: string
//     part_no: string
//     part_name: string
//     process: string
//     defect_type: string
//     defect_mode: string
// }

// export interface SettingTableEditResult {
//     id: number
//     line_name: string[]
//     process: string[]
//     part_no: string[]
//     part_name: string
//     defect_type: string[]
//     defect_mode: string
// }

// export interface SettingDefectModeTableEditOkResponse {
//     setting_table_edit_result: SettingTableEditResult[]
// }

export interface SettingGroupPartsRequest {}

export interface Group {
  group_id: number;
  group_name: string;
  group_type?: string;
  part_no: string[];
}

export interface settingGroupPartsResponse {
  groups: Group[];
}

export interface SettingTargetTableViewRequest {
  group_name: string;
  line_name: string;
  process: string | null;
  part_no: string | null;
  part_name: string | null;
  sub_line: string | null;
}

export interface SettingTableViewResult {
  group_name: string;
  line_name: string;
  part_name: string;
  part_no: string;
  sub_line: string;
  id: number;
  process: string;
  target_type: string;
  month_year: string;
  target_control: number;
}
export interface SubPartTableViewResult {
  group_name: string;
  line_name: string;
  part_name: string;
  part_no: string;
  sub_line: string;
  sub_line_label: string;
  id: number;
  process: string;
  sub_part_no: string;
  sub_part_name: string;
  supplier: string;
  unit_consumption: number;
}
// export interface SubPartTableViewResult {
//   group_name: string;
//   line_name: string;
//   part_name: string;
//   part_no: string;
//   sub_line: string;
//   id: number;
//   process: string;
//   sub_part_no: string;
//   unit_consumption: number;
// }

export interface SettingTargetTableViewResponse {
  setting_table_result: SettingTableViewResult[];
}

export interface SettingTargetAddRowViewRequest {
  group_name: string;
  line_name: string;
  part_no: string | null;
  part_name: string | null;
  sub_line: string | null;
}
export interface SettingSubPartAddRowViewRequest {
  group_name: string;
  line_name: string;
  part_no: string;
  part_name: string;
  sub_line: string;
}

// export interface AddRowViewResult {
//     group_name: string[]
//     line_name: string[]
//     part_no: string[]
//     part_name: string
//     process: string[]
//     target_type: string[]
//     month_year: string
//     target_percent: number
// }

export interface AddRowViewResultPart {
  part_no: string;
  part_name: string;
}

export interface AddRowViewResult {
  group_name: string[] | null;
  line_name: string[];
  parts: AddRowViewResultPart[];
  process: string[] | null;
  target_type: string[] | null;
  month_year: string | null;
  target_percent: number | null;
}

export interface SettingTargetAddRowViewResponse {
  // lines(lines: any): unknown
  add_row_view_result: AddRowViewResult[];
}
export interface SettingSubPartAddRowViewResponse {
  // lines(lines: any): unknown
  add_row_view_result: AddRowViewResult[];
}

export interface SettingTargetAddRowViewLineNameChangeRequest {
  group_name: string;
  line_name: string;
  part_no: string | null;
  part_name: string | null;
  sub_line: string | null;
  process?: string | null;
}

export interface SettingTargetAddRowViewLineNameChangeResponse {
  add_row_view_result: AddRowViewResult[];
}

export interface SettingTargetAddRowOkRequest {
  line_name: string;
  part_no: string | null;
  part_name: string | null;
  sub_line: string | null;
  process: string | null;
  group_name: string;
  target_type: string;
  month_year: string;
  target_percent: number;
  creator: string;
}
export interface SettingSubPartAddRowOkRequest {
  line_name: string;
  part_no: string;
  part_name: string;
  sub_line: string | null;
  process: string;
  group_name: string;
  sub_part_no: string;
  sub_part_name: string;
  supplier: string;
  unit_consumption: number;
  creator: string;
}

export interface TargetAddRowOkResult {
  group_name: string;
  line_name: string;
  part_name: string;
  part_no: string;
  process: string;
  target_type: string;
  month_year: string;
  target_percent: number;
  creator: string;
}
export interface SubPartAddRowOkResult {
  group_name: string;
  line_name: string;
  part_name: string;
  part_no: string;
  process: string;
  sub_part_no: string;
  sub_part_name: string;
  unit_consumption: number;
  creator: string;
}
export interface SettingTargetAddRowOkResponse {
  add_row_ok_result: TargetAddRowOkResult[];
}
export interface SettingSubPartAddRowOkResponse {
  add_row_ok_result: SubPartAddRowOkResult[];
}

export interface SettingTargetTableDeleteRequest {
  id: number;
  group_name: string;
  line_name: string;
  part_no: string;
  part_name: string;
  process: string;
  sub_line: string;
  target_type: string;
  month_year: string;
  target_control: number;
}
export interface SettingSubPartTableDeleteRequest {
  id: number;
  group_name: string;
  line_name: string;
  part_no: string;
  part_name: string;
  process: string;
  sub_line: string;
  sub_part_no: string;
  sub_part_name: string;
  unit_consumption: number;
}

export interface SettingTargetTableDeleteResult {
  group_name: string;
  line_name: string;
  part_name: string;
  part_no: string;
  id: number;
  process: string;
  target_type: string;
  month_year: string;
  target_control: number;
}
export interface SettingSubPartTableDeleteResult {
  group_name: string;
  line_name: string;
  part_name: string;
  part_no: string;
  id: number;
  process: string;
  sub_part_no: string;
  sub_part_name: string;
  unit_consumption: number;
}

export interface SettingTargetTableDeleteResponse {
  setting_table_result: SettingTargetTableDeleteResult[];
}
export interface SettingSubPartTableDeleteResponse {
  sub_part_table_result: SettingSubPartTableDeleteResult[];
}

export interface SettingTargetTableEditViewRequest {
  id: number;
  group_name: string;
  line_name: string;
  part_no: string;
  part_name: string;
  process: string;
  sub_line: string;
  target_type: string;
  month_year: string;
  target_control: number;
}
export interface SettingSubPartTableEditViewRequest {
  id: number;
  group_name: string;
  line_name: string;
  part_no: string;
  part_name: string;
  process: string;
  sub_line: string;
  sub_part_no: string;
  sub_part_name: string;
  unit_consumption: number;
}

// export interface SettingTableEditViewResult {
//     id: number
//     group_name: string[]
//     line_name: string[]
//     process: string[]
//     part_no: string[]
//     part_name: string
//     target_type: string
//     month_year: string
//     target_control: number
// }

export interface SettingTableEditViewResult {
  id: number;
  group_name: string[];
  line_name: string[];
  process: string[];
  parts: SettingTableEditViewPart[];
  target_type: string;
  month_year: string;
  target_control: number;
}
export interface SettingSubPartTableEditViewResult {
  id: number;
  group_name: string[];
  line_name: string[];
  process: string[];
  parts: SettingSubPartTableEditViewPart[];
  sub_part_no: string;
  sub_part_name: string;
  unit_consumption: number;
}

export interface SubPartTableEditViewResult {
  id: number;
  group_name: string[];
  line_name: string[];
  process: string[];
  parts: SubPartTableEditViewPart[];
  sub_part_no: string[];
  unit_consumption: number;
}

export interface SubPartTableEditViewPart {
  part_no: string;
  part_name: string;
  sub_line: string;
}
export interface SettingTableEditViewPart {
  part_no: string;
  part_name: string;
}
export interface SettingSubPartTableEditViewPart {
  part_no: string;
  part_name: string;
  sub_line: string;
}

export interface SettingTargetTableEditViewResponse {
  setting_table_edit_result: SettingTableEditViewResult[];
}

export interface SettingSubPartTableEditViewResponse {
  sub_part_table_edit_result: SettingSubPartTableEditViewResult[];
}

export interface SettingTargetTableEditViewLineNameChangeRequest {
  line_name: string;
  group_name: string;
  part_no: string;
  part_name: string;
  sub_line: string;
}
export interface SettingSubPartTableEditViewLineNameChangeRequest {
  line_name: string;
  group_name: string;
  part_no: string;
  part_name: string;
  sub_line: string;
}
// SettingSubPartTableEditViewLineNameChangeRequest
// export interface SettingTableLineNameChangeEditResult {
//     id: number
//     group_name: string[]
//     line_name: string[]
//     process: string[]
//     part_no: string[]
//     part_name: string
//     target_type: string
//     month_year: string
//     target_control: number
// }

// export interface Root {
//     setting_table_edit_result: SettingTableEditResult[]
//   }

export interface SettingTableLineNameChangeEditResult {
  id: number;
  group_name: string[];
  line_name: string[];
  process: string[];
  target_type: string;
  parts: SettingTableLineNameChangeEdit[];
  month_year: string;
  target_control: number;
}
export interface SettingSubPartTableLineNameChangeEditResult {
  id: number;
  group_name: string[];
  line_name: string[];
  process: string[];
  // target_type: string;
  parts: SettingTableLineNameChangeEdit[];
  // month_year: string;
  // target_control: number;
  sub_part_no: string;
  sub_part_name: string;
  unit_consumption: number;
}

export interface SubPartTableLineNameChangeEditResult {
  id: number;
  group_name: string[];
  line_name: string[];
  process: string[];
  parts: SubPartTableLineNameChangeEdit[];
  sub_part_no: string;
  sub_part_name: string;
  unit_consumption: number;
}
// id: number;
// group_name: string[];
// line_name: string[];
// process: string[];
// parts: SubPartTableEditViewPart[];
// sub_part_no: string;
// unit_consumption: number;
export interface SubPartTableLineNameChangeEdit {
  part_no: string;
  part_name: string;
  sub_line: string;
}
export interface SettingTableLineNameChangeEdit {
  part_no: string;
  part_name: string;
}

export interface SettingTargetTableEditViewLineNameChangeResponse {
  setting_table_edit_result: SettingTableLineNameChangeEditResult[];
}
export interface SettingSubPartTableEditViewLineNameChangeResponse {
  sub_part_table_edit_result: SettingSubPartTableLineNameChangeEditResult[];
}

export interface SettingTargetTableEditSaveRequest {
  id: number;
  group_name: string;
  line_name: string;
  part_no: string;
  part_name: string;
  sub_line: string;
  process: string;
  target_type: string;
  month_year: string;
  target_control: number;
  creator: string;
}
export interface SettingSubPartTableEditSaveRequest {
  id: number;
  group_name: string;
  line_name: string;
  part_no: string;
  part_name: string;
  sub_line: string;
  process: string;
  sub_part_no: string;
  sub_part_name: string;
  supplier: string;
  unit_consumption: number;
  creator: string;
}

export interface SubPartTargetTableEditSaveRequest {
  id: number;
  group_name: string;
  line_name: string;
  part_no: string;
  part_name: string;
  sub_line: string;
  process: string;
  sub_part_no: string;
  sub_part_name: string;
  supplier: string;
  unit_consumption: number;
  creator: string;
}

export interface SettingTargetTableEditSave {
  group_name: string;
  line_name: string;
  part_name: string;
  part_no: string;
  id: number;
  process: string;
  target_type: string;
  month_year: string;
  target_control: number;
  creator: string;
}

export interface SettingTargetTableEditSaveResponse {
  setting_table_edit_save: SettingTargetTableEditSave[];
}
export interface SettingSubPartTableEditSaveResponse {
  sub_part_table_edit_result: SettingTargetTableEditSave[];
}

export interface SettingTargetOrgTableViewRequest {
  target_level: string;
}

export interface SettingTableResult2 {
  // group_name: string
  line_name: string;
  part_no: string;
  part_name: string;
  process: string;
  target_level: string;
  id: number;
  target_name: string;
  target_type: string;
  month_year: string;
  target_control: number;
}

export interface SettingTargetOrgTableViewResponse {
  setting_table_result: SettingTableResult2[];
}

export interface SettingTargetOrgTableEditViewRequest {
  target_level: string;
  id: number;
  target_name: string;
  target_type: string;
  month_year: string;
  target_control: number;
}

export interface SettingTargetOrgTableEditResult {
  id: number;
  target_level: string[];
  target_name: string[];
  target_type: string;
  month_year: string;
  target_control: number;
}

export interface SettingTargetOrgTableEditViewResponse {
  setting_table_edit_result: SettingTargetOrgTableEditResult[];
}

export interface SettingTargetOrgTableEditViewTargetLevelChangeRequest {
  target_level: string;
}

// export interface SettingTableEditResult {
//     id: number
//     target_level: string[]
//     target_name: string[]
//     target_type: string
//     month_year: string
//     target_control: number
// }

export interface SettingTargetOrgTableEditViewTargetLevelChangeResponse {
  setting_table_edit_result: SettingTargetOrgTableEditResult[];
}

export interface SettingTargetOrgTableEditSaveRequest {
  target_level: string;
  id: number;
  target_name: string;
  target_type: string;
  month_year: string;
  target_control: number;
  creator: string;
}

export interface SettingTableEditSave {
  target_level: string;
  id: number;
  target_name: string;
  target_type: string;
  month_year: string;
  target_control: number;
  creator: string;
}

export interface SettingTargetOrgTableEditSaveResponse {
  setting_table_edit_save: SettingTableEditSave[];
}

export interface SettingTargetOrgTableDeleteRequest {
  target_level: string;
  id: number;
  target_name: string;
  target_type: string;
  month_year: string;
  target_control: number;
}

// export interface SettingTableResult {
//     target_level: string
//     id: number
//     target_name: string
//     target_type: string
//     month_year: string
//     target_control: number
// }

export interface SettingTargetOrgTableDeleteResponse {
  setting_table_result: SettingTableResult[];
}

export interface SettingTargetOrgAddRowViewRequest {
  target_level: string;
}

export interface AddRowViewResult2 {
  target_level: string[];
  target_name: string[];
  target_type: string[];
  month_year: string;
  target_percent: number;
}

export interface SettingTargetOrgAddRowViewResponse {
  add_row_view_result: AddRowViewResult2[];
}

export interface SettingTargetOrgAddRowViewTargetLevelChangeRequest {
  target_level: string;
}

// export interface AddRowViewResult2 {
//     target_level: string[]
//     target_name: string[]
//     target_type: string[]
//     month_year: string
//     target_percent: number
// }

export interface SettingTargetOrgAddRowViewTargetLevelChangeResponse {
  add_row_view_result: AddRowViewResult2[];
}

export interface SettingTargetOrgAddRowOkRequest {
  target_level: string;
  target_name: string;
  target_type: string;
  month_year: string;
  target_percent: number;
  creator: string;
}

export interface AddRowOkResult2 {
  target_level: string;
  target_name: string;
  target_type: string;
  month_year: string;
  target_percent: number;
  creator: string;
}

export interface SettingTargetOrgAddRowOkResponse {
  add_row_ok_result: AddRowOkResult2[];
}

export interface SettingDefectModeTableEditViewRequest {
  id_table: number;
  line_name: string;
  part_no: string;
  part_name: string;
  process: string;
  defect_type: string;
  defect_mode: string;
}

// export interface SettingDefectModeTableEditResult {
//     id: number
//     line_name: string[]
//     process: string[]
//     part_no: string[]
//     part_name: string
//     defect_type: string[]
//     defect_mode: string
//     id_table: number
// }

export interface SettingDefectModeTableEditResult {
  id: number;
  line_name: string[];
  process: string[];
  parts: SettingDefectModeTableEditPart[];
  defect_type: string[];
  defect_mode: string;
  id_table: number;
}

export interface SettingDefectModeTableEditPart {
  part_no: string;
  part_name: string;
}

export interface SettingDefectModeTableEditViewResponse {
  setting_table_edit_result: SettingDefectModeTableEditResult[];
}

export interface SettingDefectModeTableEditViewLineNameChangeRequest {
  line_name: string;
  part_no: string;
  part_name: string;
}

// export interface SettingDefectModeTableEditResult {
//     id: number
//     line_name: string[]
//     process: string[]
//     part_no: string[]
//     part_name: string
//     defect_type: string[]
//     defect_mode: string
// }

export interface SettingTableEditResult {
  id: number;
  line_name: string[];
  process: string[];
  parts: SettingDefectModeTableEditPart[];
  defect_type: string[];
  defect_mode: string;
  id_table: number;
}

export interface SettingDefectModeTableEditPart {
  part_no: string;
  part_name: string;
}

export interface SettingDefectModeTableEditViewLineNameChangeResponse {
  setting_table_edit_result: SettingDefectModeTableEditResult[];
}

export interface SettingDefectModeTableEditSaveRequest {
  id: number;
  line_name: string;
  part_no: string;
  part_name: string;
  process: string;
  defect_type: string;
  defect_mode: string;
  target_by_piece: number | null;
  category: string[];
  creator: string;
}
export interface SettingDefectModeTableReIndexRequest {
  id: number;
  master_defect_index: number;
}

export interface SettingDefectModeTableReIndexResponse {
  setting_table_re_index: SettingDefectModeTableReIndexRequest[];
}
export interface SettingDefectModeTableEditSave {
  line_name: string;
  part_name: string;
  part_no: string;
  id: number;
  process: string;
  defect_type: string;
  defect_mode: string;
  creator: string;
}

export interface SettingDefectModeTableEditSaveResponse {
  setting_table_edit_save: SettingDefectModeTableEditSave[];
}

export interface PChartRecordHistoryRecordsViewRequest {
  month: string;
  line_name: string;
  process: string;
  sub_line: string | null;
  part_no: string | null;
  shift: string;
}

export interface HistoryRecordsResult {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  history_records_result: HistoryRecordsResultDetail[];
}

export interface HistoryRecordsResultDetail {
  no: number;
  date: string;
  shift: string;
  line: string;
  part_no: string;
  process: string;
  sub_line: string;
  defect_type: string;
  defect_mode: string;
  qty: number;
  pic: string;
  id: number;
  creator: string;
}

export interface PChartRecordHistoryRecordsViewResponse {
  history_records_result: HistoryRecordsResult[];
}

export interface PChartRecordHistoryRecordsEditViewRequest {
  no: number;
  date: string;
  shift: string;
  line: string;
  part_no: string;
  process: string;
  sub_line: string;
  defect_type: string;
  defect_mode: string;
  qty: number;
  id: number;
  creator: string;
}

export interface HistoryRecordsEditResult {
  no: number;
  date: string;
  shift: string[];
  line: string[];
  part_no: string[];
  process: string[];
  defect_type: string[];
  defect_mode: string[];
  qty: number;
  id: number;
}

export interface PChartRecordHistoryRecordsEditViewResponse {
  history_records_edit_result: HistoryRecordsEditResult[];
}

export interface PChartRecordHistoryRecordsEditViewChangeRequest {
  no: number;
  date: string;
  shift: string;
  line: string;
  part_no: string;
  process: string;
  sub_line: string;
  defect_type: string;
  defect_mode: string;
  qty: number;
  id: number;
  creator: string;
}

export interface HistoryRecordsEditResult {
  no: number;
  date: string;
  shift: string[];
  line: string[];
  part_no: string[];
  process: string[];
  defect_type: string[];
  defect_mode: string[];
  qty: number;
  id: number;
}

export interface PChartRecordHistoryRecordsEditViewChangeResponse {
  history_records_edit_result: HistoryRecordsEditResult[];
}

export interface PChartRecordHistoryRecordsEditSaveRequest {
  no: number;
  date: string;
  shift: string;
  line: string;
  part_no: string;
  process: string;
  sub_line: string;
  defect_type: string;
  defect_mode: string;
  qty: number;
  pic: string;
  id: number;
  creator: string;
}

export interface HistoryRecord {
  no: number;
  date: string;
  shift: string;
  line: string;
  part_no: string;
  process: string;
  defect_type: string;
  defect_mode: string;
  qty: number;
  id: number;
  creator: string;
}

export interface PChartRecordHistoryRecordsEditSaveResponse {
  history_records: HistoryRecord[];
}

export interface PChartRecordHistoryRecordsDeleteRequest {
  no: number;
  date: string;
  shift: string;
  line: string;
  part_no: string;
  process: string;
  sub_line: string;
  defect_type: string;
  defect_mode: string;
  qty: number;
  id: number;
  creator: string;
}

// export interface HistoryRecord {
//     no: number
//     date: string
//     shift: string
//     line: string
//     part_no: string
//     process: string
//     defect_type: string
//     defect_mode: string
//     qty: number
//     id: number
//     creator: string
// }

export interface PChartRecordHistoryRecordsDeleteResponse {
  history_records: HistoryRecord[];
}
