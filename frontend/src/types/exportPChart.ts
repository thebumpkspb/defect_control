export interface ExportPChartDefectRecordDownloadRequest {
  month: string;
  line_name: string;
  part_no: string;
  sub_line: string;
  process: string;
  shift: string;
  sub_line_label: string | null;
  file_type: string;
  is_not_zero: boolean;
}
