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
  Table,
  TableColumnsType,
  Typography,
  theme,
} from "antd";

import { NextPage } from "next";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { LayoutStore, ModeStore, UserStore } from "@/store";
const { setUser, loadUser } = UserStore.getState();
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

import { Noto_Sans_Thai } from "next/font/google";
import DropDownLabel from "@/components/button/dropdown-label";
import {
  fetchDefectModes,
  fetchLines,
  fetchPartsByLine,
  fetchSubPartData,
  pChartCtlSubLinesByPartLine,
  settingDefectModeAddRowView,
  settingDefectModeTableDelete,
  settingDefectModeTableEditSave,
  settingDefectModeTableEditView,
  settingDefectModeTableEditViewLineNameChange,
  settingGroupParts,
  settingTargetOrgTableView,
  settingTargetTableDelete,
  settingTargetTableEditSave,
  settingTargetTableEditView,
  settingTargetTableEditViewLineNameChange,
  settingTargetTableView,
} from "@/lib/api";
import {
  Group,
  Line,
  Part,
  SettingDefectModeTableEditResult,
  SettingDefectModeTableEditSaveRequest,
  SettingTableEditViewResult,
  SettingTableLineNameChangeEditResult,
  SettingTableResult,
  SettingTableResult2,
  SettingTableViewResult,
  SettingTargetTableEditSaveRequest,
  SubPartTableResult,
  SubPartTableViewResult,
} from "@/types/settingApi";
import AddRowSettingModalDefectMode from "./addRowSettingModalDefectMode";
import DropdownEdit from "@/components/button/dropdown-edit";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  MasterTypeDefectModeTable,
  MasterTypeLineTargetTable,
  MasterTypeOrganizationalTargetTable,
  MasterTypeSubPartTable,
} from "./table";
import { BaseOptionType } from "antd/lib/select";
import React from "react";
import AddRowSettingModalLineTarget from "./addRowSettingModalLineTarget";
import AddRowSettingModalOrganizationTarget from "./addRowSettingModalOrganizationTarget";
import { settingTargetLevel } from "@/master_data/masterdata";
import { NULL } from "sass";
import { PChartSubLines } from "@/types/pChartApi";
import AddRowSettingModalSubPart from "./addRowSettingModalSubPart";

const { Title, Text } = Typography;
const notoTH = Noto_Sans_Thai({ subsets: ["thai", "latin", "latin-ext"] });
const { Content } = Layout;

dayjs.extend(customParseFormat); // Support custom date formats

const getCurrentMonthYear = (): string => {
  const date = new Date();
  const month = date.toLocaleString("default", { month: "long" }); // e.g., "September"
  const year = date.getFullYear(); // e.g., 2024

  return `${month}-${year}`;
};

