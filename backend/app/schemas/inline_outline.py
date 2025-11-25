from pydantic import BaseModel
from typing import List


class Department_Section(BaseModel):
    department: str | None = None
    section: str | None = None


class Department_Section_Result(BaseModel):
    department: str | None = None
    section: List[str] | None = None
    line: List[str] | None = None


class Department_Section_Result_Response(BaseModel):
    department_section_result: List[Department_Section_Result]


class Defect_Summary(BaseModel):
    month: str | None = None
    department: str | None = None
    section: str | None = None
    line: List[str] | None = None
    shift: str | None = None


class Defect_Summary_cause(BaseModel):
    month: str | None = None
    department: str | None = None
    section: str | None = None
    line: List[str] | None = None
    shift: str | None = None


class Defect_Qty_Detail(BaseModel):
    name: str | None = None
    qty: List[int] | None = None


class Yearly_Defect_Summary(BaseModel):
    axis_x: List[str] | None = None
    target_percent: List[float] | None = None
    defect_percent: List[float] | None = None
    defect_qty: List[Defect_Qty_Detail] | None = None


class Yearly_Defect_Process_Summary(BaseModel):
    inline: Yearly_Defect_Summary
    outline: Yearly_Defect_Summary
    inspection: Yearly_Defect_Summary


class Monthly_Defect_Summary(BaseModel):
    axis_x: List[str] | None = None
    target_percent: List[float] | None = None
    defect_percent: List[float] | None = None
    defect_qty: List[Defect_Qty_Detail] | None = None


class Monthly_Defect_Process_Summary(BaseModel):
    inline: Monthly_Defect_Summary
    outline: Monthly_Defect_Summary
    inspection: Monthly_Defect_Summary


class Daily_Defect_Summary(BaseModel):
    prod_vol: int | None = None
    defect: int | None = None
    defect_percent: float | None = None
    axis_x: List[str] | None = None
    axis_y_lift: List[str] | None = None
    axis_y_right: List[str] | None = None
    defect_percent_actual: List[float] | None = None
    defect_qty: List[Defect_Qty_Detail] | None = None
    ucl_target: List[float] | None = None


class Daily_Defect_Process_Summary(BaseModel):
    inline: Daily_Defect_Summary
    outline: Daily_Defect_Summary
    inspection: Daily_Defect_Summary


class Defect_By_Type(BaseModel):
    name: str | None = None
    qty: int | None = None
    percent: float | None = None


class Defect_Summary_By_Type(BaseModel):
    total: float | None = None
    defect: List[Defect_By_Type] | None = None


class Defect_Summary_Process_By_Type(BaseModel):
    inline: Defect_Summary_By_Type
    outline: Defect_Summary_By_Type
    inspection: Defect_Summary_By_Type


class Abnormal_Occurrence_Table(BaseModel):
    date: str | None = None
    part_no: str | None = None
    sub_line: str | None = None
    trouble: str | None = None
    action: str | None = None
    in_charge: str | None = None
    manager: str | None = None
    detect_by: str | None = None
    defect_details: str | None = None
    rank: str | None = None
    root_cause_process: str | None = None
    process_name_supplier_namecause: str | None = None
    cause: str | None = None
    new_re_occur: str | None = None


class Defect_Pareto_Chart(BaseModel):
    axis_x: List[str] | None = None
    axis_y_lift: List[str] | None = None
    axis_y_right: List[str] | None = None
    pareto: List[float] | None = None
    defect_qty: List[int] | None = None


class Defect_Pareto_Chart_Process(BaseModel):
    inline: Defect_Pareto_Chart
    outline: Defect_Pareto_Chart
    inspection: Defect_Pareto_Chart


class Description_Of_Defect(BaseModel):
    date: str | None = None
    line_name: str | None = None
    part_no: str | None = None
    sub_line: str | None = None
    part_name: str | None = None
    process: str | None = None
    trouble: str | None = None
    prod_vol: int | None = None
    defect_qty: int | None = None
    percent_defect: float | None = None


class Defect_Summary_Result(Defect_Summary):
    target_percent: float | None = None
    defect_percent: float | None = None
    defect_status: bool | None = None
    total_defect: int | None = None
    scrap_qty: int | None = None
    scrap_percent: float | None = None
    repeat_qty: int | None = None
    repeat_percent: float | None = None
    graph_yearly_defect_summary: Yearly_Defect_Process_Summary | None = None
    graph_monthly_defect_summary: Monthly_Defect_Process_Summary | None = None
    graph_daily_defect_summary: Daily_Defect_Process_Summary | None = None
    graph_defect_summary_by_type: Defect_Summary_Process_By_Type | None = None


class Defect_Summary_Result_Response(BaseModel):
    defect_summary_result: List[Defect_Summary_Result]


class Cause_Of_Abnormal_Result(Defect_Summary):
    abnormal_occurrence_table: List[Abnormal_Occurrence_Table] | None = None


class Cause_Of_Abnormal_Result_Response(BaseModel):
    cause_of_abnormal_result: List[Cause_Of_Abnormal_Result]


class Defect_Pareto_Chart_Result(Defect_Summary):
    defect_pareto_chart: Defect_Pareto_Chart_Process | None = None
    description_of_defect: List[Description_Of_Defect] | None = None


class Defect_Pareto_Chart_Result_Response(BaseModel):
    defect_pareto_chart_result: List[Defect_Pareto_Chart_Result]


class Default_Defect_Summary_Result(BaseModel):
    month: str | None = None
    department: List[str] | None = None
    section: List[str] | None = None
    line: List[str] | None = None
    target_percent: float | None = None
    defect_percent: float | None = None
    defect_status: bool | None = None
    total_defect: int | None = None
    scrap_qty: int | None = None
    scrap_percent: float | None = None
    repeat_qty: int | None = None
    repeat_percent: float | None = None
    graph_yearly_defect_summary: Yearly_Defect_Summary | None = None
    graph_monthly_defect_summary: Monthly_Defect_Summary | None = None
    graph_daily_defect_summary: Daily_Defect_Summary | None = None
    graph_defect_summary_by_type: Defect_Summary_By_Type | None = None
    abnormal_occurrence_table: List[Abnormal_Occurrence_Table] | None = None
    defect_pareto_chart: Defect_Pareto_Chart | None = None
    description_of_defect: List[Description_Of_Defect] | None = None


class Default_Defect_Summary_Result_Response(BaseModel):
    default_defect_summary_result: List[Default_Defect_Summary_Result]


class Export_Abnormal(BaseModel):
    month: str | None = None
    line: List[str] | None = None
    shift: str | None = None


class Export_Description(BaseModel):
    month: str | None = None
    line: List[str] | None = None


class Export_Description_Result(Export_Description):
    description_of_defect: List[Description_Of_Defect] | None = None


class Export_Description_Result_Response(BaseModel):
    export_description_result: List[Export_Description_Result]
