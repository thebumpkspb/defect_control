"use client";
import {
  Button,
  Col,
  ConfigProvider,
  DatePicker,
  Flex,
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
  Tag,
  Typography,
  message,
  theme,
} from "antd";

import { NextPage } from "next";
import { useTranslations } from "next-intl";
import {} from "react";
import React, {
  useState,
  useEffect,
  ReactNode,
  Key,
  useMemo,
  useContext,
  createContext,
} from "react";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

import { LayoutStore, ModeStore, UserStore } from "@/store";
const { setUser, loadUser } = UserStore.getState();
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
  HolderOutlined,
} from "@ant-design/icons";

import { Noto_Sans_Thai } from "next/font/google";
import DropDownLabel from "@/components/button/dropdown-label";
import {
  fetchDefectModes,
  fetchLines,
  fetchPartsByLine,
  settingDefectModeAddRowView,
  settingDefectModeTableDelete,
  settingDefectModeTableEditSave,
  settingDefectModeTableEditView,
  settingDefectModeTableEditViewLineNameChange,
  settingDefectModeTableReIndex,
  settingGroupParts,
  settingSubPartTableDelete,
  settingSubPartTableEditSave,
  settingSubPartTableEditView,
  settingSubPartTableEditViewLineNameChange,
  settingTargetOrgAddRowViewTargetLevelChange,
  settingTargetOrgTableDelete,
  settingTargetOrgTableEditSave,
  settingTargetOrgTableEditView,
  settingTargetOrgTableEditViewTargetLevelChange,
  settingTargetTableDelete,
  settingTargetTableEditSave,
  settingTargetTableEditView,
  settingTargetTableEditViewLineNameChange,
  settingTargetTableView,
} from "@/lib/api";
import {
  AddRowViewResult2,
  Group,
  Line,
  Part,
  SettingDefectModeTableEditResult,
  SettingDefectModeTableEditSaveRequest,
  SettingSubPartTableEditViewResult,
  SettingSubPartTableLineNameChangeEditResult,
  SettingTableEditResult,
  SettingTableEditViewResult,
  SettingTableLineNameChangeEditResult,
  SettingTableResult,
  SettingTableResult2,
  SettingTableViewResult,
  SettingTargetOrgAddRowViewTargetLevelChangeResponse,
  SettingTargetOrgTableEditResult,
  SettingTargetOrgTableEditSaveRequest,
  SettingTargetTableEditSaveRequest,
  SubPartTableEditViewResult,
  SubPartTableLineNameChangeEditResult,
  SubPartTableViewResult,
  SubPartTargetTableEditSaveRequest,
} from "@/types/settingApi";
import DropdownEdit from "@/components/button/dropdown-edit";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import CustomPopover from "@/components/button/custom-popover";
import {
  DefectType,
  defectType,
  processType,
  targetType,
} from "@/master_data/masterdata";
import Image from "next/image";

import alertDelete from "@/assets/alert-delete.svg";
import { time } from "console";
import { delay } from "@/functions/event-handle";
import { isNotEmptyValue, toUniqueList } from "@/functions";
import { categories } from "@/constants";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DndContext } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
const { Title, Text } = Typography;
const notoTH = Noto_Sans_Thai({ subsets: ["thai", "latin", "latin-ext"] });
const { Content } = Layout;
import { CSS } from "@dnd-kit/utilities";
function toFilterListNoEmpty(items: string[]) {
  // Use a Map to store unique values by the 'val' field
  const uniqueMap = new Map();

  items.forEach((item) => {
    if (!uniqueMap.has(item) && isNotEmptyValue(item)) {
      uniqueMap.set(item, { text: item, value: item });
    }
  });

  // Convert the Map's values to an array
  return Array.from(uniqueMap.values());
}

function toNumberFilterListNoEmpty(items: number[]) {
  // Use a Map to store unique values by the 'val' field
  const uniqueMap = new Map();

  items.forEach((item) => {
    if (!uniqueMap.has(item) && isNotEmptyValue(item)) {
      uniqueMap.set(item, { text: item, value: item });
    }
  });

  // Convert the Map's values to an array
  return Array.from(uniqueMap.values());
}

interface MasterTypeTargetOrgTableProps {
  targetOrgModesDataSource: SettingTableResult2[];
  groups: Group[];
  username: string;
  triggerUpdateTableData: () => Promise<void> | void;
}

interface MasterTypeTargetLineTableProps {
  targetModesDataSource: SettingTableViewResult[];
  groups: Group[];
  username: string;
  triggerUpdateTableData: () => Promise<void> | void;
}
interface MasterTypeSubPartTableProps {
  subPartDataSource: SubPartTableViewResult[];
  groups: Group[];
  username: string;
  triggerUpdateTableData: () => Promise<void> | void;
}

interface DeflectModeColumnType {
  title?: string | ReactNode;
  dataIndex?: string;
  render?: (text: string, record?: SettingTableResult) => string | JSX.Element;
  filters?: {
    text: string;
    value: string;
    children?: { text: string; value: string }[];
  }[]; // Add filters property
  filterMode?: "menu" | "tree"; // Add filterMode property
  filterSearch?: boolean; // Add filterSearch property
  onFilter?: (value: Key | boolean, record: SettingTableResult) => boolean; // Add onFilter method
  onCell?: any;
  key?: any;
  align?: any;
  width?: any;
}

interface OrganizationalTargetColumnType {
  title: string | ReactNode;
  dataIndex: string;
  render: (text: string, record?: SettingTableResult2) => string | JSX.Element;
  filters?: {
    text: string;
    value: string;
    children?: { text: string; value: string }[];
  }[]; // Add filters property
  filterMode?: "menu" | "tree"; // Add filterMode property
  filterSearch?: boolean; // Add filterSearch property
  onFilter?: (value: Key | boolean, record: SettingTableResult2) => boolean; // Add onFilter method
}

interface LineTargetColumnType {
  title: string | ReactNode;
  dataIndex: string;
  render: (
    text: string,
    record?: SettingTableViewResult
  ) => string | JSX.Element;
  filters?: {
    text: string;
    value: string;
    children?: { text: string; value: string }[];
  }[]; // Add filters property
  filterMode?: "menu" | "tree"; // Add filterMode property
  filterSearch?: boolean; // Add filterSearch property
  onFilter?: (value: Key | boolean, record: SettingTableViewResult) => boolean; // Add onFilter method
}
interface SubPartColumnType {
  title: string | ReactNode;
  dataIndex: string;
  render?: (
    text: string,
    record?: SubPartTableViewResult
  ) => string | JSX.Element;
  filters?: {
    text: string;
    value: string;
    children?: { text: string; value: string }[];
  }[]; // Add filters property
  filterMode?: "menu" | "tree"; // Add filterMode property
  filterSearch?: boolean; // Add filterSearch property
  onFilter?: (value: Key | boolean, record: SubPartTableViewResult) => boolean; // Add onFilter method
}

const MasterTypeOrganizationalTargetTable: React.FC<
  MasterTypeTargetOrgTableProps
