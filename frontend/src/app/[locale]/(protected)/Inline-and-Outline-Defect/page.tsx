"use client";
import {
  Layout,
  Typography,
  Button,
  Select,
  Input,
  DatePicker,
  Radio,
  Space,
  Avatar,
  RadioChangeEvent,
  message,
  Row,
  Col,
  Card,
  Spin,
} from "antd";
import {
  HomeOutlined,
  LogoutOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState, useEffect, SetStateAction, useRef } from "react";
import DefectParetoChart, { DefectParetoChartRef } from "./DefectParetoChart";
import YearlyDefectSummary, {
  YearlyDefectSummaryRef,
} from "./YearlyDefectSummary";
import MonthlyDefectSummary, {
  MonthlyDefectSummaryRef,
} from "./MonthlyDefectSummary";
import DailyDefectSummary, {
  DailyDefectSummaryRef,
} from "./DailyDefectSummary";
// import AbnormalOccurrenceAndActionRecord, {
//   AbnormalOccurrenceAndActionRecordRef,
// } from "./AbnormalOccurrenceAndActionRecord";
import DefectSummaryByType, {
  DefectSummaryByTypeRef,
} from "./DefectSummaryByType";
// import DescriptionOfDefect, {
//   DescriptionOfDefectRef,
// } from "./DescriptionOfDefect";

import {
  pChartCtlSettingLine,
  pChartCtlPartByLineNoErr,
  inlineOutlineDefaultDefectSummary,
  inlineOutlineDefectSummary,
  inlineOutineDepartmentSectionChange,
  inlineOutlineCauseOfAbnormal,
  inlineOutlineDefectParetoChart,
} from "@/lib/api";
import {
  PChartGeneralInformation,
  PChartLine,
  PChartPart,
} from "@/types/pChartApi";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

import { LayoutStore, ModeStore, UserStore } from "@/store";
import { delay, formatNumberWithCommas } from "@/functions";

import {
  CauseOfAbnormalResult,
  DefectParetoChartProcess,
  DefectParetoChartResult,
  DefectSummaryResult,
  DepartmentSectionResult,
} from "@/types/inlineOutlineDefectSumApi";
import ExportAbnormalOccurrence from "./ExportAbnormalOccurrence";
import ExportDescription from "./ExportDescription";
import { promises } from "dns";
import PreviewPopup from "../DefectRecord/PreviewPopup";
import AbnormalOccurrenceAndActionRecord, {
  AbnormalOccurrenceAndActionRecordRef,
} from "./AbnormalOccurrenceandActionRecord";
import DescriptionOfDefect, {
  DescriptionOfDefectRef,
} from "./Descriptionofdefect";
import dayjs from "dayjs";

const { setUser, loadUser } = UserStore.getState();

function formatPercentString(value: number): string {
  return `${value.toFixed(2)}%`;
}

function getDateRange(dateStr: string): string {
  try {
    const [monthName, year] = dateStr.split("-");
    const date = new Date(`${monthName} 1, ${year}`);

    if (isNaN(date.getTime())) {
      // console.log(dateStr);
      return dateStr;
    }

    const month = date.getMonth() + 1; // getMonth() is zero-based
    const lastDay = new Date(Number(year), month, 0).getDate(); // Get the last day of the month

    const formattedMonth = month.toString().padStart(2, "0");
    return `01/${formattedMonth}/${year} - ${lastDay}/${formattedMonth}/${year}`;
  } catch (error) {
    // console.log(dateStr);
    return dateStr;
  }
}

const defaultDepartmentSectionResult: DepartmentSectionResult = {
  department: "",
  section: [],
  line: [],
};

