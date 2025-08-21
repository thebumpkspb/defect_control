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

import { LayoutStore, ModeStore } from "@/store";

import { Noto_Sans_Thai } from "next/font/google";
import DropDownLabel from "@/components/button/dropdown-label";
import {
  fetchDefectModes,
  fetchLines,
  fetchPartsByLine,
  settingDefectModeAddRowOk,
  settingDefectModeAddRowView,
  settingDefectModeAddRowViewLineNameChange,
  settingTargetAddRowOk,
  settingTargetAddRowView,
  settingTargetAddRowViewLineNameChange,
} from "@/lib/api";
import {
  AddRowViewResult,
  DefectModeAddRowViewLineNameChangePart,
  DefectModeAddRowViewLineNameChangeResult,
  DefectModeAddRowViewResult,
  Group,
  Line,
  Part,
  SettingTableResult,
} from "@/types/settingApi";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { DefectType, defectType } from "@/master_data/masterdata";
import { categories } from "@/constants";

const { Title, Text } = Typography;
const notoTH = Noto_Sans_Thai({ subsets: ["thai", "latin", "latin-ext"] });
const { Content } = Layout;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  currentMasterType: string; // "defect_mode" | "target"
  //   partNoOptions: string[];
  masterDataPageSelectedGroupName: string;
  //   input: PChartPreviewPopupInput;
  userName: string;
  triggerUpdateTableData: () => void | Promise<void>;
}

