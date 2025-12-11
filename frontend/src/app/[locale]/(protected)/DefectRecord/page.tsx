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
} from "antd";
import {
  HomeOutlined,
  LogoutOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState, useEffect, SetStateAction, useRef } from "react";
import PChart, { PChartRef } from "./P-Chart";
import PChartRecordTable from "./PChartRecordTable";
import {
  pChartAbnormalOccurrenceView,
  pChartCtlPartByLine,
  pChartCtlSettingLine,
  pChartGenaralInformationNoErr,
  pChartCtlPartByLineNoErr,
  fetchLines,
  pChartCtlSubLinesByPartLine,
} from "@/lib/api";
import {
  PChartGeneralInformation,
  PChartLine,
  PChartPart,
  PChartSubLines,
} from "@/types/pChartApi";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

import { LayoutStore, ModeStore, UserStore } from "@/store";
import { delay } from "@/functions";
import { AddNewRecordRef } from "./AddNewRecord";
import dayjs from "dayjs";
import { formatNumber } from "@/functions/helper";
const { setUser, loadUser } = UserStore.getState();

const defaultGeneralInformation: PChartGeneralInformation = {
  part_name: "",
  target_control: null,
  p_last_month: null,
  n_bar: null,
  p_bar: null,
  k: null,
  uclp: null,
  lclp: null,
  id: null,
  month: null,
  line_name: null,
  part_no: null,
  shift: null,
  process: null,
  sub_line: null,
};

