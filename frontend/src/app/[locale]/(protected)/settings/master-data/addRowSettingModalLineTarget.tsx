"use client";
import {
  Button,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  TableColumnsType,
  Typography,
  theme,
} from "antd";

import { NextPage } from "next";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { LayoutStore, ModeStore } from "@/store";

import { Noto_Sans_Thai } from "next/font/google";
import DropDownLabel from "@/components/button/dropdown-label";
import {
  fetchDefectModes,
  fetchLines,
  fetchPartsByLine,
  pChartCtlSubLinesByPartLine,
  settingDefectModeAddRowOk,
  settingDefectModeAddRowView,
  settingDefectModeAddRowViewLineNameChange,
  settingTargetAddRowOk,
  settingTargetAddRowView,
  settingTargetAddRowViewLineNameChange,
} from "@/lib/api";
import {
  AddRowViewResult,
  AddRowViewResultPart,
  DefectModeAddRowViewLineNameChangeResult,
  DefectModeAddRowViewResult,
  Group,
  Line,
  Part,
  SettingTableResult,
  SettingTargetAddRowOkRequest,
} from "@/types/settingApi";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PChartSubLines } from "@/types/pChartApi";

const { Title, Text } = Typography;
const notoTH = Noto_Sans_Thai({ subsets: ["thai", "latin", "latin-ext"] });
const { Content } = Layout;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  { value: "M/C Set up", hasDefectMode: false },
  { value: "Quality Test", hasDefectMode: false },
];

interface TargetType {
  value: string;
}

const targetTypeList: TargetType[] = [
  { value: "Monthly" },
  { value: "Fiscal Year" },
];

interface AddRowSettingModalProps {
  open: boolean;
  onCancel: () => void;
  lines: Line[];
  groups: Group[];
  masterDataPageSelectedLineId: number | null;
  masterDataPageSelectedLineName: string | null;
  masterDataPageSelectedSectionLine: string | null;
  masterDataPageSelectedPartNo: string | null;
  masterDataPageSelectedPartName: string | null;
  masterDataPageSelectedSubLine: string | null;
  currentMasterType: string; // "defect_mode" | "target"
  //   partNoOptions: string[];
  masterDataPageSelectedGroupName: string;
  //   input: PChartPreviewPopupInput;
  userName: string;
  triggerUpdateTableData: () => void | Promise<void>;
}