const MasterDataPage: NextPage = () => {
  const { user, username, shortname, isAdmin, isLoggedIn } = UserStore();

  const [lines, setLines] = useState<Line[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [subLines, setSubLines] = useState<PChartSubLines[]>([]);
  const [process, setProcess] = useState<any>(null);

  // const [groups, setGroups] = useState<Group[]>([]);
  const [selectedTargetLevel, setSelectedTargetLevel] = useState<string>("");
  const [selectedSectionLine, setSelectedSectionLine] = useState<string>("");
  const [selectedLineId, setSelectedLineId] = useState<number | null>(
    lines.length > 0 ? lines[0].line_id : null
  );
  const { setIsLoading } = LayoutStore.getState();
  // hard coded selected group namd for now
  const [selectedGroupName, setSelectedGroupName] = useState<string>("-");

  const getLinesWithEmptyOption = (): Line[] => {
    return [
      {
        line_id: 0,
        line_name: "-",
        line_fullname: "-",
        line_code: "-",
        work_center_code: "-",
        process_code: undefined,
        line_group: undefined,
        group_type: "-",
        section_id: 0,
        section_line: "-",
        line_code_rx: "-",
      },
      ...lines,
    ];
  };

  const getLines = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLines();
      setLines(data.lines);
    } catch (error) {
      console.error("Failed to fetch lines:", error);
    }
    setIsLoading(false);
  };

  // const getPartsByLine = async () => {
  //   if (!selectedLineId) return;
  //   try {
  //     // hard code line_id: "181" for now
  //     const data = await fetchPartsByLine(selectedLineId);
  //     // const data = await fetchPartsByLine("181");

  //     setParts(data.parts || []);
  //   } catch (error) {
  //     console.error("Failed to fetch parts by line:", error);
  //   }
  // };

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

  // const getGroup = async () => {
  //   try {
  //     const data = await settingGroupParts();

  //     const dataWithMock = [
  //       {
  //         group_id: 0,
  //         group_name: "-",
  //         part_no: [],
  //       },
  //       ...data.groups,
  //     ];

  //     setGroups(dataWithMock || []);
  //   } catch (error) {
  //     console.error("Failed to fetch Group Parts:", error);
  //   }
  // };

  useEffect(() => {
    loadUser();
    // getGroup();
  }, []);

  useEffect(() => {
    getLines();
  }, [parts]);

  const handleTargetLevelChange = async (value: {
    value: string;
    label: string;
  }) => {
    setSelectedTargetLevel(value.value);
  };
  // console.log("lines:", lines);

  const handleLineChange = async (value: { value: number; label: string }) => {
    const selectedLine = lines.find((line) => {
      return line.line_id === value.value;
    });
    setSelectedLineCodeRx(
      lines.find((line) => line.line_id === value.value)?.line_code_rx || ""
    );
    if (selectedLine) {
      setIsLoading(true);
      // console.log(
      //   "handleLineChange: selectedLine.line_id",
      //   selectedLine.line_id
      // );

      setSelectedLineId(selectedLine.line_id);
      setSelectedLineName(selectedLine.line_name);
      setSelectedSectionLine(selectedLine.section_line);

      // Reset group if a line is selected first
      // setSelectedGroup("-");

      const partData = await getPartsByLineWitoutSetParts(
        selectedLine.line_id.toString()
      );

      console.log("handleLineChange: partData", partData);

      setParts(partData || []);
      // Update partName, set part no to the first item
      if (partData.length > 0) {
        setSelectedPartNo(partData[0].part_no);
        setSelectedPartName(partData[0].part_name);
      } else {
        setSelectedPartNo("-");
        setSelectedPartName("-");
      }
      setIsLoading(false);
    }
  };
  const handleLineProcessChange = async (value: {
    value: number;
    label: string;
  }) => {
    const selectedLine = lines.find((line) => {
      return line.line_id === value.value;
    });
    setSelectedLineCodeRx(
      lines.find((line) => line.line_id === value.value)?.line_code_rx || ""
    );
    // console.log("process:", process);
    if (selectedLine) {
      setIsLoading(true);
      // console.log(
      //   "handleLineChange: selectedLine.line_id",
      //   selectedLine.line_id
      // );

      setSelectedLineId(selectedLine.line_id);
      setSelectedLineName(selectedLine.line_name);
      setSelectedSectionLine(selectedLine.section_line);

      // Reset group if a line is selected first
      // setSelectedGroup("-");
      if (process) {
        const partData = await getPartsByLineWitoutSetParts(
          selectedLine.line_id.toString(),
          process
        );

        console.log("handleLineChange: partData", partData);

        setParts(partData || []);
        // Update partName, set part no to the first item
        if (partData.length > 0) {
          setSelectedPartNo(partData[0].part_no);
          setSelectedPartName(partData[0].part_name);
        } else {
          setSelectedPartNo("-");
          setSelectedPartName("-");
        }
        setIsLoading(false);
      }
    }
  };
  const handleProcessChange = async (value: {
    value: string;
    label: string;
  }) => {
    const selectedLine = lines.find((line) => {
      return line.line_id === selectedLineId;
    });
    setProcess(value.value);

    if (selectedLine && value.value) {
      setIsLoading(true);

      const partData = await getPartsByLineWitoutSetParts(
        selectedLine.line_id.toString(),
        value.value
      );

      console.log("handleLineChange: partData", partData);

      setParts(partData || []);
      // Update partName, set part no to the first item
      if (partData.length > 0) {
        setSelectedPartNo(partData[0].part_no);
        setSelectedPartName(partData[0].part_name);
      } else {
        setSelectedPartNo("-");
        setSelectedPartName("-");
      }
      setIsLoading(false);
    }
  };
  // const handleLineChange = async (value: { value: number; label: string }) => {
  //   const selectedLine = lines.find((line) => {
  //     return line.line_id === value.value;
  //   });
  //   if (selectedLine) {
  //     console.log(
  //       "handleLineChange: selectedLine.line_id",
  //       selectedLine.line_id
  //     );
  //     setSelectedGroup(selectedGroupName); // ????
  //     setSelectedLineId(selectedLine.line_id.toString());
  //     setSelectedLineName(selectedLine.line_name);
  //     setSelectedSectionLine(selectedLine.section_line);
  //     const partData = await getPartsByLineWitoutSetParts(
  //       selectedLine.line_id.toString()
  //     );

  //     console.log("handleLineChange: partData", partData);

  //     setParts(partData || []);
  //     // update partName, set part no to the first item
  //     if (partData!!.length > 0) {
  //       setSelectedPartNo(partData!![0].part_no);
  //       setSelectedPartName(partData!![0].part_name);
  //     }
  //   }
  // };

  // const handleGroupChange = (value: { value: string; label: string }) => {
  //   setSelectedGroup(value.value);

  //   // Reset Line Name, Part Name, and Part No if Group is selected first
  //   setSelectedSectionLine("-");
  //   setSelectedLineId(null);
  //   setSelectedLineName("-");
  //   setParts([]);
  //   setSelectedPartNo("-");
  //   setSelectedPartName("-");
  // };

  // const handleGroupChange = (value: { value: string; label: string }) => {
  //   setSelectedGroup(value.value);
  // };

  const updateTargetOrgModesTable = async () => {
    if (!selectedTargetLevel) return; // ตรวจสอบค่า
    setIsLoading(true);
    try {
      const data = await settingTargetOrgTableView({
        target_level: selectedTargetLevel,
      });
      setTargetOrgModes(data.setting_table_result);

      // console.log("updateDefectModesTable() called");
    } catch (error) {
      console.error("Failed to update table:", error);
    }
    setIsLoading(false);
  };

  // deletable???
  const updateDefectModesTable = async () => {
    if (!selectedSectionLine || !selectedPartNo || !selectedPartName) return; // ตรวจสอบค่า
    setIsLoading(true);
    try {
      const data = await fetchDefectModes({
        line_name: selectedSectionLine,
        part_no: selectedPartNo,
        part_name: selectedPartName,
      });
      setDefectModes(data.setting_table_result);

      console.log("updateDefectModesTable() called");
    } catch (error) {
      console.error("Failed to update table:", error);
    }
    setIsLoading(false);
  };
  const updateSubPartDataTable = async () => {
    if (!selectedSectionLine) return; // ตรวจสอบค่า
    setIsLoading(true);
    try {
      const data = await fetchSubPartData({
        line_name: selectedSectionLine,
        line_code_rx: selectedLineCodeRx,
      });
      console.log("data:", data);
      setSubPartData(data.setting_subpart_table_result);

      console.log("updateSubPartDataTable() called");
    } catch (error) {
      console.error("Failed to update table:", error);
    }
    setIsLoading(false);
  };

  // const fetchParts = async () => {
  //   if (!selectedLineId) return;
  //   try {
  //     // hard code line_id: "181" for now
  //     const data = await fetchPartsByLine("181");
  //     // const data = await fetchPartsByLine(selectedLineId);
  //     setParts(data.parts || []);
  //   } catch (error) {
  //     console.error("Failed to fetch parts by line:", error);
  //   }
  // };

  // useEffect(() => {
  //   getPartsByLine();
  // }, [selectedLineId]);

  const [defectModes, setDefectModes] = useState<SettingTableResult[]>([]);
  const [lineTargetModes, setLineTargetModes] = useState<
    SettingTableViewResult[]
  >([]);
  const [subPartData, setSubPartData] = useState<SubPartTableViewResult[]>([]);
  const [targetOrgModes, setTargetOrgModes] = useState<SettingTableResult2[]>(
    []
  );
  const [selectedLineCodeRx, setSelectedLineCodeRx] = useState<string | null>(
    null
  );
  const [selectedLineName, setSelectedLineName] = useState<string>("");
  const [selectedPartNo, setSelectedPartNo] = useState<string>("");
  const [selectedSubLine, setSelectedSubLine] = useState<string | null>("");
  const [selectedPartName, setSelectedPartName] = useState<string>("");
  // console.log("subPartData:", subPartData);
  // console.log("SelectedLineCodeRx:", selectedLineCodeRx);
  // console.log("selectedPartNo:", selectedPartNo);
  // const [selectedGroup, setSelectedGroup] = useState<string>("");

  // useEffect(() => {
  //   fetchParts();
  // }, [selectedLineId]);
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
      // handleResetPChart();
      console.error("Error fetching line settings:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setSelectedSubLine(null); // reset part no when line changes

    // fetchLineSettings();
    fetchSubLines();
  }, [selectedPartNo]);

  useEffect(() => {
    updateTargetOrgModesTable();
  }, [selectedTargetLevel]);

  useEffect(() => {
    updateDefectModesTable();
  }, [selectedSectionLine, selectedPartNo, selectedPartName]);

  const { Option } = Select;
  const { setHeaderTitle, setBackable } = LayoutStore.getState();
  const toggleMode = ModeStore((state) => state.toggleMode);
  console.log("selectedSectionLine:", selectedSectionLine);
  console.log("selectedLineName:", selectedLineName);
  // const updateDefectModeTable = async () => {
  //   if (!selectedLineName || !selectedPartNo || !selectedPartName) return;
  //   try {
  //     const data = await fetchDefectModes({
  //       line_name: selectedLineName,
  //       part_no: selectedPartNo,
  //       part_name: selectedPartName,
  //     });
  //     setDefectModes(data.setting_table_result);
  //   } catch (error) {
  //     console.error("Failed to update table:", error);
  //   }
  // };

  useEffect(() => {
    updateDefectModesTable();
  }, [selectedLineName, selectedPartNo, selectedPartName]);
  useEffect(() => {
    updateSubPartDataTable();
  }, [selectedLineName]);
  const config = {
    token: {
      colorPrimary: "#0267f5",
      fontFamily: notoTH.style.fontFamily,
    },
    algorithm:
      toggleMode === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
  };

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const b = useTranslations("button");
  const l = useTranslations("layout");
  const m = useTranslations("message");
  const p = useTranslations("page");

  useEffect(() => {
    setHeaderTitle(l("header.login"));
    setBackable(true);
  }, [setHeaderTitle, setBackable, l]);

  const [currentMasterType, setCurrentMasterType] =
    useState<string>("defect_mode"); //  "organizational_target", "line_target", "defect_mode"
  const [isOpenModalAddRowLineTarget, setIsOpenModalAddRowLineTarget] =
    useState<boolean>(false);
  const [isOpenModalAddRowOrgTarget, setIsOpenModalAddRowOrgTarget] =
    useState<boolean>(false);
  const [isOpenModalAddRowDefectMode, setIsOpenModalAddRowDefectMode] =
    useState<boolean>(false);
  const [isOpenModalAddRowSubPart, setIsOpenModalAddRowSubPart] =
    useState<boolean>(false);
  const [isReIndexDefectMode, setIsReIndexDefectMode] =
    useState<boolean>(false);
  const [isSaveReIndexDefectMode, setIsSaveReIndexDefectMode] =
    useState<boolean>(false);

  // const [lineOptions, setLineOptions] = useState<string[]>([]);
  // const [partNoOptions, setPartNoOptions] = useState<string[]>([]);
  // const [defectTypeOptions, setDefectTypeOptions] = useState<string[]>([]);
  // const [partName, setPartName] = useState<string>("");
  // const [selectedDefectType, setSelectedDefectType] = useState<string>("");
  // const [defectMode, setDefectMode] = useState<string>("");

  const updateLineTargetModesTable = async () => {
    if (
      // !selectedGroup ||
      !selectedSectionLine ||
      !selectedPartNo ||
      // !selectedPartName ||
      !selectedSubLine
    ) {
      console.log("not load");
      return;
    }
    setIsLoading(true);
    try {
      const data = await settingTargetTableView({
        // group_name: selectedGroup || "-",
        group_name: "",
        line_name: selectedSectionLine || "-",
        part_no: selectedPartNo || "-",
        part_name: selectedPartName || "-",
        sub_line: selectedSubLine || "-",
      });
      setLineTargetModes(data.setting_table_result);
    } catch (error) {
      console.error("Failed to update table:", error);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    updateLineTargetModesTable();
  }, [selectedSectionLine, selectedPartNo, selectedPartName, selectedSubLine]);
  console.log("isSaveReIndexDefectMode", isSaveReIndexDefectMode);
  const handleReIndexClick = () => {
    if (isReIndexDefectMode == true) {
      setIsSaveReIndexDefectMode(true);
    } else {
      setIsSaveReIndexDefectMode(false);
    }
    setIsReIndexDefectMode(!isReIndexDefectMode);
  };
  const handleAddRowClick = () => {
    // validate lineId and PartNo before open modal
    if (
      selectedLineId &&
      selectedPartNo &&
      currentMasterType === "defect_mode"
    ) {
      setIsOpenModalAddRowDefectMode(true);
    }
    if (
      (!selectedLineId || !selectedPartNo) &&
      currentMasterType === "defect_mode"
    ) {
      // Show a warning modal using Ant Design
      Modal.warning({
        title: "Missing Information",
        content:
          "Please select both Line ID and Part Number before adding a row.",
        okText: "OK",
      });
    }

    // validate lineId and PartNo before open modal
    if (
      selectedLineId &&
      selectedPartNo &&
      currentMasterType === "line_target"
    ) {
      setIsOpenModalAddRowLineTarget(true); // Open the modal
    }
    if (
      (!selectedLineId || !selectedPartNo) &&
      currentMasterType === "line_target"
    ) {
      // Show a warning modal using Ant Design
      Modal.warning({
        title: "Missing Information",
        content:
          "Please select both Line ID and Part Number before adding a row.",
        okText: "OK",
      });
    }

    // validate target level before open modal
    if (selectedTargetLevel && currentMasterType === "organizational_target") {
      setIsOpenModalAddRowOrgTarget(true);
    }
    if (!selectedTargetLevel && currentMasterType === "organizational_target") {
      // Show a warning modal using Ant Design
      Modal.warning({
        title: "Missing Information",
        content: "Please select Target Level before adding a row.",
        okText: "OK",
      });
    }
    if (selectedSectionLine && currentMasterType === "sub_part") {
      setIsOpenModalAddRowSubPart(true);
    }
    if (!selectedSectionLine && currentMasterType === "sub_part") {
      // Show a warning modal using Ant Design
      Modal.warning({
        title: "Missing Information",
        content: "Please select Line before adding a row.",
        okText: "OK",
      });
    }
  };
  // console.log("selecteedSubLine:", selectedSubLine);
  return (
    <ConfigProvider theme={config}>
      <Content
        className=""
        style={{
          padding: "0rem 2rem 1rem 2rem",
          minHeight: "80dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          gap: "1rem",
        }}
      >
        <div style={{ marginLeft: "40px" }}>
          <div style={{ display: "flex" }}>
            {/* <Typography.Title
              level={1}
              style={{ margin: 0, fontSize: "60px", marginLeft: "120px" }}
            >
              EPD Defect Control
            </Typography.Title> */}
          </div>
          <Typography.Title
            level={1}
            style={{ margin: 0, color: "#C9184A", fontSize: "60px" }}
          >
            Master Data Setting
          </Typography.Title>
          <Typography.Title
            level={5}
            style={{
              margin: 0,
              color: "#6E6E6F",
              width: "40%",
              fontSize: "22px",
              fontWeight: "normal",
            }}
          >
            จัดการข้อมูลพื้นฐาน เช่น line, Part No, defect mode, Target
            หรืออื่นๆ
          </Typography.Title>
        </div>

        <Row
          gutter={8}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Col xl={10} xxl={8}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: "5px",
              }}
            >
              <div
                style={{ padding: "4px", fontWeight: "600", minWidth: "105px" }}
              >
                Master Type :
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  borderRadius: "5px",
                  padding: "10px 5px",
                  gap: "5px",
                  height: "40px",
                  background: "#c2c2c2",
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    display: "flex",
                    flex: 1,
                    fontSize: "12px",
                    color:
                      currentMasterType == "organizational_target"
                        ? "#fff"
                        : "#000",
                    background:
                      currentMasterType == "organizational_target"
                        ? "#0267f5"
                        : "#fff",
                  }}
                  onClick={() => {
                    setCurrentMasterType("organizational_target");
                  }}
                >
                  Organizational Target
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    display: "flex",
                    flex: 1,
                    fontSize: "12px",
                    color: currentMasterType == "line_target" ? "#fff" : "#000",
                    background:
                      currentMasterType == "line_target" ? "#0267f5" : "#fff",
                  }}
                  onClick={() => {
                    setCurrentMasterType("line_target");
                  }}
                >
                  Line Target
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    display: "flex",
                    flex: 1,
                    fontSize: "12px",
                    color: currentMasterType == "defect_mode" ? "#fff" : "#000",
                    background:
                      currentMasterType == "defect_mode" ? "#0267f5" : "#fff",
                  }}
                  onClick={() => {
                    setCurrentMasterType("defect_mode");
                  }}
                >
                  Defect Mode
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    display: "flex",
                    flex: 1,
                    fontSize: "12px",
                    color: currentMasterType == "sub_part" ? "#fff" : "#000",
                    background:
                      currentMasterType == "sub_part" ? "#0267f5" : "#fff",
                  }}
                  onClick={() => {
                    setCurrentMasterType("sub_part");
                  }}
                >
                  Sub-Part
                </Button>
              </div>
            </div>
          </Col>

          {currentMasterType == "organizational_target" && (
            <>
              <Col xl={5} xxl={6}>
                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
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
                    <Text style={{ color: "gray" }}>Target Level</Text>
                  </div>
                  <Select
                    labelInValue
                    showSearch
                    placeholder="Select Target Level"
                    // defaultValue={
                    //   lines.length > 0
                    //     ? { value: lines[0].line_id, label: lines[0].section_line }
                    //     : undefined
                    // }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    value={
                      selectedTargetLevel === ""
                        ? { value: "", label: "Select Target Level" }
                        : {
                            value: selectedTargetLevel,
                            label: selectedTargetLevel,
                          }
                    }
                    // options={getLinesWithEmptyOption()
                    //   .filter((line) => line.section_line !== "-")
                    //   .map((line) => ({
                    //     value: line.line_id,
                    //     label: line.section_line,
                    //   }))}
                    options={settingTargetLevel.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                    filterOption={(input, option) =>
                      (String(option?.label) ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={handleTargetLevelChange}
                  />
                </Input.Group>
              </Col>
            </>
          )}

          {["defect_mode"].includes(currentMasterType) && (
            <>
              <Col xl={14} xxl={16} style={{ display: "flex", gap: "5px" }}>
                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
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
                    labelInValue
                    showSearch
                    placeholder="Select Line Name"
                    // defaultValue={
                    //   lines.length > 0
                    //     ? { value: lines[0].line_id, label: lines[0].section_line }
                    //     : undefined
                    // }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    value={
                      selectedLineId === null
                        ? { value: 0, label: "Select Line Name" }
                        : { value: selectedLineId, label: selectedSectionLine }
                    }
                    options={getLinesWithEmptyOption()
                      .filter((line) => line.section_line !== "-")
                      .map((line) => ({
                        value: line.line_id,
                        label: line.section_line,
                      }))}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    // onChange={handleLineChange}
                    onChange={handleLineProcessChange}
                  />
                </Input.Group>

                {/* Part Name Display */}
                {/* <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: "0 8px",
                      display: "flex",
                      alignItems: "center",
                      height: "32px",
                      width: "100px",
                    }}
                  >
                    <Text style={{ color: "gray" }}>Part Name</Text>
                  </div>
                  <Input
                    placeholder=" "
                    value={selectedPartName || "Select a Part No."}
                    readOnly
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: selectedPartName ? "black" : "gray",
                    }}
                  />
                </Input.Group> */}
                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
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
                    labelInValue
                    showSearch
                    placeholder="Select Process"
                    // defaultValue={
                    //   selectedPartNo
                    //     ? { value: selectedPartNo, label: selectedPartNo }
                    //     : undefined
                    // }
                    value={
                      process
                        ? { value: process || "", label: process || "" }
                        : undefined
                    }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    options={["Inline", "Outline", "Inspection"].map(
                      (part) => ({
                        value: part,
                        label: part,
                      })
                    )}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    // onChange={(value: { value: string; label: string }) => {
                    //   setProcess(value.value);

                    //   // const part = parts.find((p) => p.part_no === value.value);
                    //   // if (part) {
                    //   //   setSelectedPartName(part.part_name);
                    //   // } else {
                    //   //   setSelectedPartName("");
                    //   // }
                    // }}
                    onChange={handleProcessChange}
                  />
                </Input.Group>

                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
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
                    labelInValue
                    showSearch
                    placeholder="Select Line Name"
                    // defaultValue={
                    //   selectedPartNo
                    //     ? { value: selectedPartNo, label: selectedPartNo }
                    //     : undefined
                    // }
                    value={
                      selectedPartNo
                        ? { value: selectedPartNo, label: selectedPartNo }
                        : undefined
                    }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    options={parts.map((part) => ({
                      value: part.part_no,
                      label: part.part_no,
                    }))}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(value: { value: string; label: string }) => {
                      setSelectedPartNo(value.value);
                      const part = parts.find((p) => p.part_no === value.value);
                      if (part) {
                        setSelectedPartName(part.part_name);
                      } else {
                        setSelectedPartName("");
                      }
                    }}
                  />
                </Input.Group>
              </Col>
            </>
          )}
          {["line_target"].includes(currentMasterType) && (
            <>
              <Col xl={14} xxl={16} style={{ display: "flex", gap: "5px" }}>
                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
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
                    labelInValue
                    showSearch
                    placeholder="Select Line Name"
                    // defaultValue={
                    //   lines.length > 0
                    //     ? { value: lines[0].line_id, label: lines[0].section_line }
                    //     : undefined
                    // }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    value={
                      selectedLineId === null
                        ? { value: 0, label: "Select Line Name" }
                        : { value: selectedLineId, label: selectedSectionLine }
                    }
                    options={getLinesWithEmptyOption()
                      .filter((line) => line.section_line !== "-")
                      .map((line) => ({
                        value: line.line_id,
                        label: line.section_line,
                      }))}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={handleLineChange}
                  />
                </Input.Group>

                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
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
                    labelInValue
                    showSearch
                    placeholder="Select Process"
                    // defaultValue={
                    //   selectedPartNo
                    //     ? { value: selectedPartNo, label: selectedPartNo }
                    //     : undefined
                    // }
                    value={
                      process
                        ? { value: process || "", label: process || "" }
                        : undefined
                    }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    options={["Inline", "Outline", "Inspection"].map(
                      (part) => ({
                        value: part,
                        label: part,
                      })
                    )}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    // onChange={(value: { value: string; label: string }) => {
                    //   setProcess(value.value);

                    //   // const part = parts.find((p) => p.part_no === value.value);
                    //   // if (part) {
                    //   //   setSelectedPartName(part.part_name);
                    //   // } else {
                    //   //   setSelectedPartName("");
                    //   // }
                    // }}
                    onChange={handleProcessChange}
                  />
                </Input.Group>
                {/* Part Name Display */}

                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
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
                    labelInValue
                    showSearch
                    placeholder="Select Line Name"
                    // defaultValue={
                    //   selectedPartNo
                    //     ? { value: selectedPartNo, label: selectedPartNo }
                    //     : undefined
                    // }
                    value={
                      selectedPartNo
                        ? { value: selectedPartNo, label: selectedPartNo }
                        : undefined
                    }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    options={parts.map((part) => ({
                      value: part.part_no,
                      label: part.part_no,
                    }))}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(value: { value: string; label: string }) => {
                      setSelectedPartNo(value.value);
                      const part = parts.find((p) => p.part_no === value.value);
                      if (part) {
                        setSelectedPartName(part.part_name);
                      } else {
                        setSelectedPartName("");
                      }
                    }}
                  />
                </Input.Group>
                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: "0 8px",
                      display: "flex",
                      alignItems: "center",
                      height: "32px",
                      width: "100px",
                    }}
                  >
                    <Text style={{ color: "gray" }}>Sub Line</Text>
                  </div>
                  {/* <Input
                    placeholder=" "
                    value={selectedSubLine || "Select a Part No."}
                    readOnly
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: selectedSubLine ? "black" : "gray",
                    }}
                  /> */}
                  <Select
                    labelInValue
                    showSearch
                    placeholder="Select Sub Line"
                    // defaultValue={
                    //   selectedPartNo
                    //     ? { value: selectedPartNo, label: selectedPartNo }
                    //     : undefined
                    // }
                    value={
                      selectedSubLine
                        ? {
                            value: selectedSubLine,
                            // label: selectedSubLine ,
                            label:
                              subLines.find(
                                (subLine) =>
                                  subLine.rxno_part.toString() ===
                                  selectedSubLine
                              )?.process || "",
                          }
                        : null
                    }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    options={subLines.map((subLine) => ({
                      value: subLine.rxno_part,
                      label: subLine.process || " ",
                    }))}
                    filterOption={(input, option) =>
                      (option?.label ?? " ")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(value: {
                      value: string | null;
                      label: string | null;
                    }) => {
                      // console.log("value:", value);
                      setSelectedSubLine(value.value);
                      // const subLine = subLines.find(
                      //   (sl) => sl.process === value.value
                      // );
                      // if (subLine) {
                      //   setSelectedSubLine(subLine.rxno_part);
                      // } else {
                      //   setSelectedSubLine("");
                      // }
                    }}
                  />
                </Input.Group>
              </Col>
            </>
          )}
          {["sub_part"].includes(currentMasterType) && (
            <>
              <Col xl={6} xxl={8} style={{ display: "flex", gap: "5px" }}>
                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
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
                    labelInValue
                    showSearch
                    placeholder="Select Line Name"
                    // defaultValue={
                    //   lines.length > 0
                    //     ? { value: lines[0].line_id, label: lines[0].section_line }
                    //     : undefined
                    // }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    value={
                      selectedLineId === null
                        ? { value: 0, label: "Select Line Name" }
                        : { value: selectedLineId, label: selectedSectionLine }
                    }
                    options={getLinesWithEmptyOption()
                      .filter((line) => line.section_line !== "-")
                      .map((line) => ({
                        value: line.line_id,
                        label: line.section_line,
                      }))}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={handleLineChange}
                  />
                </Input.Group>

                {/* Part Name Display
                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: "0 8px",
                      display: "flex",
                      alignItems: "center",
                      height: "32px",
                      width: "100px",
                    }}
                  >
                    <Text style={{ color: "gray" }}>Part Name</Text>
                  </div>
                  <Input
                    placeholder=" "
                    value={selectedPartName || "Select a Part No."}
                    readOnly
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: selectedPartName ? "black" : "gray",
                    }}
                  />
                </Input.Group>

                <Input.Group
                  compact
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    overflow: "hidden",
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
                    labelInValue
                    showSearch
                    placeholder="Select Line Name"
                    // defaultValue={
                    //   selectedPartNo
                    //     ? { value: selectedPartNo, label: selectedPartNo }
                    //     : undefined
                    // }
                    value={
                      selectedPartNo
                        ? { value: selectedPartNo, label: selectedPartNo }
                        : undefined
                    }
                    style={{
                      border: "none",
                      flex: 1,
                      height: "32px",
                      color: "black",
                    }}
                    options={parts.map((part) => ({
                      value: part.part_no,
                      label: part.part_no,
                    }))}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(value: { value: string; label: string }) => {
                      setSelectedPartNo(value.value);
                      const part = parts.find((p) => p.part_no === value.value);
                      if (part) {
                        setSelectedPartName(part.part_name);
                      } else {
                        setSelectedPartName("");
                      }
                    }}
                  />
                </Input.Group> */}
              </Col>
            </>
          )}
        </Row>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography.Title level={1} style={{ margin: 0, fontSize: "20px" }}>
            {["line_target", "organizational_target"].includes(
              currentMasterType
            )
              ? "Target Setting Table"
              : currentMasterType == "sub_part"
              ? "Sub-Part Setting Table"
              : "Defect Mode Management Table"}
          </Typography.Title>
          <div style={{ display: "flex", gap: "5px" }}>
            {!["line_target", "organizational_target", "sub_part"].includes(
              currentMasterType
            ) ? (
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => handleReIndexClick()}
              >
                {!isReIndexDefectMode ? "Re-Indexing" : "Save Index"}
              </Button>
            ) : (
              ""
            )}
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => handleAddRowClick()}
            >
              + Add a row
            </Button>
          </div>
        </div>

        {currentMasterType == "organizational_target" && (
          <div>
            <div>
              <MasterTypeOrganizationalTargetTable
                targetOrgModesDataSource={targetOrgModes}
                // groups={groups}
                groups={[]}
                username={username()}
                triggerUpdateTableData={updateTargetOrgModesTable}
              />
            </div>
          </div>
        )}

        {currentMasterType == "line_target" && (
          <div>
            <div>
              <MasterTypeLineTargetTable
                targetModesDataSource={lineTargetModes}
                groups={[]}
                username={username()}
                triggerUpdateTableData={updateLineTargetModesTable}
              />
            </div>
          </div>
        )}

        {currentMasterType == "defect_mode" && (
          <div>
            <MasterTypeDefectModeTable
              defectModesDataSource={defectModes}
              username={username()}
              triggerUpdateTableData={updateDefectModesTable}
              isReIndexDefectMode={isReIndexDefectMode}
              isSaveReIndexDefectMode={isSaveReIndexDefectMode}
            />
          </div>
        )}
        {currentMasterType == "sub_part" && (
          <div>
            <MasterTypeSubPartTable
              subPartDataSource={subPartData}
              groups={[]}
              username={username()}
              // triggerUpdateTableData={updateSubPartsTable}
              triggerUpdateTableData={updateSubPartDataTable}
              // isReIndexDefectMode={isReIndexS}
              // isSaveReIndexDefectMode={isSaveReIndexDefectMode}
            />
          </div>
        )}
      </Content>

      <AddRowSettingModalOrganizationTarget
        open={isOpenModalAddRowOrgTarget}
        onCancel={() => setIsOpenModalAddRowOrgTarget(false)}
        // lines={lines}
        // groups={[]}
        masterDataPageSelectedLineId={selectedLineId}
        currentMasterType={currentMasterType}
        // partNoOptions={partNoOptions}
        masterDataPageSelectedGroupName={selectedGroupName}
        // masterDataPageSelectedLineName={selectedLineName}
        // masterDataPageSelectedSectionLine={selectedSectionLine}
        // masterDataPageSelectedPartName={selectedPartName}
        userName={username()}
        // monthYear={getCurrentMonthYear()}
        // targetType={"Monthly"} // harded code for now
        triggerUpdateTableData={async () => {
          await updateDefectModesTable();
          await updateLineTargetModesTable();
          await updateTargetOrgModesTable();
        }}
        // masterDataPageSelectedPartNo={selectedPartNo}
        masterDataPageSelectedTargetLevel={selectedTargetLevel}
      />
      <AddRowSettingModalSubPart
        // open={isOpenModalAddRowSubPart}
        open={isOpenModalAddRowSubPart}
        onCancel={() => setIsOpenModalAddRowSubPart(false)}
        lines={lines}
        groups={[]}
        masterDataPageSelectedLineId={selectedLineId}
        currentMasterType={currentMasterType}
        // partNoOptions={partNoOptions}
        masterDataPageSelectedGroupName={selectedGroupName}
        masterDataPageSelectedLineName={selectedLineName}
        masterDataPageSelectedSectionLine={selectedSectionLine}
        masterDataPageSelectedPartName={selectedPartName}
        masterDataPageSelectedSubLine={selectedSubLine}
        userName={username()}
        // monthYear={getCurrentMonthYear()}
        triggerUpdateTableData={updateSubPartDataTable}
        // targetType={"Monthly"} // harded code for now
        // triggerUpdateTableData={async () => {
        //   setIsLoading(true);
        //   await updateDefectModesTable();
        //   await updateLineTargetModesTable();
        //   await updateTargetOrgModesTable();
        //   setIsLoading(false);
        // }}
        masterDataPageSelectedPartNo={selectedPartNo}
      />

      <AddRowSettingModalLineTarget
        open={isOpenModalAddRowLineTarget}
        onCancel={() => setIsOpenModalAddRowLineTarget(false)}
        lines={lines}
        groups={[]}
        masterDataPageSelectedLineId={selectedLineId}
        currentMasterType={currentMasterType}
        // partNoOptions={partNoOptions}
        masterDataPageSelectedGroupName={selectedGroupName}
        masterDataPageSelectedLineName={selectedLineName}
        masterDataPageSelectedSectionLine={selectedSectionLine}
        masterDataPageSelectedPartName={selectedPartName}
        masterDataPageSelectedSubLine={selectedSubLine}
        userName={username()}
        // monthYear={getCurrentMonthYear()}
        // targetType={"Monthly"} // harded code for now
        triggerUpdateTableData={async () => {
          setIsLoading(true);
          await updateDefectModesTable();
          await updateLineTargetModesTable();
          await updateTargetOrgModesTable();
          setIsLoading(false);
        }}
        masterDataPageSelectedPartNo={selectedPartNo}
      />

      <AddRowSettingModalDefectMode
        open={isOpenModalAddRowDefectMode}
        onCancel={() => setIsOpenModalAddRowDefectMode(false)}
        lines={lines}
        groups={[]}
        masterDataPageSelectedLineId={selectedLineId}
        currentMasterType={currentMasterType}
        // partNoOptions={partNoOptions}
        masterDataPageSelectedGroupName={selectedGroupName}
        masterDataPageSelectedLineName={selectedLineName}
        masterDataPageSelectedSectionLine={selectedSectionLine}
        masterDataPageSelectedPartName={selectedPartName}
        userName={username()}
        // monthYear={getCurrentMonthYear()}
        // targetType={"Monthly"} // harded code for now
        triggerUpdateTableData={async () => {
          setIsLoading(true);
          await updateDefectModesTable();
          await updateLineTargetModesTable();
          await updateTargetOrgModesTable();
          setIsLoading(false);
        }}
        masterDataPageSelectedPartNo={selectedPartNo}
      />

      {/*   "target_type": ["Monthly", "Fiscal Year"], */}
    </ConfigProvider>
  );
};

export default MasterDataPage;