const AddRowSettingModal: React.FC<AddRowSettingModalProps> = ({
  open,
  onCancel,
  lines,
  groups,
  masterDataPageSelectedLineId,
  masterDataPageSelectedLineName,
  masterDataPageSelectedSectionLine,
  masterDataPageSelectedPartNo,
  masterDataPageSelectedPartName,
  currentMasterType,
  masterDataPageSelectedGroupName,
  userName,
  triggerUpdateTableData,
}) => {
  const [selectedSectionLine, setSelectedSectionLine] = useState<string | null>(
    ""
  );
  const [selectedPartNo, setSelectedPartNo] = useState<string>("");
  const [partName, setPartName] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const [selectTargetType, setSelectTargetType] = useState<string>("");
  const [selectMonthYear, setSelectMonthYear] = useState<string>("");
  const [targetControl, setTargetControl] = useState<number>(0.0);
  //   const [partNameOptions, setPartNameOptions] = useState<string[]>([]);
  const [partNoOptions, setPartNoOptions] = useState<
    DefectModeAddRowViewLineNameChangePart[]
  >([]);
  const [defectTypeOptions, setDefectTypeOptions] = useState<DefectType[]>([]);
  const [selectedDefectType, setSelectedDefectType] = useState<string>("");
  const [defectMode, setDefectMode] = useState<string>("");
  const [process, setProcess] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  const getDefectTypeFromView = (
    baseDefectTypes: DefectType[],
    viewDefectTypes: string[]
  ): DefectType[] => {
    // Filter the baseDefectTypes based on the viewDefectTypes array
    return baseDefectTypes.filter((defectType) =>
      viewDefectTypes.includes(defectType.value)
    );
  };

  const getDefectType = (name: string): DefectType => {
    return (
      defectType.find(({ value }) => value === name) || {
        value: "-",
        hasDefectMode: true,
      }
    );
  };

  const handleCloseModal = () => {
    console.log("handleCloseModal()");

    // setPartName("");
    // setSelectedPartNo("");
    setDefectMode("");
    setSelectedDefectType("");
    setProcess("");

    setSelectMonthYear("");
    setSelectTargetType("");
    setTargetControl(0.0);
    onCancel();

    onCancel();
  };

  const getSettingDefectModeAddRowView = async () => {
    try {
      console.log("getSettingDefectModeAddRowView()");
      // console.log("selectedPartNo:", selectedPartNo);
      // console.log("partName:", partName);

      const data = await settingDefectModeAddRowView({
        line_name: masterDataPageSelectedSectionLine || "",
        part_no: masterDataPageSelectedPartNo || "",
        part_name: masterDataPageSelectedPartName || "",
      });

      console.log(
        "addrowview masterDataPageSelectedPartNo:",
        masterDataPageSelectedPartNo
      );
      // console.log("addrowview parts:", data.add_row_view_result[0].parts);

      setPartName(
        data.add_row_view_result[0].parts.find(
          (item) => item.part_no === masterDataPageSelectedPartNo
        )?.part_name || ""
      );
      setPartNoOptions(data.add_row_view_result[0].parts || []);
      setDefectTypeOptions(
        getDefectTypeFromView(
          defectType,
          data.add_row_view_result[0].defect_type || []
        )
      );

      // console.log(
      //   "defectType: getDefectTypeFromView",
      //   getDefectTypeFromView(
      //     defectType,
      //     data.add_row_view_result[0].defect_type || []
      //   )
      // );
      // console.log(
      //   "defectType: data.add_row_view_result[0].process",
      //   data.add_row_view_result[0].defect_type
      // );
      // console.log("defectType: defectType", defectType);
    } catch (error) {
      console.error("Failed to fetch lines:", error);
    }
  };

  const getSettingDefectModeAddRowViewLineNameChange = async () => {
    try {
      const data = await settingDefectModeAddRowViewLineNameChange({
        line_name: selectedSectionLine || "",
        part_no: selectedPartNo,
        part_name: partName,
      });

      // set part name by part no
      setPartName(
        data.add_row_view_result[0].parts.find(
          (item) => item.part_no === selectedPartNo
        )?.part_name || ""
      );

      // set part no list
      setPartNoOptions(data.add_row_view_result[0].parts || []);
      // setDefectTypeOptions(getDefectTypeFromView(defectType, data.add_row_view_result[0].defect_type || []))

      // console.log("change selectedPartNo:", selectedPartNo);
      // console.log(
      //   "change part_name obj:",
      //   data.add_row_view_result[0].parts.find(
      //     (item) => item.part_no === selectedPartNo
      //   )
      // );
      // console.log(
      //   "change part_name:",
      //   data.add_row_view_result[0].parts.find(
      //     (item) => item.part_no === selectedPartNo
      //   )?.part_name || ""
      // );
      // console.log(
      //   "change part_no:",
      //   data.add_row_view_result[0].parts.map((item) => item.part_no) || []
      // );
    } catch (error) {
      console.error("Failed to fetch lines:", error);
    }
  };

  const submitSettingDefectModeAddRowOk = async () => {
    // settingDefectModeAddRowOk
    try {
      const data = await settingDefectModeAddRowOk({
        line_name: selectedSectionLine || "",
        part_no: selectedPartNo,
        part_name: partName,
        process: process,
        defect_type: selectedDefectType,
        defect_mode: defectMode,
        category: selectedCategory,
        creator: userName,
      });
    } catch (error) {
      console.error("Failed to settingDefectModeAddRowOk:", error);
    }
  };

  const handleSetSelectedPartNo = (value: string) => {
    setSelectedPartNo(value);
    setPartName(
      partNoOptions.find((item) => item.part_no === value)?.part_name || ""
    );
  };

  const handleOnClickOk = async () => {
    const missingFields = [];

    if (!selectedSectionLine || selectedSectionLine === "-")
      missingFields.push("Line Name");
    if (!selectedPartNo || selectedPartNo === "-")
      missingFields.push("Part No");
    if (!partName || partName === "-") missingFields.push("Part Name");
    if (!process || process === "-") missingFields.push("Process");
    if (!selectedDefectType || selectedDefectType === "-")
      missingFields.push("Defect Type");
    if (
      (!defectMode || defectMode === "-") &&
      getDefectType(selectedDefectType).hasDefectMode
    )
      missingFields.push("Defect Mode");
    if (!userName || userName === "-") missingFields.push("Username");
    // if (!selectedCategory || selectedCategory.length <= 0)
    //   missingFields.push("Category");

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

    await submitSettingDefectModeAddRowOk();

    await delay(200);
    await triggerUpdateTableData();

    setPartName("");
    setSelectedPartNo("");
    setDefectMode("");
    setSelectedDefectType("");
    setProcess("");

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
    setPartName(masterDataPageSelectedPartName!!);
    setDefectTypeOptions(defectType);

    console.log("open add row modal:");
    // console.log("selectedLineName:", selectedLineName)
    // console.log("selectedPartNo:", selectedPartNo);
    // console.log("partName:", partName);

    getSettingDefectModeAddRowView();
  }, [open]);

  useEffect(() => {
    if (selectedSectionLine === null || selectedSectionLine === "") {
      return;
    }

    getSettingDefectModeAddRowViewLineNameChange();
  }, [selectedSectionLine]);

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
              value={selectedSectionLine}
              placeholder="Select Line Name"
              options={lines.map((line) => ({
                value: line.section_line,
                label: line.section_line,
              }))}
              style={{
                flex: 3,
              }}
              onChange={(value) => setSelectedSectionLine(value)}
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
              placeholder=""
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
              options={partNoOptions.map((part) => ({
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
              value={partName}
              readOnly
              placeholder="Enter Part Name"
              style={{
                marginLeft: "8px",
                flex: "3",
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
                Defect Type :
              </Text>
            </div>
            <Select
              value={selectedDefectType}
              showSearch
              placeholder="Select Defect Type"
              options={defectTypeOptions.map((type) => ({
                value: type.value,
                label: type.value,
              }))}
              style={{
                flex: 3,
              }}
              onChange={(value) => {
                setDefectMode("");
                setSelectedDefectType(value);
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
                }}
              >
                Defect Mode :
              </Text>
            </div>
            <Input
              disabled={
                !defectType.find((value) => value.value === selectedDefectType)
                  ?.hasDefectMode
              }
              value={defectMode}
              onChange={(e) => setDefectMode(e.target.value)}
              placeholder="Enter Defect Mode"
              style={{
                marginLeft: "8px",
                flex: "3",
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
                Category :
              </Text>
            </div>
            {/* <Select
              value={selectedDefectType}
              showSearch
              mode="multiple"
              placeholder="Select Category"
              options={categories.map((item) => ({
                value: item,
                label: item,
              }))}
              style={{
                flex: 3,
              }}
              onChange={(value) => {
                setCategory(value);
                // setDefectMode("");
                // setSelectedDefectType(value);
              }}
              allowClear
            /> */}
            <Select
              allowClear
              labelInValue
              value={selectedCategory}
              placeholder="Select Category"
              mode="multiple"
              options={categories.map((item) => ({
                value: item,
                label: item,
              }))}
              onChange={(value: any) => {
                setSelectedCategory(value.map((item: any) => item.value) ?? []);
              }}
              style={{
                // border: "none",
                // width: "100%",
                // color: "black",
                // flex: 1,
                flex: 3,
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Input.Group>
        </Space>
        <Space
          style={{ display: "flex", justifyContent: "end", marginTop: "10px" }}
        >
          <Button htmlType="button" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button htmlType="submit" type="primary" onClick={handleOnClickOk}>
            OK
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

export default AddRowSettingModal;