const defaultDefectSummaryResult: DefectSummaryResult = {
  month: "string",
  department: "string",
  section: "string",
  line: ["string"],
  target_percent: 0,
  defect_percent: 0,
  defect_status: true,
  total_defect: 0,
  scrap_qty: 0,
  scrap_percent: 0,
  repeat_qty: 0,
  repeat_percent: 0,
  graph_yearly_defect_summary: {
    inline: {
      axis_x: ["string"],
      target_percent: [0],
      defect_percent: [0],
      defect_qty: [
        {
          name: "string",
          qty: [0],
        },
      ],
    },
    outline: {
      axis_x: ["string"],
      target_percent: [0],
      defect_percent: [0],
      defect_qty: [
        {
          name: "string",
          qty: [0],
        },
      ],
    },
    inspection: {
      axis_x: ["string"],
      target_percent: [0],
      defect_percent: [0],
      defect_qty: [
        {
          name: "string",
          qty: [0],
        },
      ],
    },
  },
  graph_monthly_defect_summary: {
    inline: {
      axis_x: ["string"],
      target_percent: [0],
      defect_percent: [0],
      defect_qty: [
        {
          name: "string",
          qty: [0],
        },
      ],
    },
    outline: {
      axis_x: ["string"],
      target_percent: [0],
      defect_percent: [0],
      defect_qty: [
        {
          name: "string",
          qty: [0],
        },
      ],
    },
    inspection: {
      axis_x: ["string"],
      target_percent: [0],
      defect_percent: [0],
      defect_qty: [
        {
          name: "string",
          qty: [0],
        },
      ],
    },
  },
  graph_daily_defect_summary: {
    inline: {
      prod_vol: 0,
      defect: 0,
      defect_percent: 0,
      axis_x: ["string"],
      axis_y_lift: ["string"],
      axis_y_right: ["string"],
      defect_percent_actual: [0],
      defect_qty: [
        {
          name: "string",
          qty: [0],
        },
      ],
    },
    outline: {
      prod_vol: 0,
      defect: 0,
      defect_percent: 0,
      axis_x: ["string"],
      axis_y_lift: ["string"],
      axis_y_right: ["string"],
      defect_percent_actual: [0],
      defect_qty: [
        {
          name: "string",
          qty: [0],
        },
      ],
    },
    inspection: {
      prod_vol: 0,
      defect: 0,
      defect_percent: 0,
      axis_x: ["string"],
      axis_y_lift: ["string"],
      axis_y_right: ["string"],
      defect_percent_actual: [0],
      defect_qty: [
        {
          name: "string",
          qty: [0],
        },
      ],
    },
  },
  graph_defect_summary_by_type: {
    inline: {
      total: 0,
      defect: [
        {
          name: "string",
          qty: 0,
          percent: 0,
        },
      ],
    },
    outline: {
      total: 0,
      defect: [
        {
          name: "string",
          qty: 0,
          percent: 0,
        },
      ],
    },
    inspection: {
      total: 0,
      defect: [
        {
          name: "string",
          qty: 0,
          percent: 0,
        },
      ],
    },
  },
};

const defaultDefectCauseOfAbnormal: CauseOfAbnormalResult = {
  month: "November-2024",
  department: "",
  section: "",
  line: [""],
  abnormal_occurrence_table: [
    {
      date: "2024-11-01",
      part_no: "",
      sub_line: "",
      trouble: "",
      action: "",
      in_charge: "",
      manager: "",
      detect_by: "",
      defect_details: "",
      rank: "",
      root_cause_process: "",
      process_name_supplier_namecause: "",
      cause: "",
      new_re_occur: "",
    },
  ],
};

const defaultParetoChart: DefectParetoChartResult = {
  month: "November-2024",
  department: "",
  section: "",
  line: ["string"],
  defect_pareto_chart: {
    inline: {
      axis_x: ["string"],
      axis_y_lift: ["string"],
      axis_y_right: ["string"],
      pareto: [0],
      defect_qty: [0],
    },
    outline: {
      axis_x: ["string"],
      axis_y_lift: ["string"],
      axis_y_right: ["string"],
      pareto: [0],
      defect_qty: [0],
    },
    inspection: {
      axis_x: ["string"],
      axis_y_lift: ["string"],
      axis_y_right: ["string"],
      pareto: [0],
      defect_qty: [0],
    },
  },
  description_of_defect: [
    {
      date: "2024-11-01",
      line_name: "string",
      part_no: "string",
      part_name: "string",
      sub_line: "string",
      trouble: "string",
      process: "string",
      prod_vol: 0,
      defect_qty: 0,
      percent_defect: 0,
    },
  ],
};

interface PChartInputSelect {
  date: string | null; // ex. November-2024
  department: string | null;
  section: string | null;
  line: string[];
}