const AddRowSettingModalLineTarget: React.FC<AddRowSettingModalProps> = ({
  open,
  onCancel,
  lines,
  groups,
  masterDataPageSelectedLineId,
  masterDataPageSelectedLineName,
  masterDataPageSelectedSectionLine,
  masterDataPageSelectedPartNo,
  masterDataPageSelectedPartName,
  masterDataPageSelectedSubLine,
  currentMasterType,
  masterDataPageSelectedGroupName,
  userName,
  triggerUpdateTableData,
}) => {
  const [selectedSectionLine, setSelectedSectionLine] = useState<string | null>(
    ""
  );
  const [selectedLineCodeRx, setSelectedLineCodeRx] = useState<string | null>(
    ""
  );
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const [selectedPartNo, setSelectedPartNo] = useState<string | null>(null);
  const [partName, setPartName] = useState<string | null>(null);
  const [subLine, setSubLine] = useState<any>(null);
  const [subLineList, setSubLineList] = useState<PChartSubLines[]>([]);
  const [selectTargetType, setSelectTargetType] = useState<string>("Monthly");
  const [selectMonthYear, setSelectMonthYear] = useState<string>("");
  const [targetControl, setTargetControl] = useState<number>(0.0);
  //   const [partNameOptions, setPartNameOptions] = useState<string[]>([]);
  const [partNoOptions, setPartNoOptions] = useState<AddRowViewResultPart[]>(
    []
  );
  const [parts, setParts] = useState<Part[]>([]);
  const [defectTypeOptions, setDefectTypeOptions] = useState<DefectType[]>([]);
  const [selectedDefectType, setSelectedDefectType] = useState<string>("");
  const [defectMode, setDefectMode] = useState<string>("");
  const [process, setProcess] = useState<string | null>(null);
  const [groupType, setGroupType] = useState("by_part"); // "by_group", "by_part"
  const { isLoading } = LayoutStore();
  const { setIsLoading } = LayoutStore.getState();
  const handleCloseModal = () => {
    setDefectMode("");
    setSelectedDefectType("");
    setProcess(null);

    setSelectMonthYear("");
    setSelectTargetType("");
    setTargetControl(0.0);
    onCancel();

    onCancel();
  };
  console.log("partNoOptions:", partNoOptions);
  console.log("lines:", lines);
  const getLineNameListWithEmptyVal = () => [
    ...lines,
    {
      line_id: 0,
      line_name: "-",
      line_fullname: "-",
      line_code: "-",
      work_center_code: "-",
      process_code: [],
      line_group: [],
      group_type: "-",
      section_id: "-",
      section_line: "-",
      line_code_rx: "-",
    },
  ];
  console.log("selectedLineId:", selectedLineId);
  console.log("selectedPartNo:", selectedPartNo);
  const fetchSubLines = async () => {
    if (selectedLineId == null || selectedPartNo == null) {
      console.log("return");
      return;
    }
    setIsLoading(true);
    try {
      const response = await pChartCtlSubLinesByPartLine(
        selectedLineCodeRx,
        selectedPartNo
      );
      // console.log("Parts:", response.parts);
      setSubLineList(response.sub_lines);
    } catch (error) {
      setSubLineList([]);
      setSubLine(null);
      // handleResetPChart();
      console.error("Error fetching line settings:", error);
    }
    setIsLoading(false);
  };
  console.log("subLineList:", subLineList);
  // const data = await settingTargetAddRowOk({
  //   line_name: selectedSectionLine || "",
  //   part_no: selectedPartNo,
  //   part_name: partName,
  //   process: process,
  //   creator: userName,
  //   group_name: groupName,
  //   target_type: selectTargetType,
  //   month_year: selectMonthYear,
  //   target_percent: targetControl,
  // });
  useEffect(() => {
    setSubLine(null); // reset part no when line changes

    // fetchLineSettings();
    fetchSubLines();
    if (selectedPartNo == null) {
      setSubLineList([]);
    }
  }, [selectedPartNo]);
  const handleLineChange = async (value: number) => {
    const selectedLine = lines.find((line) => {
      console.log("line.line_id:", line.line_id);
      console.log("value:", value);
      return line.line_id === value;
    });
    setSelectedLineCodeRx(
      lines.find((line) => line.line_id === value)?.line_code_rx || ""
    );
    if (selectedLine) {
      setIsLoading(true);
      // console.log(
      //   "handleLineChange: selectedLine.line_id",
      //   selectedLine.line_id
      // );
      // console.log("selectedLine:", selectedLine);
      setSelectedLineId(selectedLine.line_id);
      // setSelectedLineName(selectedLine.line_name);
      setSelectedSectionLine(selectedLine.section_line);
      // setSelectedSectionLine()
      // Reset group if a line is selected first
      // setSelectedGroup("-");

      const partData = await getPartsByLineWitoutSetParts(
        selectedLine.line_id.toString()
      );

      console.log("handleLineChange: partData", partData);

      setParts(partData || []);
      // Update partName, set part no to the first item
      if (partData.length > 0) {
        // setSelectedPartNo(partData[0].part_no);
        // setSelectedPartName(partData[0].part_name);
      } else {
        setSelectedPartNo(null);
        // setSelectedPartName(null);
      }
      setIsLoading(false);
    }
  };
  // console.log(
  //   "masterDataPageSelectedLineIddddd:",
  //   masterDataPageSelectedLineId
  // );
  useEffect(() => {
    const fetchParts = async () => {
      const selectedLine = lines.find((line) => {
        return line.section_line === masterDataPageSelectedSectionLine;
      });
      if (selectedLine) {
        setSelectedLineId(selectedLine.line_id);
        setSelectedSectionLine(selectedLine.section_line);
        setSelectedLineCodeRx(selectedLine.line_code_rx);
        setIsLoading(true);
        const partData = await getPartsByLineWitoutSetParts(
          selectedLine.line_id.toString()
        );

        // console.log("handleLineChange: partData", partData);

        setParts(partData || []);
        setIsLoading(false);
      }
    };
    fetchParts();
  }, [masterDataPageSelectedSectionLine]);
  const getPartsByLineWitoutSetParts = async (
    line_id: string,
    process?: string
  ): Promise<Part[]> => {
    if (!line_id) return [];
    setIsLoading(true);
    try {
      // hard code line_id: "181" for now
      const data = await fetchPartsByLine(line_id, process);
      // const data = await fetchPartsByLine("181");

      return data.parts || [];
    } catch (error) {
      console.error("Failed to fetch parts by line:", error);
    }
    setIsLoading(false);
    return [];
  };
  const toByGroupGroupTypeReqBody = (): SettingTargetAddRowOkRequest => {
    return {
      line_name: "-",
      part_no: "-",
      part_name: "-",
      sub_line: "-",
      process: process,
      // group_name: groupName,
      group_name: "",
      target_type: selectTargetType,
      month_year: selectMonthYear,
      target_percent: targetControl,
      creator: userName,
    };
  };

  const toByPartGroupTypeReqBody = (): SettingTargetAddRowOkRequest => {
    return {
      line_name: selectedSectionLine || "",
      part_no: selectedPartNo,
      part_name: partName,
      sub_line: subLine,
      process: process,
      group_name: "-",
      target_type: selectTargetType,
      month_year: selectMonthYear,
      target_percent: targetControl,
      creator: userName,
    };
  };

  const getSettingTargetAddRowView = async () => {
    try {
      const data = await settingTargetAddRowView({
        group_name: "",
        line_name: masterDataPageSelectedSectionLine || "",
        part_no: masterDataPageSelectedPartNo,
        part_name: masterDataPageSelectedPartName,
        sub_line: masterDataPageSelectedSubLine,
      });

      setPartName(
        data.add_row_view_result[0].parts.find(
          (item) => item.part_no === masterDataPageSelectedPartNo
        )?.part_name || null
      );
      setPartNoOptions(data.add_row_view_result[0].parts || []);
    } catch (error) {
      console.error("Failed to fetch lines:", error);
    }
  };

  // settingTargetAddRowViewLineNameChange
  const getSettingTargetAddRowViewLineNameChange = async () => {
    setIsLoading(true);
    try {
      const data = await settingTargetAddRowViewLineNameChange({
        group_name: "",
        line_name: selectedSectionLine || "",
        part_no: selectedPartNo,
        part_name: partName,
        sub_line: subLine,
        process: process,
      });
      setPartName(
        data.add_row_view_result[0].parts.find(
          (item) => item.part_no === selectedPartNo
        )?.part_name || null
      );
      setPartNoOptions(data.add_row_view_result[0].parts || []);
    } catch (error) {
      console.error("Failed to fetch lines:", error);
    }
    setSelectedPartNo(null);
    setIsLoading(false);
  };

  const handleSetSelectedPartNo = (value: string) => {
    setSelectedPartNo(value);
    setPartName(
      partNoOptions.find((item) => item.part_no === value)?.part_name || null
    );
  };

  const submitSettingTargetAddRowOk = async (
    reqBody: SettingTargetAddRowOkRequest
  ) => {
    try {
      // const data = await settingTargetAddRowOk({
      //   line_name: selectedSectionLine || "",
      //   part_no: selectedPartNo,
      //   part_name: partName,
      //   process: process,
      //   creator: userName,
      //   group_name: groupName,
      //   target_type: selectTargetType,
      //   month_year: selectMonthYear,
      //   target_percent: targetControl,
      // });
      const data = await settingTargetAddRowOk(reqBody);
    } catch (error) {
      console.error("Failed to settingTargetAddRowOk:", error);
    }
  };

  const handleOnClickOk = async () => {
    const missingFields = [];

    // Validate fields for "by_group"
    if (groupType === "by_group") {
      // if (!groupName || groupName === "-") missingFields.push("Group Name");
      if (!selectTargetType || selectTargetType === "-")
        missingFields.push("Target Type");
      if (!selectMonthYear || selectMonthYear === "-")
        missingFields.push("Month/Year");
      if (!targetControl || targetControl === 0.0)
        missingFields.push("Target Percent");
    }

    // Validate fields for "by_part"
    else if (groupType === "by_part") {
      if (!selectedSectionLine || selectedSectionLine === "-")
        missingFields.push("Line Name");
      // if (!selectedPartNo || selectedPartNo === "-")
      // missingFields.push("Part No");
      // if (!partName || partName === "-") {
      // missingFields.push("Part Name");
      // }
      if (!process || process === "-") missingFields.push("Process");
      if (!selectTargetType || selectTargetType === "-")
        missingFields.push("Target Type");
      if (!selectMonthYear || selectMonthYear === "-")
        missingFields.push("Month/Year");
      if (!targetControl || targetControl === 0.0)
        missingFields.push("Target Percent");
      // if (!subLine) missingFields.push("subLine");
    }

    // Show a modal if there are missing fields
    if (missingFields.length > 0) {
      Modal.warning({
        title: "Missing Information",
        content: `Please fill the following fields:\n${missingFields.join(
          "\n"
        )}`,
        okText: "OK",
      });
      return; // Exit the function to prevent submission
    }

    if (groupType === "by_group") {
      await submitSettingTargetAddRowOk(toByGroupGroupTypeReqBody());
    } else if (groupType === "by_part") {
      await submitSettingTargetAddRowOk(toByPartGroupTypeReqBody());
    }

    await delay(200);
    await triggerUpdateTableData();

    setPartName(null);
    setSubLine(null);
    setSelectedPartNo(null);
    setDefectMode("");
    setSelectedDefectType("");
    setProcess(null);

    setSelectMonthYear("");
    setSelectTargetType("");
    setTargetControl(0.0);
    onCancel();
  };

  useEffect(() => {
    // setSelectedLineName(masterDataPageSelectedLineName);
    if (!open) {
      return;
    }

    setSelectedSectionLine(masterDataPageSelectedSectionLine);
    setSelectedPartNo(masterDataPageSelectedPartNo!!);
    let part_name;
    if (masterDataPageSelectedPartName == "") {
      part_name = null;
    } else {
      part_name = masterDataPageSelectedPartName;
    }
    setPartName(part_name);
    setSubLine(masterDataPageSelectedSubLine!!);
    setDefectTypeOptions(defectType);
    setSelectTargetType("Monthly");

    // console.log("open add row modal:");
    // console.log("selectedLineName:", selectedLineName)
    // console.log("selectedPartNo:", selectedPartNo);
    // console.log("partName:", partName);

    getSettingTargetAddRowView();
  }, [open]);

  useEffect(() => {
    if (
      (selectedSectionLine === null || selectedSectionLine === "") &&
      (!process || process == "")
    ) {
      return;
    }

    getSettingTargetAddRowViewLineNameChange();
  }, [selectedSectionLine, process]);
  // console.log("getLineNameListWithEmptyVal():", getLineNameListWithEmptyVal());
  console.log("selectedLineId:", selectedLineId);
  return (
    <Modal
      title="Add Row Setting"
      open={open}
      footer={null}
      onCancel={handleCloseModal}
      centered
      maskClosable={false}
      keyboard
    >
      <Spin
        spinning={isLoading}
        style={{ top: "50%", transform: "translateY(-50%)" }}
      >
        <Form
          name="basic"
          autoComplete="off"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, marginBottom: "20px" }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
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
                    background: "white",
                    textAlign: "right",
                    borderRadius: "5px",
                  }}
                >
                  Line Name :
                </Text>
              </div>
              <Select
                showSearch
                // disable line name selection for group type: "by_group"
                disabled={groupType === "by_group"}
                // value={
                //   groupType === "by_part"
                //     ? {
                //         value: selectedLineId || 0,
                //         label: selectedSectionLine || "",
                //       }
                //     : { value: 0, label: "Select Line Name" }
                // }
                value={groupType === "by_part" ? selectedLineId || 0 : 0}
                placeholder="Select Line Name"
                options={getLineNameListWithEmptyVal().map((line) => ({
                  value: line.line_id,
                  label: line.section_line,
                }))}
                style={{
                  flex: 3,
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                // onChange={(value) => {
                //   setSelectedSectionLine(value);
                // }}
                onChange={handleLineChange}
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
                    background: "white",
                    textAlign: "right",
                    borderRadius: "5px",
                  }}
                >
                  Process :
                </Text>
              </div>
              <Select
                value={process}
                showSearch
                placeholder="Select Process"
                options={[
                  { value: "Inline", label: "Inline" },
                  { value: "Outline", label: "Outline" },
                  { value: "Inspection", label: "Inspection" },
                ]}
                style={{
                  flex: 3,
                }}
                onChange={(value) => setProcess(value)}
                allowClear
              />
            </Input.Group>

            {groupType === "by_part" && (
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
                      background: "white",
                      textAlign: "right",
                      borderRadius: "5px",
                    }}
                  >
                    Part No :
                  </Text>
                </div>
                <Select
                  showSearch
                  value={selectedPartNo}
                  placeholder="Select Part No"
                  // options={partNoOptions.map((part) => ({
                  //   value: part.part_no,
                  //   label: part.part_no,
                  // }))}
                  options={parts.map((part) => ({
                    value: part.part_no,
                    label: part.part_no,
                  }))}
                  style={{
                    flex: 3,
                  }}
                  onChange={handleSetSelectedPartNo}
                  allowClear
                />
              </Input.Group>
            )}

            {groupType === "by_part" && (
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
                      // paddingRight: "5px"
                    }}
                  >
                    Part Name :
                  </Text>
                </div>
                <Input
                  value={partName || ""}
                  readOnly
                  placeholder="Enter Part Name"
                  style={{
                    marginLeft: "8px",
                    flex: "3",
                  }}
                />
              </Input.Group>
            )}
            {groupType === "by_part" && (
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
                      // paddingRight: "5px"
                    }}
                  >
                    Sub Line :
                  </Text>
                </div>
                <Select
                  showSearch
                  value={
                    subLine
                      ? {
                          value: subLine,
                          // label: subLine ,
                          label:
                            subLineList.find(
                              (sub_line) =>
                                sub_line.rxno_part.toString() === subLine
                            )?.process || "",
                        }
                      : null
                  }
                  placeholder="Select Sub Line"
                  options={subLineList.map((subLine) => ({
                    value: subLine.rxno_part,
                    label: subLine.process || " ",
                  }))}
                  style={{
                    flex: 3,
                  }}
                  onChange={(value: {
                    value: string | null;
                    label: string | null;
                  }) => {
                    // console.log("value1:", value);
                    setSubLine(value);
                    // const subLine = subLines.find(
                    //   (sl) => sl.process === value.value
                    // );
                    // if (subLine) {
                    //   setSelectedSubLine(subLine.rxno_part);
                    // } else {
                    //   setSelectedSubLine("");
                    // }
                  }}
                  allowClear
                />
              </Input.Group>
            )}

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
                  Target Type :
                </Text>
              </div>
              <Select
                showSearch
                placeholder="Select Target Type"
                value={selectTargetType}
                options={targetTypeList.map((type) => ({
                  value: type.value,
                  label: type.value,
                }))}
                style={{
                  flex: 3,
                }}
                onChange={(value) => {
                  setSelectTargetType(value);
                  setSelectMonthYear("");
                }}
                allowClear
              />
            </Input.Group>

            {selectTargetType === "Fiscal Year" && (
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
                    Month Year :
                  </Text>
                </div>
                <DatePicker
                  picker="year"
                  placeholder="YYYY"
                  format="YYYY"
                  inputReadOnly
                  value={
                    selectMonthYear
                      ? dayjs(selectMonthYear, "YYYY") // Convert string to dayjs
                      : null
                  }
                  onChange={(date) => {
                    if (date) {
                      const formattedMonth = date.format("YYYY");
                      console.log("Formatted year:", formattedMonth);
                      setSelectMonthYear(formattedMonth);
                    }
                  }}
                  style={{
                    border: "none",
                    flex: 3,
                    textAlign: "center",
                    height: "32px",
                    color: "black",
                    marginLeft: "8px",
                  }}
                  suffixIcon={<CalendarOutlined />}
                />
              </Input.Group>
            )}

            {selectTargetType === "Monthly" && (
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
                    Month Year :
                  </Text>
                </div>
                <DatePicker
                  picker="month"
                  placeholder="MMM-YYYY"
                  format="MMMM-YYYY"
                  inputReadOnly
                  value={
                    selectMonthYear
                      ? dayjs(selectMonthYear, "MMMM-YYYY") // Convert string to dayjs
                      : null
                  }
                  onChange={(date) => {
                    if (date) {
                      const formattedMonth = date.format("MMMM-YYYY");
                      console.log("Formatted month:", formattedMonth);
                      setSelectMonthYear(formattedMonth);
                    }
                  }}
                  style={{
                    border: "none",
                    flex: 3,
                    textAlign: "center",
                    height: "32px",
                    color: "black",
                    marginLeft: "8px",
                  }}
                  suffixIcon={<CalendarOutlined />}
                />
              </Input.Group>
            )}

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
                    whiteSpace: "nowrap",
                    background: "white",
                    textAlign: "right",
                    borderRadius: "5px",
                    paddingRight: "3px",
                  }}
                >
                  %Target Control :
                </Text>
              </div>
              <InputNumber
                value={targetControl} // Initial value
                style={{ flex: 3 }}
                onChange={(value) => {
                  setTargetControl(value || 0.0);
                }}
                step={0.01} // Allows both integers and floating-point numbers
                placeholder="Enter a number"
              />
            </Input.Group>
          </Space>
          <Space
            style={{
              display: "flex",
              justifyContent: "end",
              marginTop: "10px",
            }}
          >
            <Button htmlType="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button htmlType="submit" type="primary" onClick={handleOnClickOk}>
              OK
            </Button>
          </Space>
        </Form>
      </Spin>
    </Modal>
  );
};

export default AddRowSettingModalLineTarget;
