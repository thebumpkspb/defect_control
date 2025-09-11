"use client";
import {
  exportPChartDefectRecordDownload,
  exportPChartDefectRecordDownloadNoErr,
  pChartCtlPartByLineNoErr,
  pChartCtlSettingLine,
  pChartCtlSubLinesByPartLine,
} from "@/lib/api";
import { processType, shiftList } from "@/master_data/masterdata";
import { LayoutStore, UserStore } from "@/store";
import { PChartLine, PChartPart, PChartSubLines } from "@/types/pChartApi";
import { CalendarOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  InputNumber,
  Layout,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const { setUser, loadUser } = UserStore.getState();

export default function PChartHeader() {
  const [lineSetting, setLineSettings] = useState<PChartLine[]>([]);
  const [parts, setParts] = useState<PChartPart[]>([]);
  const [subLines, setSubLines] = useState<PChartSubLines[]>([]);

  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const [selectedLineCodeRx, setSelectedLineCodeRx] = useState<string | null>(
    null
  );
  const [selectedLineName, setSeletedLineName] = useState<string | null>(null);
  const [shift, setShift] = useState("All");
  const [month, setMonth] = useState<string | null>(null);
  const [process, setProcess] = useState<string | null>(null);
  const [selectedPartNo, setSelectedPartNo] = useState<string | null>(null);
  const [selectedSubLine, setSelectedSubLine] = useState<string | null>(null);
  const [selectedSubLineLabel, setSelectedSubLineLabel] = useState<
    string | null
  >(null);
  const [isNotZeroSwitch, setIsNotZeroSwitch] = useState<boolean>(false);

  // console.log("selectedSubLineLabel:", selectedSubLineLabel);
  const [loadingExportFile, setLoadingExportFile] = useState(false);
  const { setIsLoading } = LayoutStore.getState();
  const fetchLineSettings = async () => {
    setIsLoading(true);
    try {
      const response = await pChartCtlSettingLine(null, false);
      // console.log("Line Settings:", response.lines);
      setLineSettings(response.lines);
    } catch (error) {
      console.error("Error fetching line settings:", error);
    }
    setIsLoading(false);
  };

  const fetchParts = async () => {
    if (selectedLineId === null) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await pChartCtlPartByLineNoErr(
        selectedLineId.toString(),
        process
      );
      // console.log("Parts:", response.parts);
      setParts(response.parts);
      setSelectedPartNo(null);
    } catch (error) {
      setParts([]);
      setSelectedPartNo(null);
      // handleResetPChart();
      console.error("Error fetching line settings:", error);
    }
    setIsLoading(false);
  };

  // const fetchSubLines = async () => {
  //   if (selectedLineId === null) {
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const response = await pChartCtlPartByLineNoErr(
  //       selectedLineId.toString()
  //     );
  //     console.log("Parts:", response.parts);
  //     setParts(response.parts);
  //     setSelectedPartNo(null);
  //   } catch (error) {
  //     setParts([]);
  //     setSelectedPartNo(null);
  //     // handleResetPChart();
  //     console.error("Error fetching line settings:", error);
  //   }
  //   setIsLoading(false);
  // };

  const fetchSubLines = async () => {
    if (selectedLineId === null && selectedPartNo === null) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await pChartCtlSubLinesByPartLine(
        selectedLineCodeRx,
        selectedPartNo
      );
      // console.log("Parts:", response.parts);
      setSubLines(response.sub_lines);
    } catch (error) {
      setSubLines([]);
      setSelectedSubLine(null);
      setSelectedSubLineLabel(null);
      // handleResetPChart();
      console.error("Error fetching line settings:", error);
    }
    setIsLoading(false);
  };

  const generatePdfFileName = (
    process: string,
    part_no: string,
    now: Date
  ): string => {
    const month: string = String(now.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month (01-12)
    const year: number = now.getFullYear();
    const unix_time: number = Math.floor(now.getTime() / 1000); // Unix timestamp in seconds

    return `${process}-${part_no || "All"}-${month}-${year}-${unix_time}`;
  };

  const handleDownloadExportDeflectFile: any = (file_type: string) => {
    console.log("handleDownloadExportDeflectFile");
    const missingFields: string[] = [];

    if (!month) {
      missingFields.push("Month/Year");
    }

    if (!selectedLineName) {
      missingFields.push("Line Name");
    }

    if (!selectedPartNo && process != "Outline") {
      missingFields.push("Part No");
    }
    if (!selectedSubLine && process != "Outline") {
      missingFields.push("Sub Line");
    }

    if (!process) {
      missingFields.push("Process");
    }

    if (!shift) {
      missingFields.push("Shift");
    }

    // Show a modal if there are missing fields
    if (missingFields.length > 0) {
      Modal.warning({
        title: "Missing Information",
        content: `Please Select the following fields:\n${missingFields.join(
          "\n"
        )}`,
        okText: "OK",
      });
      return; // Exit the function to prevent submission
    }

    const now: Date = new Date();

    const fileName = generatePdfFileName(process!!, selectedPartNo!!, now);

    setLoadingExportFile(true);
    exportPChartDefectRecordDownloadNoErr(
      {
        month: month!!,
        line_name: selectedLineName!!,
        part_no: selectedPartNo!!,
        sub_line: selectedSubLine!!,
        process: process!!,
        shift: shift,
        sub_line_label: selectedSubLineLabel,
        file_type: file_type,
        is_not_zero: isNotZeroSwitch,
      },
      fileName
    )
      .then(() => {
        console.log("Download successful!");
      })
      .catch((err) => {
        console.error("Error:", err.message);
        message.error("No data");
      })
      .finally(() => {
        setLoadingExportFile(false);
      });
  };

  useEffect(() => {
    fetchLineSettings();
    loadUser();
  }, []);

  useEffect(() => {
    console.log("user effect selectedLineId: triggered");

    if (!selectedLineId) {
      return;
    }
    fetchParts();
    if (process && process == "Outline") {
      setSelectedSubLine("Outline");
    } else {
      setSelectedSubLine(null);
    }
  }, [selectedLineId, process]);
  useEffect(() => {
    console.log("user effect selectedPartNo: triggered");

    setSelectedSubLineLabel(null);
    if (!selectedLineId && !selectedPartNo) {
      return;
    }
    if (process && process !== "Outline") {
      setSelectedSubLine(null);
      fetchSubLines();
    }
  }, [selectedPartNo]);

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
            Export Defect to PDF
          </Text>
          <Text style={{ fontSize: "25px", color: "gray" }}>
            ดาวน์โหลดข้อมูล Defect ในรูปแบบ PDF
          </Text>
        </div>
      </Header>

      <Content
        style={{
          padding: "20px",
          marginTop: "25px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Row gutter={[8, 8]} style={{ alignItems: "stretch" }}>
          <Col span={24}>
            <Card
              style={{
                height: "100%",
                borderRadius: "8px",
                padding: "0px",
                margin: "0px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Layout
                style={{
                  display: "flex",
                  padding: "0px",
                  flexDirection: "column",
                  // backgroundColor: "#ffffff",
                  maxWidth: "100%",
                  margin: "15px 0 15px 0",
                  // borderRadius: "7px",
                  alignItems: "stretch",
                }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "700px" }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: "red",
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginBottom: "10px",
                    }}
                  >
                    กรุณา กรอกข้อมูลที่ต้องการให้ครบถ้วน
                  </div>

                  <Input.Group
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "0 8px",
                        display: "flex",
                        alignItems: "center",
                        height: "32px",
                        flex: "1",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          flex: "1",
                          background: "white",
                          textAlign: "right",
                          borderRadius: "5px",
                          paddingRight: "8px",
                        }}
                      >
                        <text style={{ color: "red" }}>*</text>Line Name :
                      </Text>
                    </div>
                    <Select
                      showSearch
                      placeholder="Select Line name"
                      value={selectedLineName}
                      options={lineSetting.map(({ section_line, line_id }) => ({
                        value: section_line,
                        label: section_line,
                      }))}
                      style={{
                        flex: "3",
                      }}
                      onChange={(section_line) => {
                        setSeletedLineName(section_line);
                        setSelectedLineId(
                          lineSetting.find(
                            (item) => item.section_line === section_line
                          )?.line_id || null
                        );
                        setSelectedLineCodeRx(
                          lineSetting.find(
                            (item) => item.section_line === section_line
                          )?.line_code_rx || null
                        );
                      }}
                    />
                  </Input.Group>

                  <Input.Group
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "0 8px",
                        display: "flex",
                        alignItems: "center",
                        height: "32px",
                        flex: "1",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          flex: "1",
                          background: "white",
                          textAlign: "right",
                          borderRadius: "5px",
                          paddingRight: "5px",
                        }}
                      >
                        <text style={{ color: "red" }}>*</text>Shift :
                      </Text>
                    </div>
                    <Radio.Group
                      options={[
                        // { label: "All", value: "All" },
                        { label: "A", value: "A" },
                        { label: "B", value: "B" },
                      ]}
                      style={{
                        flex: 3,
                        marginLeft: "8px",
                      }}
                      onChange={(e) => {
                        setShift(e.target.value);
                      }}
                      value={shift}
                    />
                  </Input.Group>

                  <Input.Group
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "0 8px",
                        display: "flex",
                        alignItems: "center",
                        height: "32px",
                        flex: "1",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          flex: "1",
                          background: "white",
                          textAlign: "right",
                          borderRadius: "5px",
                          paddingRight: "5px",
                        }}
                      >
                        <text style={{ color: "red" }}>*</text>Process :
                      </Text>
                    </div>
                    <Select
                      placeholder="Select Process"
                      value={process}
                      options={processType.map((item) => ({
                        value: item.value,
                        label: item.value,
                      }))}
                      style={{
                        flex: "3",
                      }}
                      onChange={(value) => {
                        setProcess(value);
                      }}
                      allowClear
                    />
                  </Input.Group>

                  <Input.Group
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "0 8px",
                        display: "flex",
                        alignItems: "center",
                        height: "32px",
                        flex: "1",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          flex: "1",
                          background: "white",
                          textAlign: "right",
                          borderRadius: "5px",
                          // paddingRight: "1px",
                        }}
                      >
                        <text style={{ color: "red" }}>*</text>Month :
                      </Text>
                    </div>
                    <DatePicker
                      picker="month"
                      placeholder="Select Month"
                      format="MMMM-YYYY"
                      inputReadOnly
                      allowClear={false}
                      value={
                        month
                          ? dayjs(month, "MMMM-YYYY") // Convert string to dayjs
                          : null
                      }
                      onChange={(date) => {
                        if (date) {
                          const formattedMonth = date.format("MMMM-YYYY");
                          // console.log("Formatted month:", formattedMonth);
                          // setSelectMonthYear(formattedMonth);
                          setMonth(formattedMonth);
                        }
                      }}
                      style={{
                        flex: "3",
                        textAlign: "center",
                        height: "32px",
                        color: "black",
                        marginLeft: "8px",
                        border: "1px solid #d9d9d9",
                      }}
                      suffixIcon={<CalendarOutlined />}
                    />
                  </Input.Group>

                  <Input.Group
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "0 8px",
                        display: "flex",
                        alignItems: "center",
                        height: "32px",
                        flex: "1",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          flex: "1",
                          background: "white",
                          textAlign: "right",
                          borderRadius: "5px",
                          paddingRight: "8px",
                        }}
                      >
                        <text style={{ color: "red" }}>*</text>Part No :
                      </Text>
                    </div>
                    <Select
                      showSearch
                      disabled={process == "Outline"}
                      placeholder="Select Part No"
                      value={selectedPartNo}
                      options={parts.map(({ part_no }) => ({
                        value: part_no,
                        label: part_no,
                      }))}
                      style={{
                        flex: "3",
                      }}
                      onChange={(value) => {
                        setSelectedPartNo(value);
                      }}
                    />
                  </Input.Group>

                  <Input.Group
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "0 8px",
                        display: "flex",
                        alignItems: "center",
                        height: "32px",
                        flex: "1",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          flex: "1",
                          background: "white",
                          textAlign: "right",
                          borderRadius: "5px",
                          paddingRight: "8px",
                        }}
                      >
                        <text style={{ color: "red" }}>*</text>Sub Line :
                      </Text>
                    </div>
                    <Select
                      disabled={process == "Outline"}
                      showSearch
                      placeholder="Select Sub Line"
                      value={selectedSubLine}
                      options={subLines.map((subLine) => ({
                        value: subLine.rxno_part,
                        label: subLine.process || " ",
                      }))}
                      style={{
                        flex: "3",
                      }}
                      onChange={(value, option: any) => {
                        setSelectedSubLine(value);
                        setSelectedSubLineLabel(option.label);
                      }}
                    />
                  </Input.Group>
                  <Input.Group
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "0 8px",
                        display: "flex",
                        alignItems: "center",
                        height: "32px",
                        flex: "1",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          flex: "1",
                          background: "white",
                          textAlign: "right",
                          borderRadius: "5px",
                          paddingRight: "8px",
                        }}
                      >
                        <text style={{ color: "red" }}></text>Filter Data :
                      </Text>
                    </div>
                    <Switch
                      checkedChildren="Only Defect"
                      unCheckedChildren="Not Filter"
                      value={isNotZeroSwitch}
                      onChange={() => setIsNotZeroSwitch(!isNotZeroSwitch)}
                    />
                  </Input.Group>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                  >
                    <Button
                      type="primary"
                      onClick={() => handleDownloadExportDeflectFile("pdf")}
                      disabled={loadingExportFile}
                    >
                      {loadingExportFile ? "Downloading..." : "Generate PDF"}
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => handleDownloadExportDeflectFile("excel")}
                      disabled={loadingExportFile}
                    >
                      {loadingExportFile ? "Downloading..." : "Generate Excel"}
                    </Button>
                  </div>
                </Space>
              </Layout>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