> = ({
  targetOrgModesDataSource,
  groups,
  triggerUpdateTableData,
  username,
}) => {
  const column: OrganizationalTargetColumnType[] = [
    {
      title: <div style={{ textAlign: "center" }}>Target Level</div>,
      dataIndex: "target_level",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        targetOrgModesDataSource.map((item) => item.target_level)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) =>
        record.target_level.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{
              label: editForm.target_level,
              value: editForm.target_level,
            }}
            handleChange={async (value: {
              value: string | number | null;
              label: string;
            }) => {
              const targetLevel = String(value.value ?? "").toString();

              const res = await fetchFilteredTableEditDropDownData(targetLevel);

              const firstTargetName =
                res[0].target_name.length > 0 ? res[0].target_name[0] : "";

              setEditForm((prevForm) => ({
                ...prevForm,
                // target_type: String(value.value ?? ""),
                // target_type: res[0]?.target_type[0] || "" ,
                target_name: firstTargetName,
                target_level: targetLevel,
                // month_year: "",
              }));
            }}
            options={toUniqueList(
              filteredTableEditDropDownData.target_level
            ).map((item) => ({
              value: item,
              label: item,
            }))}
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      }, // readonly [0].part_no
    },
    // targetType
    {
      title: <div style={{ textAlign: "center" }}>Target Name</div>,
      dataIndex: "target_name",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        targetOrgModesDataSource.map((item) => item.target_name)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.target_name.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{ label: editForm.target_name, value: editForm.target_name }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                // target_type: String(value.value ?? ""),
                target_name: String(value.value),
                // month_year: "",
              }));
            }}
            options={filteredTableEditDropDownData.target_name.map((item) => ({
              value: item,
              label: item,
            }))}
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      }, // readonly [0].part_no
    },
    // targetName
    {
      title: <div style={{ textAlign: "center" }}>Target Type</div>,
      dataIndex: "target_type",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        targetOrgModesDataSource.map((item) => item.target_type)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.target_type.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{ label: editForm.target_type, value: editForm.target_type }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                target_type: String(value.value ?? ""),
                month_year: "",
              }));
            }}
            options={targetType.map(({ value }) => ({
              value: value,
              label: value,
            }))}
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      }, // readonly [0].part_no
    },
    // targetType
    {
      title: <div style={{ textAlign: "center" }}>Month Year</div>,
      dataIndex: "month_year",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        targetOrgModesDataSource.map((item) => item.month_year)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.month_year === (value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        if (editForm.target_type === "Monthly" && editingId === record!!!.id) {
          return (
            <DatePicker
              picker="month"
              placeholder="MMM-YYYY"
              format="MMMM-YYYY"
              inputReadOnly
              value={
                editForm.month_year
                  ? dayjs(editForm.month_year, "MMMM-YYYY") // Convert string to dayjs
                  : null
              }
              onChange={(date) => {
                if (date) {
                  const formattedMonth = date.format("MMMM-YYYY");
                  // console.log("Formatted month:", formattedMonth);
                  setEditForm((prevForm) => ({
                    ...prevForm,
                    month_year: formattedMonth, // Save the formatted string back
                  }));
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
          );
        } else if (
          editForm.target_type === "Fiscal Year" &&
          editingId === record!!!.id
        ) {
          return (
            <DatePicker
              picker="year"
              placeholder="YYYY"
              format="YYYY"
              inputReadOnly
              value={
                editForm.month_year
                  ? dayjs(editForm.month_year, "YYYY") // Convert string to dayjs
                  : null
              }
              onChange={(date) => {
                if (date) {
                  const formattedMonth = date.format("YYYY");
                  // console.log("Formatted month:", formattedMonth);
                  setEditForm((prevForm) => ({
                    ...prevForm,
                    month_year: formattedMonth, // Save the formatted string back
                  }));
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
          );
        } else {
          return text || "-";
        }
      }, // month picker
    },
    {
      title: <div style={{ textAlign: "center" }}>%Target Control</div>,
      dataIndex: "target_control",
      // filters: [{ text: " ", value: " " }],
      filters: toNumberFilterListNoEmpty(
        targetOrgModesDataSource.map((item) => item.target_control)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.target_control === value,
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <InputNumber
            defaultValue={text} // Initial value
            style={{ width: "100%" }}
            onChange={(value) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                target_control: typeof value === "number" ? value : 0,
              }));
            }}
            step={0.01} // Allows both integers and floating-point numbers
            placeholder="Enter a number"
          />
        ) : (
          text || "-"
        );
      }, // input field
    },
    {
      title: <div style={{ textAlign: "center" }}>Action</div>,
      dataIndex: "",
      render: (text, record) => {
        // do not let user edit blank item
        if (
          record === null ||
          (record?.id === 0 && record.target_name === "")
        ) {
          return <Space></Space>;
        }

        return editingId === record?.id ? (
          <Space>
            <Button type="link" onClick={() => saveEdit(record.id)}>
              Save
            </Button>
            <Button type="link" onClick={() => cancelEdit()}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Space>
            <FaEdit
              onClick={() => startEdit(record!!!.id, record!!!)}
              style={{
                cursor: "pointer",
                width: "20px",
                height: "20px",
                color: "#1976D2",
              }}
            />

            <CustomPopover
              title=""
              triggerElement={
                <MdDelete
                  // onClick={() => deleteRow(record!!!.id)}
                  style={{
                    cursor: "pointer",
                    width: "20px",
                    height: "20px",
                    color: "#1976D2",
                  }}
                />
              } // Trigger element
              popoverContent={(closePopover) => (
                // Popover content
                <Flex vertical>
                  <Flex>
                    <Image
                      src={alertDelete}
                      alt="alertDelete"
                      priority
                      width={20}
                    />
                    <p style={{ marginLeft: "3px", marginBottom: "15px" }}>
                      Sure to delete?
                    </p>
                  </Flex>

                  <Flex>
                    <Button
                      style={{ marginRight: "5px" }}
                      type="primary"
                      onClick={() => deleteRow(record!!!.id)}
                    >
                      Ok
                    </Button>
                    <Button type="default" danger onClick={closePopover}>
                      Cancel
                    </Button>
                  </Flex>
                </Flex>
              )}
            />
          </Space>
        );
      },
    },
  ];

  const defaultTableEditDropDownData = {
    id: 0,
    target_level: [],
    target_name: [],
    target_type: "",
    month_year: "",
    target_control: 0,
  };

  const defalutEditForm = {
    target_level: "",
    id: 0,
    target_name: "",
    target_type: "",
    month_year: "",
    target_control: 0,
    creator: "",
  };

  const [editingId, setEditingId] = useState<number | null>(null);

  const [tableEditDropDownData, settableEditDropDownData] =
    useState<SettingTargetOrgTableEditResult>(defaultTableEditDropDownData);
  const [filteredTableEditDropDownData, setFilteredTableEditDropDownData] =
    useState<SettingTargetOrgTableEditResult>(defaultTableEditDropDownData);
  const [editForm, setEditForm] =
    useState<SettingTargetOrgTableEditSaveRequest>(defalutEditForm);

  const startEdit = async (key: number, record: SettingTableResult2) => {
    // do not let user edit blank item
    if (record.id === 0 && record.target_name === "") {
      return;
    }

    setEditingId(key);
    setEditForm({
      id: 0, // need to replacy this with actual id in db

      creator: username,

      target_level: record.target_level,
      target_name: record.target_name,
      target_type: record.target_type,
      month_year: record.month_year,
      target_control: record.target_control,
    });

    // fetch dropdown data
    try {
      const response = await settingTargetOrgTableEditView({
        target_level: record.target_level,
        id: record.id,
        target_name: record.target_name,
        target_type: record.target_type,
        month_year: record.month_year,
        target_control: record.target_control,
      });
      // console.log("Updated data:", response.setting_table_edit_result);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        settableEditDropDownData(response.setting_table_edit_result[0]);
        // update id to actual id in db
        setEditForm((previous) => ({
          ...previous,
          id: response.setting_table_edit_result[0].id,
        }));
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }

    if (record.target_level) {
      await fetchFilteredTableEditDropDownData(record.target_level);
    }
  };

  const saveEdit = async (key: number) => {
    const editedRow = targetOrgModesDataSource.find((row) => row.id === key);

    if (editedRow === null) {
      return;
    }
    const hasValue = [
      editForm.id,
      // editForm.line_name,
      // editForm.part_no,
      // editForm.part_name,
      // editForm.process,
      // editForm.group_name,
      editForm.target_type,
      editForm.month_year,
      editForm.target_control,
      editForm.target_level,
      editForm.target_name,
    ].some((field) => {
      if (typeof field === "string") {
        return field.trim() !== "";
      }
      return field !== null && field !== undefined;
    });

    if (!hasValue) {
      alert("กรุณากรอกข้อมูลก่อนบันทึก");
      return;
    }

    try {
      const response = await settingTargetOrgTableEditSave({
        id: editForm.id,
        // line_name: editForm.line_name,
        // part_no: editForm.part_no,
        // part_name: editForm.part_name,
        // process: editForm.process,
        creator: username,
        // group_name: editForm.group_name,
        target_type: editForm.target_type,
        month_year: editForm.month_year,
        target_control: editForm.target_control,
        target_level: editForm.target_level,
        target_name: editForm.target_name,
      });
      // console.log("Updated data:", response.setting_table_edit_save);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        await delay(200);
        await triggerUpdateTableData();
      }

      setEditingId(null);
    } catch (error) {
      console.error("Error saving edits:", error);
    }
  };

  const deleteRow = async (key: number | null) => {
    const deletedItem = targetOrgModesDataSource.find(
      (item) => item.id === key
    );

    if (!deletedItem) {
      return;
    }

    const hasData = [
      // deletedItem.line_name,
      // deletedItem.part_no,
      // deletedItem.part_name,
      // deletedItem.process,
      // deletedItem.group_name,
      deletedItem.target_type,
      deletedItem.month_year,
      deletedItem.target_control,
      deletedItem.target_level,
      deletedItem.target_name,
    ].some((field) => {
      if (typeof field === "string") {
        return field.trim() !== "";
      }
      return field !== null && field !== undefined;
    });

    if (!hasData) {
      alert("ไม่สามารถลบแถวที่ไม่มีข้อมูลได้");
      return;
    }

    try {
      const response = await settingTargetOrgTableDelete({
        id: deletedItem.id,
        // line_name: deletedItem.line_name,
        // part_no: deletedItem.part_no,
        // part_name: deletedItem.part_name,
        // process: deletedItem.process,
        // group_name: deletedItem.group_name,
        target_type: deletedItem.target_type,
        month_year: deletedItem.month_year,
        target_control: deletedItem.target_control,
        target_level: deletedItem.target_level,
        target_name: deletedItem.target_name,
      });

      // update data in table if deletion success
      if (response !== null) {
        // Update the table data
        await triggerUpdateTableData();
      }
    } catch (error) {
      console.error("Error delete:", error);
    }
  };

  const fetchFilteredTableEditDropDownData = async (
    // line_name: string,
    // part_no: string,
    // part_name: string,
    // group_name: string
    target_level: string
  ): Promise<SettingTargetOrgTableEditResult[]> => {
    // fetch dropdown data
    try {
      const response = await settingTargetOrgTableEditViewTargetLevelChange({
        target_level: target_level,
      });

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        setFilteredTableEditDropDownData(
          () => response.setting_table_edit_result[0]
        );
        return response.setting_table_edit_result;
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }
    return [];
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <Table
      columns={column}
      dataSource={targetOrgModesDataSource}
      rowKey={(record) => record.id}
    />
  );
};

