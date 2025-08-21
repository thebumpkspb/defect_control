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
  settingTargetOrgAddRowOk,
  settingTargetOrgAddRowView,
  settingTargetOrgAddRowViewTargetLevelChange,
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
  SettingTargetOrgAddRowOkRequest,
} from "@/types/settingApi";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { settingTargetLevel } from "@/master_data/masterdata";
import { toUniqueList } from "@/functions";

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

  masterDataPageSelectedTargetLevel: string | null;
  masterDataPageSelectedLineId: number | null;
  // masterDataPageSelectedLineName: string | null;
  // masterDataPageSelectedSectionLine: string | null;
  // masterDataPageSelectedPartNo: string | null;
  // masterDataPageSelectedPartName: string | null;
  currentMasterType: string; // "defect_mode" | "target"

  masterDataPageSelectedGroupName: string;

  userName: string;
  triggerUpdateTableData: () => void | Promise<void>;
}

const AddRowSettingModalOrganizationTarget: React.FC<
  AddRowSettingModalProps
> = ({
  open,
  onCancel,

  masterDataPageSelectedTargetLevel,

  // masterDataPageSelectedPartNo,
  // masterDataPageSelectedPartName,
  userName,
  triggerUpdateTableData,
}) => {
  const [selectedPartNo, setSelectedPartNo] = useState<string>("");
  const [partName, setPartName] = useState<string>("");

  const [selectedTargetLevel, setSelectedTargetLevel] = useState<string>("");
  const [selectedTargetName, setSelectedTargetName] = useState<string>("");
  const [selectTargetType, setSelectTargetType] = useState<string>("Monthly");
  const [selectMonthYear, setSelectMonthYear] = useState<string>("");
  const [targetControl, setTargetControl] = useState<number>(0.0);

  const [targetLevelOptions, setTargetLevelOptions] = useState<string[]>([]);
  const [targetNameOptions, setTargetNameOptions] = useState<string[]>([]);

  const handleCloseModal = () => {
    setSelectedTargetLevel("");
    setSelectedTargetName("");

    setSelectMonthYear("");
    setSelectTargetType("");
    setTargetControl(0.0);
    onCancel();

    onCancel();
  };

  const toSettingTargetOrgAddRowOkRequest =
    (): SettingTargetOrgAddRowOkRequest => {
      return {
        target_level: selectedTargetLevel,
        target_name: selectedTargetName,
        target_type: selectTargetType,
        month_year: selectMonthYear,
        target_percent: targetControl,
        creator: userName,
      };
    };

  const getSettingTargetAddRowView = async () => {
    try {
      const data = await settingTargetOrgAddRowView({
        target_level: masterDataPageSelectedTargetLevel || "",
      });

      setTargetLevelOptions(
        toUniqueList(data.add_row_view_result[0].target_level)
      );
      setTargetNameOptions(data.add_row_view_result[0].target_name);

      const firstTargetNameOption =
        data.add_row_view_result[0].target_name.length > 0
          ? data.add_row_view_result[0].target_name[0]
          : "";

      setSelectedTargetName(firstTargetNameOption);
    } catch (error) {
      console.error("Failed to fetch settingTargetOrgAddRowView:", error);
    }
  };

  // settingTargetAddRowViewLineNameChange
  const getSettingTargetAddRowViewTargetLevelChange = async () => {
    try {
      const data = await settingTargetOrgAddRowViewTargetLevelChange({
        target_level: selectedTargetLevel,
      });

      setTargetLevelOptions(
        toUniqueList(data.add_row_view_result[0].target_level)
      );
      setTargetNameOptions(data.add_row_view_result[0].target_name);

      const firstTargetNameOption =
        data.add_row_view_result[0].target_name.length > 0
          ? data.add_row_view_result[0].target_name[0]
          : "";

      setSelectedTargetName(firstTargetNameOption);
    } catch (error) {
      console.error("Failed to OrgAddRowViewTargetLevelChange:", error);
    }
  };

  const submitSettingTargetAddRowOk = async (
    reqBody: SettingTargetOrgAddRowOkRequest
  ) => {
    try {
      const data = await settingTargetOrgAddRowOk(reqBody);
    } catch (error) {
      console.error("Failed to settingTargetOrgAddRowOk:", error);
    }
  };

  const handleOnClickOk = async () => {
    const missingFields = [];

    if (!selectedTargetLevel || selectedTargetLevel === "-")
      missingFields.push("Target Level");
    if (!selectedTargetName || selectedTargetName === "-")
      missingFields.push("Target Name");
    if (!selectTargetType || selectTargetType === "-")
      missingFields.push("Target Type");
    if (!selectMonthYear || selectMonthYear === "-")
      missingFields.push("Month/Year");
    if (!targetControl || targetControl === 0.0)
      missingFields.push("Target Percent");

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

    await submitSettingTargetAddRowOk(toSettingTargetOrgAddRowOkRequest());

    await delay(200);
    await triggerUpdateTableData();

    setPartName("");
    setSelectedPartNo("");

    setSelectedTargetLevel("");
    setSelectedTargetName("");
    setSelectMonthYear("");
    setSelectTargetType("");
    setTargetControl(0.0);
    onCancel();
  };

  // trigger on open modal
  useEffect(() => {
    if (!open) {
      return;
    }

    // setSelectedPartNo(masterDataPageSelectedPartNo!!);
    // setPartName(masterDataPageSelectedPartName!!);
    // setDefectTypeOptions(defectType);

    setTargetLevelOptions(settingTargetLevel);
    setSelectedTargetLevel(masterDataPageSelectedTargetLevel || "");
    setSelectTargetType("Monthly");

    console.log("open add row modal:");
    // console.log("selectedLineName:", selectedLineName)
    // console.log("selectedPartNo:", selectedPartNo);
    // console.log("partName:", partName);

    getSettingTargetAddRowView();
  }, [open]);

  useEffect(() => {
    if (selectedTargetLevel === null || selectedTargetLevel === "") {
      return;
    }

    getSettingTargetAddRowViewTargetLevelChange();
  }, [selectedTargetLevel]);

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
                  flex: "1",
                  background: "white",
                  textAlign: "right",
                  borderRadius: "5px",
                  // paddingRight: "5px"
                }}
              >
                Target Level :
              </Text>
            </div>
            <Select
              showSearch
              placeholder="Select Target Level"
              value={selectedTargetLevel}
              options={toUniqueList(targetLevelOptions).map((item) => ({
                value: item,
                label: item,
              }))}
              style={{
                flex: 3,
              }}
              onChange={(value) => {
                setSelectedTargetLevel(value);
                // setSelectMonthYear("");
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
                  // paddingRight: "5px"
                }}
              >
                Target Name :
              </Text>
            </div>
            <Select
              showSearch
              placeholder="Select Target Name"
              value={selectedTargetName}
              options={targetNameOptions.map((item) => ({
                value: item,
                label: item,
              }))}
              style={{
                flex: 3,
              }}
              onChange={(value) => {
                setSelectedTargetName(value);
                // setSelectMonthYear("");
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
                  paddingRight: "8px",
                }}
              >
                Target Type :
              </Text>
            </div>
            <Select
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
                    // console.log("Formatted year:", formattedMonth);
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
                    // console.log("Formatted month:", formattedMonth);
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

export default AddRowSettingModalOrganizationTarget;