export default function PChartHeader() {
  const {
    user,
    username,
    shortname,
    isAdmin,
    isLoggedIn,
    loadUser,
    clearUser,
  } = UserStore();
  // console.log("user.shift_name:", user?.shift_name);
  const { setIsLoading } = LayoutStore.getState();
  const [shift, setShift] = useState(
    user?.shift_name == "A" || user?.shift_name == "B"
      ? user?.shift_name
      : "All"
  );
  const [currentDate, setCurrentDate] = useState("");
  const [lineSetting, setLineSettings] = useState<PChartLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedLineCodeRx, setSelectedLineCodeRx] = useState<string | null>(
    null
  );
  const [selectedSectionLine, setSelectedSectionLine] = useState<string | null>(
    null
  );
  const [parts, setParts] = useState<PChartPart[]>([]);
  const [subLines, setSubLines] = useState<PChartSubLines[]>([]);
  const [selectedPartNo, setSelectedPartNo] = useState<string | null>(null);
  const [selectedSubLine, setSelectedSubLine] = useState<string | null>(null);
  // const [selectedLineName, setSeletedLineName] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(
    dayjs().format("MMMM-YYYY")
  );
  const [process, setProcess] = useState<string | null>(null);

  const chartRef = useRef<PChartRef>(null);

  const handleResetPChart = () => {
    chartRef.current?.setChartToDefault();
  };
  // console.log("selectedLineId:", selectedLineId);
  const handleRefreshPChart = () => {
    chartRef.current?.refreshPChart();
  };
  // console.log("selectedSubLine:", selectedSubLine);
  const fetchLineSettings = async () => {
    setIsLoading(true);
    try {
      // const response = await pChartCtlSettingLine(null, false);
      const response = await fetchLines();
      // console.log("Line Settings:", response.lines);
      const user_line = response.lines.filter((item) =>
        user?.line_id_group?.includes(item.line_id)
      );
      // console.log("user_line:", user_line);
      // setLineSettings(response.lines);
      setLineSettings(user_line);
      if (user_line.length == 1) {
        setSelectedLineId(String(user_line[0].line_id));
        setSelectedLineCodeRx(String(user_line[0].line_code_rx));
        setSelectedSectionLine(String(user_line[0].section_line));
      }
    } catch (error) {
      handleResetPChart();
      console.error("Error fetching line settings:", error);
    }
    setIsLoading(false);
  };

  const fetchParts = async () => {
    if (selectedLineId == null) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await pChartCtlPartByLineNoErr(selectedLineId, process);
      // console.log("Parts:", response.parts);
      setParts(response.parts);
    } catch (error) {
      setParts([]);
      setSelectedPartNo(null);
      handleResetPChart();
      console.error("Error fetching line settings:", error);
    }
    setIsLoading(false);
  };
  const fetchSubLines = async () => {
    if (selectedLineId == null || selectedPartNo == null) {
      return;
    }
    setIsLoading(true);
    try {
      // if (selectedLineCodeRx && selectedLineCodeRx) {
      const response = await pChartCtlSubLinesByPartLine(
        selectedLineCodeRx,
        selectedPartNo
      );
      // console.log("Parts:", response.parts);
      setSubLines(response.sub_lines);
      if (response.sub_lines.length == 1) {
        setSelectedSubLine(response.sub_lines[0].rxno_part);
      }
      // }
    } catch (error) {
      setSubLines([]);
      setSelectedSubLine(null);
      handleResetPChart();
      console.error("Error fetching line settings:", error);
    }
    setIsLoading(false);
  };

  const [generalInformation, setGeneralInformation] =
    useState<PChartGeneralInformation>({
      part_name: "",
      target_control: null,
      p_last_month: null,
      n_bar: null,
      p_bar: null,
      k: null,
      uclp: null,
      lclp: null,
      id: null,
      month: null,
      line_name: null,
      part_no: null,
      shift: null,
      process: null,
      sub_line: null,
    });

  const refreshGeneralInfomation = () => {
    // setIsLoading(true);
    delay(3000)
      .then(() => fetchGeneralInformation())
      .catch((error) =>
        console.error("Error refreshing gerenal information:", error)
      );
    // setIsLoading(false);
  };

  const fetchGeneralInformation = async () => {
    const selectedMonth = month;
    const currentSelectedLineId = selectedLineId;
    const currentSelectedPartNo = selectedPartNo;
    const currentSelectedSubLine = selectedSubLine;
    const currentShift = shift;
    const currentProcess = process;

    if (
      !selectedMonth ||
      !currentSelectedLineId ||
      // !currentSelectedPartNo ||
      !currentShift ||
      !currentProcess
      // !currentSelectedSubLine
    ) {
      console.log("ข้อมูลไม่ครบ ไม่สามารถยิง API ได้");
      // console.log("Selected section Line:", selectedSectionLine);
      if (!month) console.log("ขาดข้อมูล: month");
      if (!selectedLineId) console.log("ขาดข้อมูล: selectedLineId");
      if (!selectedPartNo) console.log("ขาดข้อมูล: selectedPartNo");
      if (!selectedSubLine) console.log("ขาดข้อมูล: selectedSubLine");
      if (!shift) console.log("ขาดข้อมูล: shift");
      if (!process) console.log("ขาดข้อมูล: process");
      return;
    }

    const payload = {
      month: selectedMonth,
      line_name:
        lineSetting.find(
          (line) => line.line_id.toString() === currentSelectedLineId
        )?.section_line || "",
      part_no: currentSelectedPartNo,
      shift: currentShift,
      process: currentProcess,
      sub_line: currentSelectedSubLine,
    };
    // console.log("payload:", payload);
    // setIsLoading(true);
    try {
      const response = await pChartGenaralInformationNoErr(payload);
      console.log("General Information Response:", response);
      if (response.general_information_result?.length) {
        setGeneralInformation(response.general_information_result[0]);
      } else {
        setGeneralInformation(defaultGeneralInformation);
        console.log("ไม่มีข้อมูลจาก API");
      }
    } catch (error) {
      setGeneralInformation(defaultGeneralInformation);
      console.log("Error fetching general information:", error);
      console.log("การส่งข้อมูลล้มเหลว");
    }
    // setIsLoading(false);
  };

  useEffect(() => {
    setSelectedPartNo(null); // reset part no when line changes
    setSelectedLineCodeRx(
      lineSetting.find((line) => line.line_id.toString() === selectedLineId)
        ?.line_code_rx || ""
    );
    fetchLineSettings();
    if (selectedLineId && process) {
      fetchParts();
    }
  }, [selectedLineId, process]);

  useEffect(() => {
    setSelectedSubLine(null); // reset part no when line changes

    // fetchLineSettings();
    fetchSubLines();
    if (selectedLineId && process && process == "Outline") {
      setSelectedSubLine("Outline");
    }
  }, [selectedPartNo]);

  useEffect(() => {
    fetchGeneralInformation();
  }, [month, selectedLineId, selectedPartNo, shift, process, selectedSubLine]);

  // handle user login logic
  useEffect(() => {
    // ฟังก์ชันเพื่อจัดรูปแบบวันที่ปัจจุบัน
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);

    loadUser();
  }, []);

  const handleShiftChange = (e: RadioChangeEvent) => {
    setShift(e.target.value);
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
            Defect Record
          </Text>
          <Text style={{ fontSize: "25px", color: "gray" }}>
            บันทึกข้อมูล Defect ประจำวัน และกราฟสรุปผลการลงข้อมูล
          </Text>
        </div>
      </Header>

      <Content
        style={{
          paddingTop: "50px",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <Title
          level={3}
          style={{
            textAlign: "left",
            fontSize: "18px",
          }}
        >
          General Information
        </Title>

        {/* <h1>select-line-id: {selectedLineId}</h1>
        <h1>select-part-name: {selectedPartName}</h1> */}

        {/* ช่องกรอกข้อมูล General Information */}
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", paddingRight: "50px" }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px", // Space between elements
              width: "100%",
            }}
          >
            {/* Month */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "200px",
                flex: 1,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>Month</Text>
              </div>
              <DatePicker
                picker="month"
                placeholder="MMM-YYYY"
                format="MMMM-YYYY"
                defaultValue={dayjs()}
                onChange={(date) => {
                  if (date) {
                    const formattedMonth = date.format("MMMM-YYYY");
                    // console.log("Formatted month:", formattedMonth);
                    setMonth(formattedMonth);
                  } else {
                    setMonth(null); // กรณีไม่มีค่า
                  }
                }}
                style={{
                  border: "none",
                  flex: 1,
                  textAlign: "center",
                  height: "32px",
                  color: "black",
                }}
                suffixIcon={<CalendarOutlined />}
              />
            </Input.Group>

            {/* Line Name */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "410px",
                flex: 3.05,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>Line Name</Text>
              </div>
              <Select
                placeholder="Select Line Name"
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  color: "black",
                }}
                value={selectedLineId}
                onChange={(value) => {
                  const selectedLine = lineSetting.find(
                    (line) => line.line_id.toString() === value
                  );
                  setSelectedLineId(value); // อัปเดต line_id
                  setSelectedSectionLine(selectedLine?.section_line || "");
                }}
                showSearch
                filterOption={(input, option) => {
                  const optionLabel =
                    (option?.children as unknown as string) || "";
                  return optionLabel
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {lineSetting.map((line) => (
                  <Select.Option
                    key={line.line_id}
                    value={line.line_id.toString()}
                  >
                    {line.section_line}
                  </Select.Option>
                ))}
              </Select>
            </Input.Group>
            {/* Process */}
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
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>Process</Text>
              </div>
              <Select
                placeholder="Select Process"
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  color: "black",
                }}
                value={process}
                onChange={(value) => {
                  // console.log("Process selected:", value);
                  setProcess(value);
                }}
              >
                <Select.Option value="Inline">Inline</Select.Option>
                <Select.Option value="Outline">Outline</Select.Option>
                <Select.Option value="Inspection">Inspection</Select.Option>
              </Select>
            </Input.Group>
            {/* Part No. */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                flex: 1.5,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>Part No.</Text>
              </div>
              <Select
                allowClear
                placeholder="Select Part No."
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  color: "black",
                }}
                value={selectedPartNo}
                onChange={(value) => {
                  setSelectedSubLine(null);
                  setSelectedPartNo(value);
                }}
                showSearch
                filterOption={(input, option) => {
                  const optionLabel =
                    (option?.children as unknown as string) || "";
                  return optionLabel
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {parts.map((part) => (
                  <Select.Option key={part.part_no} value={part.part_no}>
                    {part.part_no}
                  </Select.Option>
                ))}
              </Select>
            </Input.Group>

            {/* Sub Line */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                flex: 1.5,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>Sub Line</Text>
              </div>
              <Select
                allowClear
                placeholder="Select Sub Line"
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  color: "black",
                }}
                value={selectedSubLine}
                onChange={(value) => setSelectedSubLine(value)}
                showSearch
                filterOption={(input, option) => {
                  const optionLabel =
                    (option?.children as unknown as string) || "";
                  return optionLabel
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {subLines.map((subLine) => (
                  <Select.Option
                    key={subLine.rxno_part}
                    value={subLine.rxno_part}
                    // label={subLine.process}
                  >
                    {subLine.process || " "}
                  </Select.Option>
                ))}
              </Select>
            </Input.Group>
            {/* Part Name */}
            {/* <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "300px",
                flex: 1.5,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>Part Name</Text>
              </div>
              <Input
                placeholder=" "
                value={
                  generalInformation.part_name ||
                  parts.find((part) => part.part_no === selectedPartNo)
                    ?.part_name ||
                  ""
                }
                readOnly
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  color: "black",
                }}
              />
            </Input.Group> */}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px", // Space between elements
              width: "100%",
            }}
          >
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
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "32px",
                  flex: 0.8,
                }}
              >
                <Text style={{ color: "gray", textAlign: "center" }}>
                  Shift
                </Text>
              </div>
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

            {/* Process */}
            {/* <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "200px",
                flex: 2,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>Process</Text>
              </div>
              <Select
                placeholder="Select Process"
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  color: "black",
                }}
                value={process}
                onChange={(value) => {
                  // console.log("Process selected:", value);
                  setProcess(value);
                }}
              >
                <Select.Option value="Inline">Inline</Select.Option>
                <Select.Option value="Outline">Outline</Select.Option>
                <Select.Option value="Inspection">Inspection</Select.Option>
              </Select>
            </Input.Group> */}

            {/* Target Control */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "200px", // Full width
                flex: 1.975,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>Target Control</Text>
              </div>
              <Input
                placeholder="0.00 %"
                value={
                  generalInformation.target_control !== null
                    ? `${generalInformation.target_control} %`
                    : ""
                }
                readOnly
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  color: "black",
                }}
              />
            </Input.Group>

            {/* P Last Month */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "200px", // Full width
                flex: 1.975,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>P Last Month</Text>
              </div>
              <Input
                placeholder="0.00 %"
                value={
                  generalInformation.p_last_month !== null
                    ? `${generalInformation.p_last_month} %`
                    : ""
                }
                readOnly
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  color: "black",
                }}
              />
            </Input.Group>

            {/* n */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "114px",
                flex: 1.15,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>n</Text>
              </div>
              <Input
                placeholder="0.00"
                value={formatNumber(Number(generalInformation.n_bar)) ?? ""}
                readOnly
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  textAlign: "center",
                  color: "black",
                }}
              />
            </Input.Group>

            {/* p */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "114px",
                flex: 1.15,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>p</Text>
              </div>
              <Input
                placeholder="0.00%"
                value={
                  generalInformation.p_bar !== null
                    ? `${generalInformation.p_bar} %`
                    : ""
                }
                readOnly
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  textAlign: "center",
                  color: "black",
                }}
              />
            </Input.Group>

            {/* k */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "114px",
                flex: 1.15,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>k</Text>
              </div>
              <Input
                placeholder="0.00%"
                value={
                  generalInformation.k !== null
                    ? `${generalInformation.k} %`
                    : ""
                }
                readOnly
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  textAlign: "center",
                  color: "black",
                }}
              />
            </Input.Group>

            {/* UCLp */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "114px",
                flex: 1.15,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>UCLp</Text>
              </div>
              <Input
                placeholder="0.00%"
                value={
                  generalInformation.uclp !== null
                    ? `${generalInformation.uclp} %`
                    : ""
                }
                readOnly
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  textAlign: "center",
                  color: "black",
                }}
              />
            </Input.Group>

            {/* LCLp */}
            <Input.Group
              compact
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "5px",
                overflow: "hidden",
                // width: "114px",
                flex: 1.15,
              }}
            >
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                }}
              >
                <Text style={{ color: "gray" }}>LCLp</Text>
              </div>
              <Input
                placeholder="0.00%"
                value={
                  generalInformation.lclp !== null
                    ? `${generalInformation.lclp} %`
                    : ""
                }
                readOnly
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  textAlign: "center",
                  color: "black",
                }}
              />
            </Input.Group>
          </div>
        </Space>

        <PChart
          ref={chartRef}
          input={{
            month: month,
            line_name: selectedSectionLine,
            line_id: selectedLineId,
            part_no: selectedPartNo,
            shift: shift,
            process: process,
            sub_line: selectedSubLine,
          }}
          username={username()}
        />
        <PChartRecordTable
          input={{
            month: month,
            line_name: selectedSectionLine,
            part_no: selectedPartNo,
            shift: shift,
            process: process,
            sub_line: selectedSubLine,
            line_code_rx: selectedLineCodeRx,
          }}
          handleRefreshPChart={handleRefreshPChart}
          refreshGeneralInfomation={refreshGeneralInfomation}
          useruuid={user?.user_uuid}
          username={username()}
        />
      </Content>
    </Layout>
  );
}