const MasterTypeLineTargetTable: React.FC<MasterTypeTargetLineTableProps> = ({
  targetModesDataSource,
  groups,
  triggerUpdateTableData,
  username,
}) => {
  const column: LineTargetColumnType[] = [
    {
      title: <div style={{ textAlign: "center" }}>Line Name</div>,
      dataIndex: "line_name",
      filters: toFilterListNoEmpty(
        targetModesDataSource.map((item) => item.line_name)
      ),
      // filters: [{ text: "Line Name", value: "Line Name" }],
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.line_name.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }
        // tableEditDropDownData

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{
              label: editForm?.line_name || "",
              value: editForm?.line_name || "",
            }}
            handleChange={async (value: {
              value: string | number | null;
              label: string;
            }) => {
              const data = await fetchFilteredTableEditDropDownData(
                value.value as string, // line_name
                "",
                "",
                "",
                ""
              );
              // console.log("await fetchFilteredTable pn t:", data[0].parts);

              // get line_name to set form
              const selectedLineName = String(value.value ?? "");

              // get first part_no in request to set form
              const selectedPartNo = data[0].parts[0].part_no;

              // get part_name to set form
              const selectedPartName =
                data[0].parts.find((item) => item.part_no === selectedPartNo)
                  ?.part_name || "";

              setEditForm((prevForm) => ({
                ...prevForm,
                line_name: selectedLineName,
                part_no: selectedPartNo,
                part_name: selectedPartName,
              }));
            }}
            options={tableEditDropDownData.line_name.map((lineName) => ({
              value: lineName,
              label: lineName,
            }))}
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Process</div>,
      dataIndex: "process",
      // filters: [{ text: "Inline", value: "Inline" }],
      filters: toFilterListNoEmpty(
        targetModesDataSource.map((item) => item.process)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.process.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{ label: editForm.process, value: editForm.process }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                process: String(value.value ?? ""),
              }));
            }}
            options={
              filteredTableEditDropDownData.process?.map((process) => ({
                value: process,
                label: process,
              })) ??
              processType.map(({ value }) => ({
                value: value,
                label: value,
              }))
            }
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Part No</div>,
      dataIndex: "part_no",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        targetModesDataSource.map((item) => item.part_no)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.part_no.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{ label: editForm.part_no, value: editForm.part_no }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              const selectedPartNo = String(value.value ?? "");

              // set part_name
              const partName =
                filteredTableEditDropDownData.parts.find(
                  (item) => item.part_no === selectedPartNo
                )?.part_name || "";

              // console.log(
              //   "tartget update part_no data :",
              //   filteredTableEditDropDownData.parts
              // );
              // console.log("tartget update select part no: ", selectedPartNo);
              // console.log("tartget update select part name: ", partName);

              setEditForm((prevForm) => ({
                ...prevForm,
                part_no: String(value.value ?? ""),
                part_name: partName,
              }));
            }}
            options={filteredTableEditDropDownData.parts.map((item) => ({
              value: item.part_no,
              label: item.part_no,
            }))}
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      }, // readonly [0].part_no
    },
    {
      title: <div style={{ textAlign: "center" }}>Part Name</div>,
      dataIndex: "part_name",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        targetModesDataSource.map((item) => item.part_name)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.part_name.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <Input value={editForm.part_name} readOnly />
        ) : (
          text || "-"
        );
      }, // dropdown [0].part_name
    },
    {
      title: <div style={{ textAlign: "center" }}>Target Type</div>,
      dataIndex: "target_type",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        targetModesDataSource.map((item) => item.target_type)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.target_type.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{ label: editForm.target_type, value: editForm.target_type }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                target_type: String(value.value ?? ""),
                month_year: "",
              }));
            }}
            options={targetType.map(({ value }) => ({
              value: value,
              label: value,
            }))}
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      }, // readonly [0].part_no
    },
    // targetType
    {
      title: <div style={{ textAlign: "center" }}>Month Year</div>,
      dataIndex: "month_year",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        targetModesDataSource.map((item) => item.month_year)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.month_year === (value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        if (editForm.target_type === "Monthly" && editingId === record!!!.id) {
          return (
            <DatePicker
              picker="month"
              placeholder="MMM-YYYY"
              format="MMMM-YYYY"
              inputReadOnly
              value={
                editForm.month_year
                  ? dayjs(editForm.month_year, "MMMM-YYYY") // Convert string to dayjs
                  : null
              }
              onChange={(date) => {
                if (date) {
                  const formattedMonth = date.format("MMMM-YYYY");
                  // console.log("Formatted month:", formattedMonth);
                  setEditForm((prevForm) => ({
                    ...prevForm,
                    month_year: formattedMonth, // Save the formatted string back
                  }));
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
          );
        } else if (
          editForm.target_type === "Fiscal Year" &&
          editingId === record!!!.id
        ) {
          return (
            <DatePicker
              picker="year"
              placeholder="YYYY"
              format="YYYY"
              inputReadOnly
              value={
                editForm.month_year
                  ? dayjs(editForm.month_year, "YYYY") // Convert string to dayjs
                  : null
              }
              onChange={(date) => {
                if (date) {
                  const formattedMonth = date.format("YYYY");
                  // console.log("Formatted month:", formattedMonth);
                  setEditForm((prevForm) => ({
                    ...prevForm,
                    month_year: formattedMonth, // Save the formatted string back
                  }));
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
          );
        } else {
          return text || "-";
        }
      }, // month picker
    },
    {
      title: <div style={{ textAlign: "center" }}>%Target Control</div>,
      dataIndex: "target_control",
      // filters: [{ text: " ", value: " " }],
      filters: toNumberFilterListNoEmpty(
        targetModesDataSource.map((item) => item.target_control)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.target_control === value,
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <InputNumber
            defaultValue={text} // Initial value
            style={{ width: "100%" }}
            onChange={(value) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                target_control: typeof value === "number" ? value : 0,
              }));
            }}
            step={0.01} // Allows both integers and floating-point numbers
            placeholder="Enter a number"
          />
        ) : (
          text || "-"
        );
      }, // input field
    },
    {
      title: <div style={{ textAlign: "center" }}>Action</div>,
      dataIndex: "",
      render: (text, record) => {
        // do not let user edit blank item
        if (record === null || (record?.id === 0 && record.line_name === "")) {
          return <Space></Space>;
        }

        return editingId === record?.id ? (
          <Space>
            <Button type="link" onClick={() => saveEdit(record.id)}>
              Save
            </Button>
            <Button type="link" onClick={() => cancelEdit()}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Space>
            <FaEdit
              onClick={() => startEdit(record!!!.id, record!!!)}
              style={{
                cursor: "pointer",
                width: "20px",
                height: "20px",
                color: "#1976D2",
              }}
            />

            <CustomPopover
              title=""
              triggerElement={
                <MdDelete
                  // onClick={() => deleteRow(record!!!.id)}
                  style={{
                    cursor: "pointer",
                    width: "20px",
                    height: "20px",
                    color: "#1976D2",
                  }}
                />
              } // Trigger element
              popoverContent={(closePopover) => (
                // Popover content
                <Flex vertical>
                  <Flex>
                    <Image
                      src={alertDelete}
                      alt="alertDelete"
                      priority
                      width={20}
                    />
                    <p style={{ marginLeft: "3px", marginBottom: "15px" }}>
                      Sure to delete?
                    </p>
                  </Flex>

                  <Flex>
                    <Button
                      style={{ marginRight: "5px" }}
                      type="primary"
                      onClick={() => deleteRow(record!!!.id)}
                    >
                      Ok
                    </Button>
                    <Button type="default" danger onClick={closePopover}>
                      Cancel
                    </Button>
                  </Flex>
                </Flex>
              )}
            />
          </Space>
        );
      },
    },
  ];

  const defaultTableEditDropDownData = {
    id: 0,
    group_name: [],
    line_name: [],
    process: [],
    // part_no: [],
    // part_name: "",
    parts: [],
    target_type: "",
    month_year: "",
    target_control: 0,
  };

  const defalutEditForm = {
    id: 0,
    group_name: "",
    line_name: "",
    part_no: "",
    part_name: "",
    process: "",
    sub_line: "",
    target_type: "",
    month_year: "",
    target_control: 0,
    creator: "",
  };

  const [editingId, setEditingId] = useState<number | null>(null);

  const [tableEditDropDownData, settableEditDropDownData] =
    useState<SettingTableEditViewResult>(defaultTableEditDropDownData);
  const [filteredTableEditDropDownData, setFilteredTableEditDropDownData] =
    useState<SettingTableLineNameChangeEditResult>(
      defaultTableEditDropDownData
    );
  const [editForm, setEditForm] =
    useState<SettingTargetTableEditSaveRequest>(defalutEditForm);

  const startEdit = async (key: number, record: SettingTableViewResult) => {
    // do not let user edit blank item
    if (record.id === 0 && record.line_name === "") {
      return;
    }
    // console.log("record:", record);
    setEditingId(key);
    setEditForm({
      id: 0, // need to replacy this with actual id in db
      line_name: record.line_name,
      part_no: record.part_no,
      part_name: record.part_name,
      sub_line: record.sub_line,
      process: record.process,
      creator: username,

      group_name: record.group_name,
      target_type: record.target_type,
      month_year: record.month_year,
      target_control: record.target_control,
    });

    // fetch dropdown data
    try {
      const response = await settingTargetTableEditView({
        line_name: record.line_name,
        part_no: record.part_no,
        part_name: record.part_name,
        sub_line: record.sub_line,
        process: record.process,
        id: record.id,
        group_name: record.group_name,
        target_type: record.target_type,
        month_year: record.month_year,
        target_control: record.target_control,
      });
      // console.log("Updated data:", response.setting_table_edit_result);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        settableEditDropDownData(response.setting_table_edit_result[0]);
        // update id to actual id in db
        setEditForm((previous) => ({
          ...previous,
          id: response.setting_table_edit_result[0].id,
        }));
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }

    // fetch filtered dropdown if line_name is not empty
    if (record.line_name) {
      await fetchFilteredTableEditDropDownData(
        record.line_name,
        record.part_no,
        record.part_name,
        record.sub_line,
        record.group_name
      );
    }
  };

  const saveEdit = async (key: number) => {
    const editedRow = targetModesDataSource.find((row) => row.id === key);

    if (editedRow === null) {
      return;
    }
    const hasValue = [
      editForm.id,
      editForm.line_name,
      editForm.part_no,
      editForm.part_name,
      editForm.process,
      editForm.sub_line,
      editForm.group_name,
      editForm.target_type,
      editForm.month_year,
      editForm.target_control,
    ].some((field) => {
      if (typeof field === "string") {
        return field.trim() !== "";
      }
      return field !== null && field !== undefined;
    });

    if (!hasValue) {
      alert("กรุณากรอกข้อมูลก่อนบันทึก");
      return;
    }

    try {
      const response = await settingTargetTableEditSave({
        id: editForm.id,
        line_name: editForm.line_name,
        part_no: editForm.part_no,
        part_name: editForm.part_name,
        process: editForm.process,
        sub_line: editForm.sub_line,
        creator: username,
        group_name: editForm.group_name,
        target_type: editForm.target_type,
        month_year: editForm.month_year,
        target_control: editForm.target_control,
      });
      // console.log("Updated data:", response.setting_table_edit_save);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        await delay(200);
        await triggerUpdateTableData();
      }

      setEditingId(null);
    } catch (error) {
      console.error("Error saving edits:", error);
    }
  };

  const deleteRow = async (key: number | null) => {
    const deletedItem = targetModesDataSource.find((item) => item.id === key);

    if (!deletedItem) {
      return;
    }

    const hasData = [
      deletedItem.line_name,
      deletedItem.part_no,
      deletedItem.part_name,
      deletedItem.process,
      deletedItem.sub_line,
      deletedItem.group_name,
      deletedItem.target_type,
      deletedItem.month_year,
      deletedItem.target_control,
    ].some((field) => {
      if (typeof field === "string") {
        return field.trim() !== "";
      }
      return field !== null && field !== undefined;
    });

    if (!hasData) {
      alert("ไม่สามารถลบแถวที่ไม่มีข้อมูลได้");
      return;
    }

    try {
      const response = await settingTargetTableDelete({
        id: deletedItem.id,
        line_name: deletedItem.line_name,
        part_no: deletedItem.part_no,
        part_name: deletedItem.part_name,
        process: deletedItem.process,
        sub_line: deletedItem.sub_line,
        group_name: deletedItem.group_name,
        target_type: deletedItem.target_type,
        month_year: deletedItem.month_year,
        target_control: deletedItem.target_control,
      });

      // update data in table if deletion success
      if (response !== null) {
        // Update the table data
        await triggerUpdateTableData();
      }
    } catch (error) {
      console.error("Error delete:", error);
    }
  };

  const fetchFilteredTableEditDropDownData = async (
    line_name: string,
    part_no: string,
    part_name: string,
    sub_line: string,
    group_name: string
  ): Promise<SettingTableLineNameChangeEditResult[]> => {
    // fetch dropdown data
    try {
      const response = await settingTargetTableEditViewLineNameChange({
        line_name: line_name,
        part_no: part_no,
        part_name: part_name,
        sub_line: sub_line,
        group_name: group_name,
      });

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        setFilteredTableEditDropDownData(response.setting_table_edit_result[0]);
        return response.setting_table_edit_result;
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }
    return [];
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <Table
      columns={column}
      dataSource={targetModesDataSource}
      rowKey={(record) => record.id}
    />
  );
};