export default function PChartHeader() {
  const { user, username, shortname, isAdmin, isLoggedIn } = UserStore();
  const { setIsLoading } = LayoutStore.getState();
  const { isLoading } = LayoutStore();
  // const [isLoading, setIsLoading] = useState(true);
  const [shift, setShift] = useState(
    user?.shift_name == "A" || user?.shift_name == "B"
      ? user?.shift_name
      : "All"
  );
  const handleShiftChange = (e: RadioChangeEvent) => {
    setShift(e.target.value);
  };
  const yearlyDefectChartRef = useRef<YearlyDefectSummaryRef>(null);

  const handleResetYearlyDefectChart = () => {
    yearlyDefectChartRef.current?.setChartToDefault();
  };

  const handleRefreshYearlyDefectChart = () => {
    yearlyDefectChartRef.current?.refreshChart();
  };

  const monthlyDefectChartRef = useRef<MonthlyDefectSummaryRef>(null);

  const handleResetMonthlyDefectChart = () => {
    monthlyDefectChartRef.current?.setChartToDefault();
  };

  const handleRefreshMonthlyDefectChart = () => {
    monthlyDefectChartRef.current?.refreshChart();
  };

  const dailyDefectSummaryRefInline = useRef<DailyDefectSummaryRef>(null);
  const dailyDefectSummaryRefOutline = useRef<DailyDefectSummaryRef>(null);
  const dailyDefectSummaryRefInspection = useRef<DailyDefectSummaryRef>(null);

  const handleResetDailyDefectChart = () => {
    dailyDefectSummaryRefInline.current?.setChartToDefault();
    dailyDefectSummaryRefOutline.current?.setChartToDefault();
    dailyDefectSummaryRefInspection.current?.setChartToDefault();
  };

  const handleRefreshDailyDefectChart = () => {
    console.log("test_refresh");
    dailyDefectSummaryRefInline.current?.refreshChart();
    dailyDefectSummaryRefOutline.current?.refreshChart();
    dailyDefectSummaryRefInspection.current?.refreshChart();
  };

  const defectSummaryByTypeRef = useRef<DefectSummaryByTypeRef>(null);

  const handleResetByTypeDefectChart = () => {
    defectSummaryByTypeRef.current?.setChartToDefault();
  };

  const handleRefreshByTypeDefectChart = () => {
    defectSummaryByTypeRef.current?.refreshChart();
  };

  const handleResetByTypeDefectTable = () => {
    defectSummaryByTypeRef.current?.setTableToDefault();
  };

  const handleRefreshByTypeDefectTable = () => {
    defectSummaryByTypeRef.current?.refreshTable();
  };

  const abnormalOccurrenceAndActionRef =
    useRef<AbnormalOccurrenceAndActionRecordRef>(null);

  const handleResetAbnormalOccurrenceTable = () => {
    abnormalOccurrenceAndActionRef.current?.setTableToDefault();
  };

  const handleRefreshAbnormalOccurrenceTable = () => {
    abnormalOccurrenceAndActionRef.current?.refreshTable();
  };

  const defectParetoChartRefInline = useRef<DefectParetoChartRef>(null);
  const defectParetoChartRefOutline = useRef<DefectParetoChartRef>(null);
  const defectParetoChartRefInspection = useRef<DefectParetoChartRef>(null);

  const handleResetdefectParetoChart = () => {
    defectParetoChartRefInline.current?.setChartToDefault();
    defectParetoChartRefOutline.current?.setChartToDefault();
    defectParetoChartRefInspection.current?.setChartToDefault();
  };

  const handleRefreshdefectParetoChart = () => {
    defectParetoChartRefInline.current?.refreshChart();
    defectParetoChartRefOutline.current?.refreshChart();
    defectParetoChartRefInspection.current?.refreshChart();
  };

  const descriptionOfDefectRef = useRef<DescriptionOfDefectRef>(null);

  const handleResetDecriptionOfDefect = () => {
    descriptionOfDefectRef.current?.setTableToDefault();
  };

  const handleRefreshDecriptionOfDefect = () => {
    descriptionOfDefectRef.current?.refreshTable();
  };

  const fetchInlineOutlineDefaultDefectSummary = async () => {
    // setIsLoading(true);
    try {
      const response = await inlineOutlineDefaultDefectSummary();
      // console.log(
      //   "inline outline departments:",
      //   response.default_defect_summary_result[0].department
      // );
      setDepartmentOptions(
        response.default_defect_summary_result[0].department
      );
      setSectionOptions(response.default_defect_summary_result[0].section);
    } catch (error) {
      setDepartmentOptions([]);
      console.error("Error inline outline departments:", error);
    }
    // setIsLoading(false);
  };

  const fetchInlineOutlineDepartmentSectionChange = async (
    department: string,
    section: string
  ): Promise<DepartmentSectionResult> => {
    // setIsLoading(true);
    try {
      const response = await inlineOutineDepartmentSectionChange({
        department: department,
        section: section,
      });
      console.log("inline outline departments section change:");
      // console.log("section:", response.department_section_result[0].section);
      // console.log("line:", response.department_section_result[0].line);
      // setIsLoading(false);
      return response.department_section_result[0];
    } catch (error) {
      console.error("Error inline outline departments section change:", error);
      // setIsLoading(false);
      return defaultDepartmentSectionResult;
    }
  };

  const fetchInlineOutlineDefectSummary = async (
    month: string,
    department: string,
    section: string,
    line: string[] | null,
    shift: string
  ): Promise<DefectSummaryResult> => {
    // setIsLoading(true);
    try {
      const response = await inlineOutlineDefectSummary({
        month: month,
        department: department,
        section: section,
        line: line,
        shift: shift,
      });
      // console.log(
      //   "inline outline departments:",
      //   response.defect_summary_result[0]
      // );
      setDefectDataSource(response.defect_summary_result[0]);
      // setIsLoading(false);
      return response.defect_summary_result[0];
    } catch (error) {
      console.error("Error inline outline departments:", error);
      // setIsLoading(false);
    }
    return defaultDefectSummaryResult;
  };

  const fetchInlineOutlineCauseOfAbnormal = async (
    month: string,
    department: string,
    section: string,
    line: string[] | null,
    shift: string
  ): Promise<CauseOfAbnormalResult> => {
    // setIsLoading(true);
    try {
      const response = await inlineOutlineCauseOfAbnormal({
        month: month,
        department: department,
        section: section,
        line: line,
        shift: shift,
      });
      // console.log(
      //   "inline outline cause_of_abnormal_result:",
      //   response.cause_of_abnormal_result[0]
      // );
      setCauseOfAbnormalDataSource(response.cause_of_abnormal_result[0]);
      // setIsLoading(false);
      return response.cause_of_abnormal_result[0];
    } catch (error) {
      console.error("Error inline outline CauseOfAbnormal:", error);
      // setIsLoading(false);
    }
    return defaultDefectCauseOfAbnormal;
  };

  const fetchInlineOutlineDefectParetoChart = async (
    month: string,
    department: string,
    section: string,
    line: string[] | null,
    shift: string
  ): Promise<DefectParetoChartResult> => {
    // setIsLoading(true);
    try {
      const response = await inlineOutlineDefectParetoChart({
        month: month,
        department: department,
        section: section,
        line: line,
        shift: shift,
      });
      // console.log(
      //   "inline outline DefectParetoChart:",
      //   response.defect_pareto_chart_result[0]
      // );
      setDefectParetoDataSource(response.defect_pareto_chart_result[0]);
      // setIsLoading(false);
      return response.defect_pareto_chart_result[0];
    } catch (error) {
      console.error("Error inline outline DefectParetoChart:", error);
      // setIsLoading(false);
    }
    return defaultParetoChart;
  };

  const [selectedItems, setSelectedItems] = useState<PChartInputSelect>({
    date: dayjs().format("MMMM-YYYY"), // ex. November-2024
    department: null,
    section: null,
    line: [],
  });

  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [lineOptions, setLineOptions] = useState<string[]>([]);

  // const handleSelect
  const [defectDataSource, setDefectDataSource] = useState<DefectSummaryResult>(
    defaultDefectSummaryResult
  );
  const [causeOfAbnormalDataSource, setCauseOfAbnormalDataSource] =
    useState<CauseOfAbnormalResult>(defaultDefectCauseOfAbnormal);
  const [defectParetoDataSource, setDefectParetoDataSource] =
    useState<DefectParetoChartResult>(defaultParetoChart);

  const handleChange = (key: string, value: string | string[]) => {
    setSelectedItems({ ...selectedItems, [key]: value });
  };

  // trigger at the first time
  useEffect(() => {
    fetchInlineOutlineDefaultDefectSummary();

    // set default chart
    handleResetYearlyDefectChart();
    handleResetMonthlyDefectChart();
    handleResetDailyDefectChart();
    handleResetByTypeDefectChart();
    handleResetByTypeDefectTable();

    handleResetAbnormalOccurrenceTable();

    handleResetdefectParetoChart();
    handleResetDecriptionOfDefect();
  }, []);

  // const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const [isLoading, setIsLoading] = useState(false);

  const handleSearchDefectSummary = async () => {
    if (!selectedItems.date || !selectedItems.department) {
      return;
    }

    setIsLoading(true); // Start loading

    // try {
    //   await Promise.all([
    //     fetchInlineOutlineDefectSummary(
    //       selectedItems.date,
    //       selectedItems.department,
    //       selectedItems.section || "-",
    //       selectedItems.line.length > 0 ? selectedItems.line : lineOptions,
    //       shift
    //     )
    //       .then((res) => {
    //         console.log("fetchInlineOutlineDefectSummary allDataSource:", res);
    //       })
    //       .then(() => delay(700))
    //       .then(() => {
    //         handleRefreshYearlyDefectChart();
    //         handleRefreshMonthlyDefectChart();
    //         handleRefreshDailyDefectChart();
    //         handleRefreshByTypeDefectChart();
    //         handleRefreshByTypeDefectTable();
    //       }),

    //     fetchInlineOutlineCauseOfAbnormal(
    //       selectedItems.date,
    //       selectedItems.department,
    //       selectedItems.section || "-",
    //       selectedItems.line.length > 0 ? selectedItems.line : lineOptions,
    //       shift
    //     )
    //       .then((res) => {
    //         console.log(
    //           "fetchInlineOutlineCauseOfAbnormal CauseOfAbnormal:",
    //           res
    //         );
    //       })
    //       .then(() => delay(700))
    //       .then(() => {
    //         handleRefreshAbnormalOccurrenceTable();
    //       }),

    //     fetchInlineOutlineDefectParetoChart(
    //       selectedItems.date,
    //       selectedItems.department,
    //       selectedItems.section || "-",
    //       selectedItems.line.length > 0 ? selectedItems.line : lineOptions,
    //       shift
    //     )
    //       .then((res) => {
    //         console.log("fetchInlineOutlineDefectParetoChart pareto:", res);
    //       })
    //       .then(() => delay(700))
    //       .then(() => {
    //         handleRefreshdefectParetoChart();
    //         handleRefreshDecriptionOfDefect();
    //       }),
    //   ]);
    // } catch (error) {
    //   console.error("Error fetching defect summary:", error);
    // } finally {
    //   setIsLoading(false); // Stop loading when all API calls are done
    // }
    //!
    try {
      await Promise.allSettled([
        (async () => {
          try {
            const res = await fetchInlineOutlineDefectSummary(
              selectedItems.date || "",
              selectedItems.department || "",
              selectedItems.section || "-",
              selectedItems.line.length > 0 ? selectedItems.line : lineOptions,
              shift
            );
            console.log("fetchInlineOutlineDefectSummary allDataSource:", res);
            await delay(700);
            await handleRefreshYearlyDefectChart();
            await handleRefreshMonthlyDefectChart();
            await handleRefreshDailyDefectChart();
            await handleRefreshByTypeDefectChart();
            await handleRefreshByTypeDefectTable();
          } catch (e) {
            console.error(e);
          }
        })(),
        (async () => {
          try {
            const res = await fetchInlineOutlineCauseOfAbnormal(
              selectedItems.date || "",
              selectedItems.department || "",
              selectedItems.section || "-",
              selectedItems.line.length > 0 ? selectedItems.line : lineOptions,
              shift
            );
            console.log("fetchInlineOutlineCauseOfAbnormal:", res);
            await delay(700);
            await handleRefreshAbnormalOccurrenceTable();
          } catch (e) {
            console.error(e);
          }
        })(),
        (async () => {
          try {
            const res = await fetchInlineOutlineDefectParetoChart(
              selectedItems.date || "",
              selectedItems.department || "",
              selectedItems.section || "-",
              selectedItems.line.length > 0 ? selectedItems.line : lineOptions,
              shift
            );
            console.log("fetchInlineOutlineDefectParetoChart pareto:", res);
            await delay(700);
            await handleRefreshdefectParetoChart();
            await handleRefreshDecriptionOfDefect();
          } catch (e) {
            console.error(e);
          }
        })(),
      ]);
    } catch (error) {
      console.error("Error fetching defect summary:", error);
    } finally {
      setIsLoading(false); // Stop loading when ALL API calls and updates are done
    }
  };

  // trigger when department and month-year are selected
  useEffect(() => {
    if (!selectedItems.department || !selectedItems.date) {
      return;
    }

    fetchInlineOutlineDepartmentSectionChange(
      selectedItems.department!!,
      selectedItems.section || "-"
    ).then((res) => {
      if (
        !selectedItems.date ||
        !selectedItems.department
        // !selectedItems.section ||
        // selectedItems.line?.length === 0
      ) {
        return;
      }

      // set default section to "-"
      const selectedSection = selectedItems.section || "-";

      setLineOptions(res.line);

      setSectionOptions(res.section);

      setSelectedItems((prev) => ({
        ...prev,
        section: selectedSection,
        line: [],
      }));
    });
  }, [
    selectedItems.date,
    selectedItems.department,
    selectedItems.section,
    // selectedItems.line,
  ]);

  useEffect(() => {
    loadUser();
  }, []);

  const selectedItemGridStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
    outline: "1px solid white",
    height: "70px",
  };
  const selectedItemGridStyle2: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
    outline: "1px solid white",
    height: "140px",
  };
  return (
    <Layout>
      <Header
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "10px 20px",
          backgroundColor: "transparent",
          color: "black",
          width: "100%",
          // zIndex: 1000,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginLeft: "160px" }}
        ></div>

        <div style={{ lineHeight: "0.8", marginLeft: "40px" }}>
          <Text
            style={{
              fontSize: "60px",
              color: "#C9184A",
              fontWeight: "bold",
              marginBottom: "4px",
              display: "block",
              lineHeight: "0.85",
            }}
          >
            Inline & Outline Defect Summary
          </Text>
          <Text style={{ fontSize: "25px", color: "gray" }}>
            สรุปปัญหาชิ้นงานบกพร่อง (defect) ที่เกิดจากการผลิต
          </Text>
        </div>
      </Header>
      {/* <Spin
        spinning={isLoading}
        style={{ top: "50%", transform: "translateY(-50%)" }}
      > */}
      <Content style={{ padding: "20px", marginTop: "25px" }}>
        {/* กล่องข้อมูล 5 กล่อง */}
        <Row gutter={[8, 8]} style={{ marginBottom: "10px" }}>
          {/* กล่อง 1 */}
          <Col span={4}>
            <Card
              style={{
                textAlign: "left",
                backgroundColor: "#007bff",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: "22px",
                  fontWeight: "normal",
                  color: "white",
                }}
              >
                %Target Control
              </Text>
              <br />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "white",
                    flexGrow: 1,
                  }}
                >
                  {defectDataSource.target_percent.toFixed(2)}
                </Text>
                <Text
                  style={{
                    fontSize: "20px",
                    fontWeight: "normal",
                    color: "white",
                  }}
                >
                  %
                </Text>
              </div>
            </Card>
          </Col>

          {/* กล่อง 2 */}
          <Col span={4}>
            <Card
              style={{
                textAlign: "left",
                backgroundColor: "#ff9800",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: "22px",
                    fontWeight: "normal",
                    color: "white",
                  }}
                >
                  %Defect
                </Text>
                <img
                  src={
                    defectDataSource.defect_status
                      ? "/assets/images/done.png"
                      : "/assets/images/close.png"
                  }
                  alt="defect_status"
                  style={{
                    width: "25px",
                    height: "25px",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "white",
                    flexGrow: 1,
                  }}
                >
                  {defectDataSource.defect_percent.toFixed(2)}
                </Text>
                <Text
                  style={{
                    fontSize: "20px",
                    fontWeight: "normal",
                    color: "white",
                  }}
                >
                  %
                </Text>
              </div>
            </Card>
          </Col>

          {/* กล่อง 3 */}
          <Col span={4}>
            <Card
              style={{
                textAlign: "left",
                backgroundColor: "#f44336",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: "22px",
                  fontWeight: "normal",
                  color: "white",
                }}
              >
                Total Defect Q'ty
              </Text>
              <br />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "white",
                    flexGrow: 1,
                  }}
                >
                  {formatNumberWithCommas(defectDataSource.total_defect)}
                </Text>
                <Text
                  style={{
                    fontSize: "20px",
                    fontWeight: "normal",
                    color: "white",
                  }}
                >
                  pc(s.)
                </Text>
              </div>
            </Card>
          </Col>

          {/* กล่อง 4 */}
          <Col span={6}>
            <Card
              style={{
                textAlign: "left",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: "22px",
                  fontWeight: "normal",
                  color: "black",
                }}
              >
                Scrap Q'ty
              </Text>
              <br />
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  {formatNumberWithCommas(defectDataSource.scrap_qty)}
                </Text>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: "normal",
                    color: "black",
                    marginLeft: "5px",
                  }}
                >
                  ({defectDataSource.scrap_percent.toFixed(2)}%) pc(s.)
                </Text>
              </div>
            </Card>
          </Col>

          {/* กล่อง 5 */}
          <Col span={6}>
            <Card
              style={{
                textAlign: "left",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: "22px",
                  fontWeight: "normal",
                  color: "black",
                }}
              >
                Repeat NG Q'ty
              </Text>
              <br />
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  {formatNumberWithCommas(defectDataSource.repeat_qty)}
                </Text>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: "normal",
                    color: "black",
                    marginLeft: "5px",
                  }}
                >
                  ({defectDataSource.repeat_percent.toFixed(2)}%) pc(s.)
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* กราฟ Yearly และ Monthly */}
        <Row gutter={[8, 8]} style={{ alignItems: "stretch" }}>
          {/* Yearly Defect Summary */}
          <Col span={8}>
            <Card
              style={{
                height: "100%",
                borderRadius: "8px",
                padding: "0px",
                margin: "0px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <YearlyDefectSummary
                ref={yearlyDefectChartRef}
                DefectDataSource={defectDataSource.graph_yearly_defect_summary}
                username={username()}
              />
            </Card>
          </Col>

          {/* Monthly Defect Summary */}
          <Col span={12}>
            <Card
              style={{
                height: "100%", // ความสูงเท่ากัน
                borderRadius: "8px",
                padding: "0px",
                margin: "0px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <MonthlyDefectSummary
                ref={monthlyDefectChartRef}
                defectDataSource={defectDataSource.graph_monthly_defect_summary}
                username={username()}
              />
            </Card>
          </Col>

          {/* Selected Items */}
          <Col span={4}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "8px", // ระยะห่างระหว่างแต่ละส่วนภายใน
              }}
            >
              {/* Dropdown Filters */}
              <DatePicker
                picker="month"
                placeholder="MMM-YYYY"
                format="MMMM-YYYY"
                defaultValue={dayjs()}
                onChange={(date) => {
                  if (date) {
                    const formattedMonth = date.format("MMMM-YYYY");
                    // console.log("Formatted month:", formattedMonth);
                    setSelectedItems((prev) => ({
                      ...prev,
                      date: formattedMonth,
                    }));
                  } else {
                    // กรณีไม่มีค่า
                    setSelectedItems((prev) => ({
                      ...prev,
                      date: null,
                    }));
                  }
                }}
                style={{ width: "100%", marginBottom: "10px" }}
                // suffixIcon={<CalendarOutlined />}
              />
              <Select
                showSearch
                placeholder="Select Department"
                style={{ width: "100%", marginBottom: "10px" }}
                onChange={(value) => handleChange("department", value)}
              >
                {departmentOptions.map((department, i) => (
                  <Option key={i} value={department}>
                    {department}
                  </Option>
                ))}
              </Select>
              <Select
                showSearch
                placeholder="Select Section"
                style={{ width: "100%", marginBottom: "10px" }}
                onChange={(value: string) => handleChange("section", value)}
                value={selectedItems.section}
              >
                {sectionOptions.map((section, i) => (
                  <Option key={i} value={section}>
                    {section}
                  </Option>
                ))}
              </Select>
              <Select
                mode="multiple"
                placeholder="Select Line"
                style={{ width: "100%", marginBottom: "10px" }}
                onChange={(value: string[]) => handleChange("line", value)}
                value={selectedItems.line}
                maxTagCount={3}
                disabled={selectedItems.section === "-"}
              >
                {lineOptions.map((line, i) => (
                  <Option key={i} value={line}>
                    {line}
                  </Option>
                ))}
              </Select>

              {/* Shift */}
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                  // width: "200px",
                  flex: 2,
                  marginBottom: "10px",
                }}
              >
                <Radio.Group
                  onChange={handleShiftChange}
                  value={shift}
                  buttonStyle="solid"
                  style={{
                    flex: 3,
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                >
                  <Radio.Button
                    value="All"
                    style={{
                      borderRadius: 0,
                      color: "black",
                      textAlign: "center",
                      flex: 1,
                    }}
                  >
                    All
                  </Radio.Button>
                  <Radio.Button
                    value="A"
                    style={{
                      borderRadius: 0,
                      color: "black",
                      textAlign: "center",
                      flex: 1,
                    }}
                  >
                    A
                  </Radio.Button>
                  <Radio.Button
                    value="B"
                    style={{
                      borderRadius: 0,
                      color: "black",
                      textAlign: "center",
                      flex: 1,
                    }}
                  >
                    B
                  </Radio.Button>
                </Radio.Group>
              </Input.Group>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Button
                  style={{
                    fontSize: "10px",
                    marginBottom: "10px",
                    width: "100%",
                  }}
                  type="primary"
                  onClick={handleSearchDefectSummary}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Search"}
                </Button>
              </div>

              {/* Selected Items Display */}
              <Card
                title={
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Selected Items
                  </span>
                }
                bordered={false}
                style={{
                  borderRadius: "8px",
                  boxShadow: "none", // ไม่มีเงาเพื่อความกลมกลืน
                  padding: "2px",
                  backgroundColor: "transparent", // พื้นหลังใส
                  height: "100%",
                }}
              >
                <Card.Grid hoverable={false} style={selectedItemGridStyle}>
                  <strong>Date:</strong>{" "}
                  {getDateRange(selectedItems.date || "Not selected")}
                </Card.Grid>
                <Card.Grid hoverable={false} style={selectedItemGridStyle}>
                  <strong>Department:</strong>{" "}
                  {selectedItems.department || "Not selected"}
                </Card.Grid>
                <Card.Grid hoverable={false} style={selectedItemGridStyle}>
                  <strong>Section:</strong>{" "}
                  {selectedItems.section === "-"
                    ? "Not selected"
                    : selectedItems.section || "Not selected"}
                </Card.Grid>
                <Card.Grid
                  hoverable={false}
                  style={{ ...selectedItemGridStyle2 }}
                >
                  <strong>Line:</strong>{" "}
                  <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                    {selectedItems.line.length > 0
                      ? selectedItems.line.map((line, index) => (
                          <div key={index}>{line}</div>
                        ))
                      : "Not selected"}
                  </div>
                </Card.Grid>
              </Card>
            </Card>
          </Col>
        </Row>

        {/* ส่วน Daily Defect Summary และ Defect Summary By Type */}
        {/* <Card>
          <h2>Inline</h2>
        </Card> */}
        <Row
          gutter={[8, 8]}
          style={{ marginTop: "20px", alignItems: "stretch" }}
        >
          <Col span={16}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                padding: "0px",
                margin: "0px",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <DailyDefectSummary
                ref={dailyDefectSummaryRefInline}
                addtionalLabel={"Inline"}
                defectDataSource={
                  defectDataSource.graph_daily_defect_summary.inline
                }
                username={username()}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                padding: "0px",
                margin: "0px",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <DefectSummaryByType
                ref={defectSummaryByTypeRef}
                defectDataSource={
                  defectDataSource.graph_defect_summary_by_type.inline
                }
                addtionalLabel={"Inline"}
                username={username()}
              />
            </Card>
          </Col>
        </Row>

        {/* ส่วน Daily Defect Summary และ Defect Summary By Type */}
        <Row
          gutter={[8, 8]}
          style={{ marginTop: "20px", alignItems: "stretch" }}
        >
          <Col span={16}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                padding: "0px",
                margin: "0px",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <DailyDefectSummary
                ref={dailyDefectSummaryRefOutline}
                addtionalLabel={"Outline"}
                defectDataSource={
                  defectDataSource.graph_daily_defect_summary.outline
                }
                username={username()}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                padding: "0px",
                margin: "0px",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <DefectSummaryByType
                ref={defectSummaryByTypeRef}
                defectDataSource={
                  defectDataSource.graph_defect_summary_by_type.outline
                }
                addtionalLabel={"Outline"}
                username={username()}
              />
            </Card>
          </Col>
        </Row>

        {/* ส่วน Daily Defect Summary และ Defect Summary By Type */}
        <Row
          gutter={[8, 8]}
          style={{ marginTop: "20px", alignItems: "stretch" }}
        >
          <Col span={16}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                padding: "0px",
                margin: "0px",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <DailyDefectSummary
                ref={dailyDefectSummaryRefInspection}
                addtionalLabel={"Inspection"}
                defectDataSource={
                  defectDataSource.graph_daily_defect_summary.inspection
                }
                username={username()}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                padding: "0px",
                margin: "0px",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <DefectSummaryByType
                ref={defectSummaryByTypeRef}
                defectDataSource={
                  defectDataSource.graph_defect_summary_by_type.inspection
                }
                addtionalLabel={"Inspection"}
                username={username()}
              />
            </Card>
          </Col>
        </Row>

        {/* Cause of abnormal occurrence and Action Record Sheet */}
        <Row style={{ marginTop: "20px" }}>
          <Col span={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Cause of abnormal occurrence and Action Record Sheet
              </Title>
              <ExportAbnormalOccurrence
                input={{
                  month: selectedItems.date || "",
                  department: selectedItems.department || "",
                  section: selectedItems.section || "",
                  line: selectedItems.line,
                }}
                username={username()}
              />
            </div>
            <Card
              bordered={false}
              style={{
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <AbnormalOccurrenceAndActionRecord
                dataSource={causeOfAbnormalDataSource}
                username={username()}
                ref={abnormalOccurrenceAndActionRef}
              />
            </Card>
          </Col>
        </Row>

        <Row style={{ marginTop: "20px" }}>
          <Col span={24}>
            <Card
              bordered={false}
              style={{
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                // display: "flex",
                // justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex" }}>
                <DefectParetoChart
                  dataSource={defectParetoDataSource.defect_pareto_chart.inline}
                  additionalLabel={"Inline"}
                  username={username()}
                  ref={defectParetoChartRefInline}
                />
                {/* </Card> */}
                {/* </Col> */}
                {/* </Row>
        <Row style={{ marginTop: "20px" }}> */}
                {/* <Col span={24}> */}
                {/* <Card
              bordered={false}
              style={{
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            > */}
                <DefectParetoChart
                  dataSource={
                    defectParetoDataSource.defect_pareto_chart.outline
                  }
                  additionalLabel={"Outline"}
                  username={username()}
                  ref={defectParetoChartRefOutline}
                />
                {/* </Card> */}
                {/* </Col> */}
                {/* </Row>
        <Row style={{ marginTop: "20px" }}> */}
                {/* <Col span={24}> */}
                {/* <Card
              bordered={false}
              style={{
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            > */}
                <DefectParetoChart
                  dataSource={
                    defectParetoDataSource.defect_pareto_chart.inspection
                  }
                  additionalLabel={"Inspection"}
                  username={username()}
                  ref={defectParetoChartRefInspection}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Descriptionofdefect */}
        <Row style={{ marginTop: "20px" }}>
          <Col span={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Description of Defect
              </Title>
              {/* ExportDescription */}
              <ExportDescription
                input={{
                  month: selectedItems.date || "",
                  department: selectedItems.department || "",
                  section: selectedItems.section || "",
                  line: selectedItems.line,
                }}
                username={username()}
              />
            </div>
            <Card
              bordered={false}
              style={{
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <DescriptionOfDefect
                dataSource={defectParetoDataSource}
                username={username()}
                ref={descriptionOfDefectRef}
              />
            </Card>
          </Col>
        </Row>
      </Content>
      {/* </Spin> */}
    </Layout>
  );
}