interface MasterTypeDefectModeTableProps {
  defectModesDataSource: SettingTableResult[];
  triggerUpdateTableData: () => Promise<void> | void;
  username: string;
  isReIndexDefectMode: boolean;
  isSaveReIndexDefectMode: boolean;
}

const toSettingDefectModeTableEditSaveReqBody = (
  data: SettingTableResult,
  username: string
): SettingDefectModeTableEditSaveRequest => {
  return {
    id: data.id,
    line_name: data.line_name,
    part_no: data.part_no,
    part_name: data.part_name,
    process: data.process,
    defect_type: data.defect_type,
    defect_mode: data.defect_mode,
    category: data.category,
    creator: username,
  };
};

const defaultTableEditDropDownData = {
  id: 0,
  line_name: [],
  process: [],
  parts: [],
  defect_type: [],
  defect_mode: "",
  id_table: 0,
};

const defalutEditForm = {
  id: 0,
  line_name: "",
  part_no: "",
  part_name: "",
  process: "",
  defect_type: "",
  defect_mode: "",
  category: [],
  creator: "",
};

const MasterTypeDefectModeTable: React.FC<MasterTypeDefectModeTableProps> = ({
  defectModesDataSource,
  triggerUpdateTableData,
  username,
  isReIndexDefectMode,
  isSaveReIndexDefectMode,
}) => {
  const [tableEditDropDownData, settableEditDropDownData] =
    useState<SettingDefectModeTableEditResult>(defaultTableEditDropDownData);
  const [dataSource, setDataSource] = useState(
    defectModesDataSource.map((item, index) => ({
      ...item,
      index: index + 1,
    }))
  );
  const [originalDataSource, setOriginalDataSource] = useState(
    defectModesDataSource
  );
  // console.log("defectModesDataSource:", defectModesDataSource);
  const [saving, setSaving] = useState(false);
  // console.log("dataSource:", dataSource);
  const RowContext = React.createContext<any>(null);
  const DragHandle = () => {
    // const { setActivatorNodeRef, listeners }: any = useContext(RowContext);
    const context = useContext(RowContext);
    const setActivatorNodeRef = context?.setActivatorNodeRef ?? (() => {});
    const listeners = context?.listeners ?? {};
    return (
      <Button
        type="text"
        size="small"
        icon={<HolderOutlined />}
        style={{ cursor: "move" }}
        ref={setActivatorNodeRef}
        {...listeners}
      />
    );
  };
  // console.log("dataSource:", dataSource);
  // const onDragEnd = ({ active, over }: any) => {
  //   console.log("active:", active);
  //   console.log("over:", over);
  //   if (active.id !== over.id) {
  //     setDataSource((prev) => {
  //       const oldIndex = prev.findIndex((item) => item.id === active.id);
  //       const newIndex = prev.findIndex((item) => item.id === over.id);
  //       return arrayMove(prev, oldIndex, newIndex);
  //     });
  //   }
  // };
  const sortedData = useMemo(
    () =>
      [...dataSource].sort(
        (a: any, b: any) => a.master_defect_index - b.master_defect_index
      ),
    [dataSource]
  );
  const onDragEnd = ({ active, over }: any) => {
    if (active.id !== over.id) {
      setDataSource((prev) => {
        // Ensure our reference array is ALWAYS sorted by master_defect_index
        const prevSorted = [...prev].sort(
          (a: any, b: any) => a.master_defect_index - b.master_defect_index
        );
        const oldIndex = prevSorted.findIndex((item) => item.id === active.id);
        const newIndex = prevSorted.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(prevSorted, oldIndex, newIndex);

        // Update master_defect_index to match new order
        const newDataWithOrder = newOrder.map((item, idx) => ({
          ...item,
          master_defect_index: idx,
        }));

        return newDataWithOrder;
      });
    }
  };
  //!

  //   if (active.id !== over.id) {
  //     setDataSource((prev) => {
  //       const oldIndex = prev.findIndex((item) => item.id === active.id);
  //       const newIndex = prev.findIndex((item) => item.id === over.id);
  //       const newOrder = arrayMove(prev, oldIndex, newIndex);
  //       // update order index on all items
  //       return newOrder
  //         .map((item, idx) => ({
  //           ...item,
  //           master_defect_index: idx,
  //         }))
  //         .sort(
  //           (a: any, b: any) => a.master_defect_index - b.master_defect_index
  //         );
  //     });
  //   }
  // };

  //!
  // const handleSaveIndex = () => {
  //   // originalOrder and dataSource might now have diffmaster_defect_indexerent orders
  //   const updates = dataSource
  //     .map((item, idx) => ({ id: item.id, master_defect_index: idx }))
  //     .filter((item, idx) => originalDataSource[idx].id !== item.id);
  //   console.log("updates:", updates);
  //   if (updates.length) {
  //     setSaving(true);
  //   } else {
  //     message.info("No changes to save.");
  //   }
  // };

  const handleSaveIndex = () => {
    const updates = dataSource
      .map((item, idx) => ({
        id: item.id,
        master_defect_index: idx,
      }))
      .filter((item, idx) => originalDataSource[idx].id !== item.id);

    // console.log("updates:", updates);

    if (updates.length) {
      setSaving(true);
      saveIndexToDB(updates)
        .then(() => message.success("Index saved!"))
        .catch((err) => message.error("Failed: " + err.message))
        .finally(() => setSaving(false));
    } else {
      message.info("No changes to save.");
    }
  };

  useEffect(() => {
    setDataSource(
      defectModesDataSource
        .sort((a: any, b: any) => a.master_defect_index - b.master_defect_index)
        .map((item, index) => ({
          ...item,
          index: index + 1,
        }))
    );
  }, [defectModesDataSource]);
  useEffect(() => {
    if (isSaveReIndexDefectMode == true) {
      handleSaveIndex();
    }
  }, [isSaveReIndexDefectMode]);
  useEffect(() => {
    if (isReIndexDefectMode == true) {
      setOriginalDataSource(dataSource);
    } else {
      setOriginalDataSource([]);
    }
  }, [isReIndexDefectMode]);
  async function saveIndexToDB(updates: any) {
    try {
      const response = await settingDefectModeTableReIndex(updates);
      // console.log("Updated data:", response.setting_table_re_index);

      // setEditingId(null);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        await delay(200);
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    } finally {
      await triggerUpdateTableData();
    }
    // Example: POST [{key: "1", order: 0}, ...]
    // console.log("updates:", updates);
    //   const res = await fetch("/api/reorder", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ updates }),
    //   });
    //   if (!res.ok) throw new Error((await res.text()) || "Could not save order");
  }
  const Row = (props: any) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: props["data-row-key"] });

    const style = {
      ...props.style,
      transform: CSS.Translate.toString(transform),
      transition,
      ...(isDragging ? { background: "#f6ffed" } : {}),
    };

    const contextValue = useMemo(
      () => ({ setActivatorNodeRef, listeners }),
      [setActivatorNodeRef, listeners]
    );

    return (
      <RowContext.Provider value={contextValue}>
        <tr {...props} ref={setNodeRef} style={style} {...attributes} />
      </RowContext.Provider>
    );
  };

  const column: DeflectModeColumnType[] = [
    isReIndexDefectMode
      ? {
          key: "sort",
          align: "center",
          width: 64,
          render: () => <DragHandle />,
        }
      : {},
    {
      title: "Seq.",
      dataIndex: "index",
      width: 64,
    },
    {
      title: <div style={{ textAlign: "center" }}>Line Name</div>,
      dataIndex: "line_name",
      filters: toFilterListNoEmpty(
        defectModesDataSource.map((item) => item.line_name)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.line_name.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }
        // tableEditDropDownData

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{
              label: editForm?.line_name || "",
              value: editForm?.line_name || "",
            }}
            handleChange={async (value: {
              value: string | number | null;
              label: string;
            }) => {
              // update part choice
              const data = await fetchFilteredTableEditDropDownData(
                value.value as string,
                "",
                ""
              );

              // get line_name to set form
              const selectedLineName = String(value.value ?? "");

              // get first part_no in request to set form
              const selectedPartNo = data[0].parts[0].part_no;

              // get part_name to set form
              const selectedPartName =
                data[0].parts.find((item) => item.part_no === selectedPartNo)
                  ?.part_name || "";

              // console.log(
              //   "await value.value (line_name) pn d:",
              //   selectedLineName
              // );
              // console.log("await fetchFilteredTable pn d:", data[0].parts);

              setEditForm((prevForm) => ({
                ...prevForm,
                line_name: selectedLineName,
                part_no: selectedPartNo,
                part_name: selectedPartName,
              }));
            }}
            options={tableEditDropDownData.line_name.map((lineName) => ({
              value: lineName,
              label: lineName,
            }))}
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Part Name</div>,
      dataIndex: "part_name",
      filters: toFilterListNoEmpty(
        defectModesDataSource.map((item) => item.part_name) || []
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.part_name.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <Input value={editForm.part_name} readOnly />
        ) : (
          text || "-"
        );
      }, // dropdown [0].part_name
    },
    {
      title: <div style={{ textAlign: "center" }}>Part No</div>,
      dataIndex: "part_no",
      filters: toFilterListNoEmpty(
        defectModesDataSource.map((item) => item.part_no) || []
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.part_no.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            // defaultValue={{ label: editForm., value: "" }}
            value={{ label: editForm.part_no, value: editForm.part_no }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              const current_part_no = String(value.value);
              const part_name = filteredTableEditDropDownData.parts.find(
                (item) => item.part_no === current_part_no
              )?.part_name;

              // console.log(
              //   "defect select Part No edit part_no:",
              //   filteredTableEditDropDownData.parts
              // );

              setEditForm((prevForm) => ({
                ...prevForm,
                part_no: String(value.value ?? ""),
                part_name: part_name || "",
              }));
            }}
            options={filteredTableEditDropDownData.parts.map((partNo) => ({
              value: partNo.part_no,
              label: partNo.part_no,
            }))}
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      }, // readonly [0].part_no
    },
    {
      title: <div style={{ textAlign: "center" }}>Process</div>,
      dataIndex: "process",
      filters:
        toFilterListNoEmpty(
          defectModesDataSource.map((item) => item.process)
        ) || [],
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.process.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{ label: editForm.process, value: editForm.process }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                process: String(value.value ?? ""),
              }));
            }}
            options={
              filteredTableEditDropDownData.process?.map((process) => ({
                value: process,
                label: process,
              })) ??
              processType.map(({ value }) => ({
                value: value,
                label: value,
              }))
            }
            // processType
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      }, // dropdown [0].process
    },
    {
      title: <div style={{ textAlign: "center" }}>Defect Type</div>,
      dataIndex: "defect_type",
      filters:
        toFilterListNoEmpty(
          defectModesDataSource.map((item) => item.defect_type)
        ) || [],
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.defect_type.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{
              label: editForm.defect_type,
              value: editForm.defect_type,
            }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              const selectedDefectType = defectType.find(
                // ({ value }) => editForm.defect_type === value
                (item) => item.value === String(value.value ?? "")
              );

              // console.log(
              //   "defect mode select defect_type:",
              //   selectedDefectType
              // );
              // console.log(
              //   "defect mode defect_mode:",
              //   selectedDefectType?.hasDefectMode ? editForm.defect_mode : ""
              // );

              setEditForm((prevForm) => ({
                ...prevForm,
                defect_type: String(value.value ?? ""),

                // reset defect_mode if defect_type has no defect_mode
                defect_mode: selectedDefectType?.hasDefectMode
                  ? editForm.defect_mode
                  : "",
              }));
            }}
            options={
              tableEditDropDownData.defect_type?.map((defect_type) => ({
                value: defect_type,
                label: defect_type,
              })) ??
              defectType.map(({ value }) => ({
                value: value,
                label: value,
              }))
            }
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      }, // dropdown [0].defect_type
    },
    {
      title: <div style={{ textAlign: "center" }}>Defect Mode</div>,
      dataIndex: "defect_mode",
      filters:
        toFilterListNoEmpty(
          defectModesDataSource.map((item) => item.defect_mode)
        ) || [],
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.defect_mode.includes(value as string),
      render: (text, record) => {
        if (!record) {
          return text || "-";
        }

        const selectedDefectType = defectType.find(
          ({ value }) => record?.defect_type === value
        );

        return editingId === record.id ? (
          <Input
            value={editForm.defect_mode}
            disabled={
              defectType.find(({ value }) => editForm.defect_type === value)
                ?.hasDefectMode === false
            }
            onChange={(e) => {
              const selectedDefectType = defectType.find(
                ({ value }) => editForm.defect_type === value
              );

              console.log("onChange selected defect type:", selectedDefectType);

              console.log("onChange defect mode text:", e.target.value);

              if (selectedDefectType?.hasDefectMode === false) {
                setEditForm((prevForm) => ({
                  ...prevForm,
                  defect_mode: "-",
                }));
              } else {
                setEditForm((prevForm) => ({
                  ...prevForm,
                  defect_mode: String(e.target.value ?? ""),
                }));
              }
            }}
          />
        ) : (
          (selectedDefectType?.hasDefectMode === false ? "-" : text) || "-"
        );
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      // key: "category",
      // align: "center" as AlignType,
      // width: 120,
      // filters: toFilterListNoEmpty(data.map((item) => item.category)),
      filters: toFilterListNoEmpty(categories),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean | any, record: any) =>
        // record.action === value,
        record?.category?.some((cat: any) => value.includes(cat)),
      render: (tags: any, record: any) =>
        editingId === record.id ? (
          <Select
            labelInValue
            value={editForm.category}
            placeholder=""
            mode="multiple"
            options={categories.map((item) => ({
              value: item,
              label: item,
            }))}
            onChange={(value) => {
              // console.log("value:", value);
              setEditForm((prevForm) => ({
                ...prevForm,
                category: value.map((item: any) => item.value) ?? [],
              }));
            }}
            style={{
              border: "none",
              width: "100%",
              color: "black",
              flex: 1,
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        ) : (
          <div className="tagRow">
            {tags?.map((tag: string) => {
              let color = "default";
              switch (tag) {
                case "Man":
                  color = "geekblue";
                  break;
                case "Machine":
                  color = "green";
                  break;
                case "Method":
                  color = "orange";
                  break;
                case "Material":
                  color = "gold";
                  break;
                case "Measurement":
                  color = "cyan";
                  break;
                case "Environment":
                  color = "purple";
                  break;
              }
              return (
                <Tag color={color} key={tag}>
                  {tag.slice(0, 3)}
                </Tag>
              );
            })}
          </div>
        ),
      onCell: (record: any, index: any) => {
        if (editingId !== record.id) {
          return {
            style: {
              padding: "5px",
            },
          };
        }
      },
    },
    !isReIndexDefectMode
      ? {
          title: <div style={{ textAlign: "center" }}>Action</div>,
          dataIndex: "",
          render: (text, record) => {
            // do not let user edit blank item
            if (
              record === null ||
              (record?.id === 0 && record.line_name === "")
            ) {
              return <Space></Space>;
            }

            return editingId === record?.id ? (
              <Space>
                <Button type="link" onClick={() => saveEdit(record.id)}>
                  Save
                </Button>
                <Button type="link" onClick={() => cancelEdit()}>
                  Cancel
                </Button>
              </Space>
            ) : (
              <Space>
                <FaEdit
                  onClick={() => startEdit(record!!!.id, record!!!)}
                  style={{
                    cursor: "pointer",
                    width: "20px",
                    height: "20px",
                    color: "#1976D2",
                  }}
                />

                <CustomPopover
                  title=""
                  triggerElement={
                    <MdDelete
                      // onClick={() => deleteRow(record!!!.id)}
                      style={{
                        cursor: "pointer",
                        width: "20px",
                        height: "20px",
                        color: "#1976D2",
                      }}
                    />
                  } // Trigger element
                  popoverContent={(closePopover) => (
                    // Popover content
                    <Flex vertical>
                      <Flex>
                        <Image
                          src={alertDelete}
                          alt="alertDelete"
                          priority
                          width={20}
                        />
                        <p style={{ marginLeft: "3px", marginBottom: "15px" }}>
                          Sure to delete?
                        </p>
                      </Flex>

                      <Flex>
                        <Button
                          style={{ marginRight: "5px" }}
                          type="primary"
                          onClick={() => deleteRow(record!!!.id)}
                        >
                          Ok
                        </Button>
                        <Button type="default" danger onClick={closePopover}>
                          Cancel
                        </Button>
                      </Flex>
                    </Flex>
                  )}
                />
              </Space>
            );
          },
        }
      : {},
  ];

  const getAvailableDefectTypeObj = (
    availableDefectType: string[],
    masterDataDefectType: DefectType[]
  ): DefectType[] => {
    return masterDataDefectType.filter((item) =>
      availableDefectType.includes(item.value)
    );
  };

  // const [data, setData] = useState<DataRow[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  // const [isAddRowModalVisible, setIsAddRowModalVisible] = useState(false);
  const [filteredTableEditDropDownData, setFilteredTableEditDropDownData] =
    useState<SettingDefectModeTableEditResult>(defaultTableEditDropDownData);
  const [editForm, setEditForm] =
    useState<SettingDefectModeTableEditSaveRequest>(defalutEditForm);

  const startEdit = async (key: number, record: SettingTableResult) => {
    // do not let user edit blank item
    if (record.id === 0 && record.line_name === "") {
      return;
    }

    setEditingId(key);
    setEditForm({
      id: 0, // need to replace this with actual id in db
      line_name: record.line_name,
      part_no: record.part_no,
      part_name: record.part_name,
      process: record.process,
      defect_type: record.defect_type,
      defect_mode: record.defect_mode,
      category: record.category,
      creator: username,
    });

    // fetch dropdown data
    try {
      const response = await settingDefectModeTableEditView({
        line_name: record.line_name,
        part_no: record.part_no,
        part_name: record.part_name,
        process: record.process,
        defect_type: record.defect_type,
        defect_mode: record.defect_mode,
        id_table: record.id,
      });
      // console.log("Updated data:", response.setting_table_edit_result);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        settableEditDropDownData(response.setting_table_edit_result[0]);

        // replace id with actual id in db
        setEditForm((previous) => ({
          ...previous,
          id: response.setting_table_edit_result[0].id,
        }));
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }

    // fetch filtered dropdown if line_name is not empty
    if (record.line_name) {
      await fetchFilteredTableEditDropDownData(record.line_name, "", "");
    }
  };

  const saveEdit = async (key: number) => {
    const editedRow = defectModesDataSource.find((row) => row.id === key);

    if (editedRow === null) {
      return;
    }

    const requestBody = toSettingDefectModeTableEditSaveReqBody(
      editForm!!!,
      username
    );

    try {
      const response = await settingDefectModeTableEditSave(requestBody);
      // console.log("Updated data:", response.setting_table_edit_save);

      setEditingId(null);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        await delay(200);
        await triggerUpdateTableData();
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }
  };

  const deleteRow = async (key: number | null) => {
    const deletedItem = defectModesDataSource.find((item) => item.id === key);

    if (!deletedItem) {
      return;
    }

    try {
      const response = await settingDefectModeTableDelete({
        id: deletedItem.id,
        line_name: deletedItem.line_name,
        part_no: deletedItem.part_no,
        part_name: deletedItem.part_name,
        process: deletedItem.process,
        defect_type: deletedItem.defect_type,
        defect_mode: deletedItem.defect_mode,
      });

      // update data in table if deletion success
      if (response !== null) {
        // Update the table data
        await triggerUpdateTableData();
      }
    } catch (error) {
      console.error("Error delete:", error);
    }
  };

  const fetchFilteredTableEditDropDownData = async (
    line_name: string,
    part_no: string,
    part_name: string
  ): Promise<SettingDefectModeTableEditResult[]> => {
    // fetch dropdown data
    try {
      const response = await settingDefectModeTableEditViewLineNameChange({
        line_name: line_name,
        part_no: part_no,
        part_name: part_name,
      });
      // console.log("Updated data:", response.setting_table_edit_result);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        setFilteredTableEditDropDownData(response.setting_table_edit_result[0]);
        return response.setting_table_edit_result;
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }
    return [];
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    // <div style={{ position: "relative" }}>
    <div>
      {isReIndexDefectMode ? (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext
            items={sortedData.map((item: any) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              columns={column}
              dataSource={sortedData}
              // rowKey={(record: any) => record.master_defect_index}
              rowKey="id"
              components={{ body: { row: Row } }}
              pagination={false}
            />
          </SortableContext>
        </DndContext>
      ) : (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext
            items={sortedData.map((item: any) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              columns={column}
              dataSource={sortedData}
              // rowKey={(record: any) => record.master_defect_index}
              rowKey="id"
              components={{ body: { row: Row } }}
            />
          </SortableContext>
        </DndContext>
      )}
    </div>
    // </div>
  );
};
const MasterTypeSubPartTable: React.FC<MasterTypeSubPartTableProps> = ({
  subPartDataSource,
  groups,
  triggerUpdateTableData,
  username,
}) => {
  const column: SubPartColumnType[] = [
    {
      title: <div style={{ textAlign: "center" }}>Line Name</div>,
      dataIndex: "line_name",
      filters: toFilterListNoEmpty(
        subPartDataSource.map((item) => item.line_name)
      ),
      // filters: [{ text: "Line Name", value: "Line Name" }],
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.line_name.includes(value as string),
      // render: (text, record) => {
      //   if (record === null) {
      //     return text || "-";
      //   }
      //   // tableEditDropDownData

      //   return editingId === record!!!.id ? (
      //     <DropdownEdit
      //       // disabled
      //       value={{
      //         label: editForm?.line_name || "",
      //         value: editForm?.line_name || "",
      //       }}
      //       handleChange={async (value: {
      //         value: string | number | null;
      //         label: string;
      //       }) => {
      //         const data = await fetchFilteredTableEditDropDownData(
      //           value.value as string, // line_name
      //           "",
      //           "",
      //           "",
      //           ""
      //         );
      //         // console.log("await fetchFilteredTable pn t:", data[0].parts);

      //         // get line_name to set form
      //         const selectedLineName = String(value.value ?? "");

      //         // get first part_no in request to set form
      //         const selectedPartNo = data[0].parts[0].part_no;

      //         // get part_name to set form
      //         const selectedPartName =
      //           data[0].parts.find((item) => item.part_no === selectedPartNo)
      //             ?.part_name || "";

      //         setEditForm((prevForm) => ({
      //           ...prevForm,
      //           line_name: selectedLineName,
      //           part_no: selectedPartNo,
      //           part_name: selectedPartName,
      //         }));
      //       }}
      //       options={tableEditDropDownData.line_name.map((lineName) => ({
      //         value: lineName,
      //         label: lineName,
      //       }))}
      //       placeholder={""}
      //     />
      //   ) : (
      //     text || "-"
      //   );
      // },
    },
    {
      title: <div style={{ textAlign: "center" }}>Process</div>,
      dataIndex: "process",
      // filters: [{ text: "Inline", value: "Inline" }],
      filters: toFilterListNoEmpty(
        subPartDataSource.map((item) => item.process)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.process.includes(value as string),
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            value={{ label: editForm.process, value: editForm.process }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                process: String(value.value ?? ""),
              }));
            }}
            options={
              filteredTableEditDropDownData.process?.map((process) => ({
                value: process,
                label: process,
              })) ??
              processType.map(({ value }) => ({
                value: value,
                label: value,
              }))
            }
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Part No</div>,
      dataIndex: "part_no",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        subPartDataSource.map((item) => item.part_no)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.part_no.includes(value as string),
      // render: (text, record) => {
      //   if (record === null) {
      //     return text || "-";
      //   }

      //   return editingId === record!!!.id ? (
      //     <DropdownEdit
      //       value={{ label: editForm.part_no, value: editForm.part_no }}
      //       handleChange={(value: {
      //         value: string | number | null;
      //         label: string;
      //       }) => {
      //         const selectedPartNo = String(value.value ?? "");

      //         // set part_name
      //         const partName =
      //           filteredTableEditDropDownData.parts.find(
      //             (item) => item.part_no === selectedPartNo
      //           )?.part_name || "";

      //         // console.log(
      //         //   "tartget update part_no data :",
      //         //   filteredTableEditDropDownData.parts
      //         // );
      //         // console.log("tartget update select part no: ", selectedPartNo);
      //         // console.log("tartget update select part name: ", partName);

      //         setEditForm((prevForm) => ({
      //           ...prevForm,
      //           part_no: String(value.value ?? ""),
      //           part_name: partName,
      //         }));
      //       }}
      //       options={filteredTableEditDropDownData.parts.map((item) => ({
      //         value: item.part_no,
      //         label: item.part_no,
      //       }))}
      //       placeholder={""}
      //     />
      //   ) : (
      //     text || "-"
      //   );
      // }, // readonly [0].part_no
    },
    {
      title: <div style={{ textAlign: "center" }}>Part Name</div>,
      dataIndex: "part_name",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        subPartDataSource.map((item) => item.part_name)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.part_name.includes(value as string),
      // render: (text, record) => {
      //   if (record === null) {
      //     return text || "-";
      //   }

      //   return editingId === record!!!.id ? (
      //     <Input value={editForm.part_name} readOnly />
      //   ) : (
      //     text || "-"
      //   );
      // }, // dropdown [0].part_name
    },
    {
      title: <div style={{ textAlign: "center" }}>Sub line</div>,
      dataIndex: "sub_line",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        subPartDataSource.map((item) => item.sub_line)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.sub_line.includes(value as string),
      render: (text, record) => {
        return <>{record?.sub_line_label}</>;
      },
      // render: (text, record) => {
      //   if (record === null) {
      //     return text || "-";
      //   }

      //   return editingId === record!!!.id ? (
      //     <DropdownEdit
      //       value={{ label: editForm.sub_line, value: editForm.sub_line }}
      //       handleChange={(value: {
      //         value: string | number | null;
      //         label: string;
      //       }) => {
      //         setEditForm((prevForm) => ({
      //           ...prevForm,
      //           sub_line: String(value.value ?? ""),
      //           month_year: "",
      //         }));
      //       }}
      //       //!
      //       options={[].map(({ value }) => ({
      //         value: value,
      //         label: value,
      //       }))}
      //       placeholder={""}
      //     />
      //   ) : (
      //     text || "-"
      //   );
      // }, // readonly [0].part_no
    },
    // targetType
    {
      title: <div style={{ textAlign: "center" }}>Sub Part No.</div>,
      dataIndex: "sub_part_no",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        subPartDataSource.map((item) => item.sub_part_no)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.sub_part_no === (value as string),
      // render: (text, record) => {
      //   return text;
      // },
      // render: (text, record) => {
      //   if (record === null) {
      //     return text || "-";
      //   }

      //   return editingId === record!!!.id ? (
      //     <Input
      //       value={editForm.sub_part_no}
      //       onChange={(e) => {
      //         setEditForm((prevForm) => ({
      //           ...prevForm,
      //           sub_part_no: String(e.target.value ?? ""),
      //         }));
      //       }}
      //     />
      //   ) : (
      //     text || "-"
      //   );
      // },
    },
    {
      title: <div style={{ textAlign: "center" }}>Sub Part Name</div>,
      dataIndex: "sub_part_name",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        subPartDataSource.map((item) => item.sub_part_name)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.sub_part_name === (value as string),
      // render: (text, record) => {
      //   return text;
      // },
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <Input
            value={editForm.sub_part_name}
            onChange={(e) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                sub_part_name: String(e.target.value ?? ""),
              }));
            }}
          />
        ) : (
          text || "-"
        );
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Supplier</div>,
      dataIndex: "supplier",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        subPartDataSource.map((item) => item.supplier)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value, record) => record.supplier === (value as string),
      // render: (text, record) => {
      //   return text;
      // },
      render: (text, record) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <Input
            value={editForm.supplier}
            onChange={(e) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                supplier: String(e.target.value ?? ""),
              }));
            }}
          />
        ) : (
          text || "-"
        );
      },
    },
    // {
    //   title: <div style={{ textAlign: "center" }}>Unit Consumption</div>,
    //   dataIndex: "unit_consumption",
    //   // filters: [{ text: " ", value: " " }],
    //   filters: toNumberFilterListNoEmpty(
    //     subPartDataSource.map((item) => item.unit_consumption)
    //   ),
    //   filterMode: "menu",
    //   filterSearch: true,
    //   onFilter: (value, record) => record.unit_consumption === value,
    //   render: (text, record) => {
    //     if (record === null) {
    //       return text || "-";
    //     }

    //     return editingId === record!!!.id ? (
    //       <InputNumber
    //         defaultValue={text} // Initial value
    //         style={{ width: "100%" }}
    //         onChange={(value) => {
    //           setEditForm((prevForm) => ({
    //             ...prevForm,
    //             target_control: typeof value === "number" ? value : 0,
    //           }));
    //         }}
    //         step={0.01} // Allows both integers and floating-point numbers
    //         placeholder="Enter a number"
    //       />
    //     ) : (
    //       text || "-"
    //     );
    //   }, // input field
    // },
    {
      title: <div style={{ textAlign: "center" }}>Action</div>,
      dataIndex: "",
      render: (text, record) => {
        // do not let user edit blank item
        if (record === null || (record?.id === 0 && record.line_name === "")) {
          return <Space></Space>;
        }

        return editingId === record?.id ? (
          <Space>
            <Button type="link" onClick={() => saveEdit(record.id)}>
              Save
            </Button>
            <Button type="link" onClick={() => cancelEdit()}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Space>
            <FaEdit
              onClick={() => startEdit(record!!!.id, record!!!)}
              style={{
                cursor: "pointer",
                width: "20px",
                height: "20px",
                color: "#1976D2",
              }}
            />

            <CustomPopover
              title=""
              triggerElement={
                <MdDelete
                  // onClick={() => deleteRow(record!!!.id)}
                  style={{
                    cursor: "pointer",
                    width: "20px",
                    height: "20px",
                    color: "#1976D2",
                  }}
                />
              } // Trigger element
              popoverContent={(closePopover) => (
                // Popover content
                <Flex vertical>
                  <Flex>
                    <Image
                      src={alertDelete}
                      alt="alertDelete"
                      priority
                      width={20}
                    />
                    <p style={{ marginLeft: "3px", marginBottom: "15px" }}>
                      Sure to delete?
                    </p>
                  </Flex>

                  <Flex>
                    <Button
                      style={{ marginRight: "5px" }}
                      type="primary"
                      onClick={() => deleteRow(record!!!.id)}
                    >
                      Ok
                    </Button>
                    <Button type="default" danger onClick={closePopover}>
                      Cancel
                    </Button>
                  </Flex>
                </Flex>
              )}
            />
          </Space>
        );
      },
    },
  ];

  const defaultTableEditDropDownData = {
    id: 0,
    group_name: [],
    line_name: [],
    process: [],
    // part_no: [],
    // part_name: "",
    parts: [],
    target_type: "",
    month_year: "",
    target_control: 0,
  };
  const defaultSubPartTableEditDropDownData = {
    id: 0,
    group_name: [],
    line_name: [],
    process: [],
    // part_no: [],
    // part_name: "",
    parts: [],
    sub_part_no: "",
    sub_part_name: "",
    unit_consumption: 0,
  };
  const defalutEditForm = {
    id: 0,
    group_name: "",
    line_name: "",
    part_no: "",
    part_name: "",
    process: "",
    sub_line: "",
    sub_part_no: "",
    sub_part_name: "",
    supplier: "",
    unit_consumption: 0,
    creator: "",
  };

  const [editingId, setEditingId] = useState<number | null>(null);

  const [tableEditDropDownData, settableEditDropDownData] =
    useState<SettingSubPartTableEditViewResult>(
      defaultSubPartTableEditDropDownData
    );
  const [filteredTableEditDropDownData, setFilteredTableEditDropDownData] =
    useState<SettingSubPartTableLineNameChangeEditResult>(
      defaultSubPartTableEditDropDownData
    );
  const [editForm, setEditForm] =
    useState<SubPartTargetTableEditSaveRequest>(defalutEditForm);

  const startEdit = async (key: number, record: SubPartTableViewResult) => {
    // do not let user edit blank item
    if (record.id === 0 && record.line_name === "") {
      return;
    }
    // console.log("record:", record);
    setEditingId(key);
    setEditForm({
      id: 0, // need to replacy this with actual id in db
      line_name: record.line_name,
      part_no: record.part_no,
      part_name: record.part_name,
      sub_line: record.sub_line,
      process: record.process,
      creator: username,

      group_name: record.group_name,
      sub_part_no: record.sub_part_no,
      sub_part_name: record.sub_part_name,
      supplier: record.supplier,
      unit_consumption: record.unit_consumption | 1,
      // target_control: record.target_control,
    });

    // fetch dropdown data
    try {
      const response = await settingSubPartTableEditView({
        line_name: record.line_name,
        part_no: record.part_no,
        part_name: record.part_name,
        sub_line: record.sub_line,
        process: record.process,
        id: record.id,
        group_name: record.group_name,
        sub_part_no: record.sub_part_no,
        sub_part_name: record.sub_part_name,
        unit_consumption: record.unit_consumption | 1,
        // target_control: record.target_control,
      });
      // console.log("Updated data:", response.setting_table_edit_result);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        settableEditDropDownData(response.sub_part_table_edit_result[0]);
        // update id to actual id in db
        setEditForm((previous) => ({
          ...previous,
          id: response.sub_part_table_edit_result[0].id,
        }));
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }

    // fetch filtered dropdown if line_name is not empty
    if (record.line_name) {
      await fetchFilteredTableEditDropDownData(
        record.line_name,
        record.part_no,
        record.part_name,
        record.sub_line,
        record.group_name
      );
    }
  };

  const saveEdit = async (key: number) => {
    const editedRow = subPartDataSource.find((row) => row.id === key);

    if (editedRow === null) {
      return;
    }
    const hasValue = [
      editForm.id,
      editForm.line_name,
      editForm.part_no,
      editForm.part_name,
      editForm.process,
      editForm.sub_line,
      editForm.group_name,
      editForm.sub_part_no,
      editForm.sub_part_name,
      editForm.supplier,
      editForm.unit_consumption,
      // editForm.target_control,
    ].some((field) => {
      if (typeof field === "string") {
        return field.trim() !== "";
      }
      return field !== null && field !== undefined;
    });

    if (!hasValue) {
      alert("กรุณากรอกข้อมูลก่อนบันทึก");
      return;
    }

    try {
      const response = await settingSubPartTableEditSave({
        id: editForm.id,
        line_name: editForm.line_name,
        part_no: editForm.part_no,
        part_name: editForm.part_name,
        process: editForm.process,
        sub_line: editForm.sub_line,
        creator: username,
        group_name: editForm.group_name,
        sub_part_no: editForm.sub_part_no,
        sub_part_name: editForm.sub_part_name,
        supplier: editForm.supplier,
        unit_consumption: editForm.unit_consumption | 1,
        // target_control: editForm.target_control,
      });
      // console.log("Updated data:", response.setting_table_edit_save);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        await delay(200);
        await triggerUpdateTableData();
      }

      setEditingId(null);
    } catch (error) {
      console.error("Error saving edits:", error);
    }
  };

  const deleteRow = async (key: number | null) => {
    const deletedItem = subPartDataSource.find((item) => item.id === key);

    if (!deletedItem) {
      return;
    }

    const hasData = [
      deletedItem.line_name,
      deletedItem.part_no,
      deletedItem.part_name,
      deletedItem.process,
      deletedItem.sub_line,
      deletedItem.group_name,
      deletedItem.sub_part_no,
      deletedItem.sub_part_name,
      deletedItem.unit_consumption,
      // deletedItem.target_control,
    ].some((field) => {
      if (typeof field === "string") {
        return field.trim() !== "";
      }
      return field !== null && field !== undefined;
    });

    if (!hasData) {
      alert("ไม่สามารถลบแถวที่ไม่มีข้อมูลได้");
      return;
    }

    try {
      const response = await settingSubPartTableDelete({
        id: deletedItem.id,
        line_name: deletedItem.line_name,
        part_no: deletedItem.part_no,
        part_name: deletedItem.part_name,
        process: deletedItem.process,
        sub_line: deletedItem.sub_line,
        group_name: deletedItem.group_name,
        sub_part_no: deletedItem.sub_part_no,
        sub_part_name: deletedItem.sub_part_name,
        unit_consumption: deletedItem.unit_consumption | 1,
        // target_control: deletedItem.target_control,
      });

      // update data in table if deletion success
      if (response !== null) {
        // Update the table data
        await triggerUpdateTableData();
      }
    } catch (error) {
      console.error("Error delete:", error);
    }
  };

  const fetchFilteredTableEditDropDownData = async (
    line_name: string,
    part_no: string,
    part_name: string,
    sub_line: string,
    group_name: string
  ): Promise<SettingSubPartTableLineNameChangeEditResult[]> => {
    // fetch dropdown data
    try {
      const response = await settingSubPartTableEditViewLineNameChange({
        line_name: line_name,
        part_no: part_no,
        part_name: part_name,
        sub_line: sub_line,
        group_name: group_name,
      });

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        setFilteredTableEditDropDownData(
          response.sub_part_table_edit_result[0]
        );
        return response.sub_part_table_edit_result;
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }
    return [];
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <Table
      columns={column}
      dataSource={subPartDataSource}
      rowKey={(record) => record.id}
      // pagination={true}
    />
  );
};
export {
  MasterTypeOrganizationalTargetTable,
  MasterTypeDefectModeTable,
  MasterTypeLineTargetTable,
  MasterTypeSubPartTable,
};
