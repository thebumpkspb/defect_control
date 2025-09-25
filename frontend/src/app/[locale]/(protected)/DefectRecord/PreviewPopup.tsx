"use client";

import React, { Key, useEffect, useState } from "react";
import {
  Modal,
  Button,
  Table,
  Input,
  Typography,
  Row,
  Col,
  Space,
  Form,
  DatePicker,
  Radio,
  Select,
  Flex,
  Pagination,
  TablePaginationConfig,
  RadioChangeEvent,
  Tag,
  Collapse,
} from "antd";
const { Panel } = Collapse;
// const { Option } = Select
// const { TextArea } = Input
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  pChartAbnormalOccurrenceView,
  pChartAbnormalOccurrenceEditSave,
  pChartAbnormalOccurrenceDelete,
  pChartAbnormalOccurrenceAddRowOk,
  pChartAbnormalOccurrenceAddRowView,
  pChartAbnormalOccurrenceViewNoErr,
  fetchDefectModes,
} from "@/lib/api";
import "./PreviewPopup.css";
import {
  PChartPreviewPopupAddRowFormData,
  PChartPreviewPopupInput,
} from "@/types/pChart";
import {
  AbnormalOccurrenceEditSaveRequest,
  PChartAbnormalOccurrence,
  PChartAbnormalOccurrenceAddRowOkRequest,
  PChartAbnormalOccurrenceAddRowView,
  PChartAbnormalOccurrenceDeleteRequest,
  PChartAbnormalOccurrenceEditSaveRequest,
} from "@/types/pChartApi";
import dayjs, { Dayjs } from "dayjs";
import CustomPopover from "@/components/button/custom-popover";
import {
  detectBy,
  newOrReoccur,
  rankList,
  shiftAbnormalList,
  rootCauseProcess,
} from "@/master_data/masterdata";
import DropdownEdit from "@/components/button/dropdown-edit";
import Image from "next/image";

import alertDelete from "@/assets/alert-delete.svg";

const { Title, Text } = Typography;
const { Option } = Select;
import { AlignType, FixedType } from "rc-table/lib/interface";
import { isNotEmptyValue } from "@/functions";
import { categories, pics } from "@/constants";
import { LayoutStore } from "@/store";
import { SettingTableResult } from "@/types/settingApi";
// import Panel from "antd/es/cascader/Panel";

// Define the row type
interface DataRow {
  id: number;
  key: string;
  no: string;
  date: string;
  shift: string;
  partNo: string;
  defect_item: any;
  category: string[];
  trouble: string;
  action: string;
  inCharge: string;
  manager: string;
  detectBy: string;
  defectDetails: string;
  rank: string;
  rootCauseProcess: string;
  processNameOrSupplierName: string;
  cause: string;
  newOrReoccur: string;
}

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

// Define the mapping function

const padData = (data: DataRow[]): DataRow[] => {
  const rowsToAdd = 10 - (data.length % 10);
  const paddedData: DataRow[] = [
    ...data,
    ...Array.from({ length: rowsToAdd }, (_, index) => ({
      id: 0,
      key: `blank-${index}`,
      no: "",
      date: "",
      shift: "",
      partNo: "",
      defect_item: [],
      category: [],
      trouble: "",
      action: "",
      inCharge: "",
      manager: "",
      detectBy: "",
      defectDetails: "",
      rank: "",
      rootCauseProcess: "",
      processNameOrSupplierName: "",
      cause: "",
      newOrReoccur: "",
    })),
  ];

  return paddedData;
};

const EditSaveRequestDefault = {
  month: "",
  line_name: "",
  part_no: "",
  shift: "",
  process: "",
  sub_line: "",
  defect_item: [],
  category: [],
  no: 0,
  date: "",
  trouble: "",
  action: "",
  in_change: "",
  manager: "",
  detect_by: "",
  defect_detail: "",
  rank: "",
  root_cause_process: "",
  process_name_supplier_name: "",
  cause: "",
  new_re_occur: "",
  id: 0,
  creator: "",
};

interface PreviewPopupProps {
  visible: boolean;
  onClose: () => void;
  input: PChartPreviewPopupInput;
  shift?: string;
  username: string;
  date?: Dayjs | null;
  // pChartRecordTableSelectedDefectMode: string;
}

const PreviewPopup: React.FC<PreviewPopupProps> = ({
  visible,
  onClose,
  input,
  shift,
  username,
  date,
  // pChartRecordTableSelectedDefectMode,
}) => {
  const fetchAbnormalOccurenceViewNoErr = async (
    input: PChartPreviewPopupInput
  ) => {
    // { "month": "November-2024", "line_name": "414454 - Sta. Assy : PA70 Type", "part_no": "TG428000-0630", "shift": "B", "process": "Inline" }

    try {
      const response = await pChartAbnormalOccurrenceViewNoErr({
        month: input.month,
        line_name: input.line_name,
        part_no: input.part_no,
        shift: shift || input.shift,
        process: input.process,
        sub_line: input.sub_line,
      });
      // console.log(
      //   "abnomal occurrence view:",
      //   response.abnormal_occurrence_view_result
      // );

      // const dataTest = generateFakeData(33);
      // setData(padData(dataTest));
      setData(
        padData(
          mapPChartToDataRow(
            response.abnormal_occurrence_view_result
            // defectModes
          )
        )
      );
    } catch (error) {
      setData(
        padData(
          mapPChartToDataRow(
            []
            //  defectModes
          )
        )
      );
      console.error("Error fetching abnomal occurrence view:", error);
    }
  };
  const { setIsLoading } = LayoutStore.getState();
  const [data, setData] = useState<DataRow[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAddRowModalVisible, setIsAddRowModalVisible] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [editForm, setEditForm] = useState<AbnormalOccurrenceEditSaveRequest>(
    EditSaveRequestDefault
  );
  const [defectModes, setDefectModes] = useState<SettingTableResult[]>([]);
  const mapPChartToDataRow = (
    pChartData: PChartAbnormalOccurrence[]
    // defectModes: SettingTableResult[]
  ): DataRow[] => {
    // console.log("pChartData:", pChartData);
    return pChartData.map((item) => {
      // console.log(
      //   "testjajaa:",
      //   defectModes
      //     .filter((defect) => item.defect_item.includes(defect.id))
      //     .map((defect) => defect.defect_mode)
      // );
      return {
        id: item.id,
        key: item.id.toString(),
        no: item.no.toString(),
        date: item.date,
        shift: item.shift,
        partNo: item.part_no,
        // defect_item: item.defect_item,
        defect_item: defectModes?.filter((defect) =>
          item?.defect_item?.includes(defect.id)
        ),
        // ?.map((defect) => `[${defect?.defect_type}] ${defect?.defect_mode}`),
        category: item.category,
        trouble: item.trouble,
        action: item.action,
        inCharge: item.in_change,
        manager: item.manager,
        detectBy: item.detect_by,
        defectDetails: item.defect_detail,
        rank: item.rank,
        rootCauseProcess: item.root_cause_process,
        processNameOrSupplierName: item.process_name_supplier_name,
        cause: item.cause,
        newOrReoccur: item.new_re_occur,
      };
    });
  };
  // console.log("defectModes:", defectModes);
  useEffect(() => {
    const updateDefectModesTable = async () => {
      // console.log("testja");
      if (!input.line_name || !input.part_no) return; // ตรวจสอบค่า
      setIsLoading(true);
      try {
        const data = await fetchDefectModes({
          line_name: input.line_name,
          part_no: input.part_no,
          part_name: "",
        });
        setDefectModes(data.setting_table_result);

        console.log("updateDefectModesTable() called");
      } catch (error) {
        console.error("Failed to update table:", error);
      }
      setIsLoading(false);
    };
    updateDefectModesTable();
    // fetchDefectModes;
  }, [input.line_name, input.part_no]);
  // console.log("editForm:", editForm);
  // console.log(
  //   "editForm.defect_item.map((defect: any) => defect.id):",
  //   editForm.defect_item.map((defect: any) => defect.id)
  // );
  const columns: any = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 60,
      render: (text: string | boolean, record: DataRow) => (
        <div style={{ width: "100%" }}>
          <div style={{ textAlign: "left" }}>{text}</div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 150,
      filters: toFilterListNoEmpty(data.map((item) => item.date)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.date === value,
      render: (text: string, record: DataRow) => (
        <div style={{ width: "100%" }}>
          <div style={{ textAlign: "left" }}>{text}</div>
        </div>
      ),
    },
    {
      title: "Shift",
      dataIndex: "shift",
      key: "shift",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 80,
      filters: toFilterListNoEmpty(data.map((item) => item.shift)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.shift === value,
      render: (text: string, record: DataRow) => (
        <div style={{ width: "100%" }}>
          <div style={{ textAlign: "left" }}>{text}</div>
        </div>
      ),
    },
    {
      title: "Part No",
      dataIndex: "partNo",
      key: "partNo",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 180,
      filters: toFilterListNoEmpty(data.map((item) => item.partNo)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.partNo === value,
      render: (text: string, record: DataRow) => (
        <div style={{ width: "100%" }}>
          <div style={{ textAlign: "left" }}>{text}</div>
        </div>
      ),
    },
    {
      title: "Trouble",
      dataIndex: "trouble",
      key: "trouble",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.trouble)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.trouble === value,
      render: (text: string, record: DataRow) =>
        isEditing === record.key ? (
          <Input
            defaultValue={text}
            onChange={(e) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                trouble: e.target.value,
              }));
            }}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center" as AlignType,
      width: 400,
      filters: toFilterListNoEmpty(data.map((item) => item.action)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.action === value,
      render: (text: string, record: DataRow) =>
        isEditing === record.key ? (
          <Input
            value={editForm.action}
            onChange={(e) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                action: e.target.value,
              }));
            }}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "Defect item",
      dataIndex: "defect_item",
      key: "defect_item",
      // align: "center" as AlignType,
      width: 300,
      // filters: toFilterListNoEmpty(data.map((item) => item.action)),
      filters: toFilterListNoEmpty(
        Array.from(
          new Set(
            data.flatMap((item: any) =>
              item.defect_item.map(
                (i: any) => `[${i.defect_type}] ${i.defect_mode}`
              )
            )
          )
        )
      ),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean | any, record: DataRow) =>
        // record.action === value,
        record?.defect_item?.some((defect: any) =>
          value.includes(`[${defect.defect_type}] ${defect.defect_mode}`)
        ),
      render: (defects: any, record: DataRow) =>
        isEditing === record.key ? (
          // <Input
          //   value={editForm.action}
          //   onChange={(e) => {
          //     setEditForm((prevForm) => ({
          //       ...prevForm,
          //       action: e.target.value,
          //     }));
          //   }}
          // />
          // <DropdownEdit
          //   value={{
          //     label: editForm.defect_item.map(
          //       (defect: any) => `[${defect.defect_type}] ${defect.defect_mode}`
          //     ),
          //     value: editForm.defect_item.map((defect: any) => defect.id),
          //   }}
          //   handleChange={(value: {
          //     value: string | number | null;
          //     label: string | number[];
          //   }) => {
          //     setEditForm((prevForm) => ({
          //       ...prevForm,
          //       defect_item: value.value ?? [],
          //     }));
          //   }}

          //   // options={
          //   //   filteredTableEditDropDownData.defect_mode?.map((defect_mode) => ({
          //   //     value: defect_mode,
          //   //     label: defect_mode,
          //   //   })) ??
          //   //   defectType.map(({ value }) => ({
          //   //     value: value,
          //   //     label: value,
          //   //   }))
          //   // }
          //   options={defectModes.map((item) => ({
          //     value: item.id,
          //     label: `[${item.defect_type}] ${item.defect_mode}`,
          //   }))}
          //   placeholder={""}
          // />
          <Select
            value={
              // label: editForm.defect_item.map(
              //   (defect: any) => `[${defect.defect_type}] ${defect.defect_mode}`
              // ),
              // value:
              editForm.defect_item
            }
            placeholder=""
            // style={{
            //   border: "none",
            //   flex: 1,
            //   // height: "32px",
            //   color: "black",
            // }}
            mode="multiple"
            options={defectModes.map((item) => ({
              value: item.id,
              label: `[${item.defect_type}] ${item.defect_mode}`,
            }))}
            onChange={(value: {
              value: string | number | null;
              label: string | number[];
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                defect_item: value ?? [],
              }));
            }}
            style={{
              border: "none",
              width: "100%",
              // height: "32px",
              color: "black",
              flex: 1,
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        ) : (
          <div className="tagRow">
            {defects?.map((defect: any) => {
              if (defect.defect_type && defect.defect_mode) {
                return (
                  <Tag key={`[${defect.defect_type}] ${defect.defect_mode}`}>
                    {`[${defect.defect_type}] ${defect.defect_mode}`}
                  </Tag>
                );
              }
            })}
          </div>
        ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      // align: "center" as AlignType,
      width: 120,
      // filters: toFilterListNoEmpty(data.map((item) => item.category)),
      filters: toFilterListNoEmpty(categories),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean | any, record: DataRow) =>
        // record.action === value,
        record?.category?.some((cat) => value.includes(cat)),
      render: (tags: any, record: DataRow) =>
        isEditing === record.key ? (
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
        if (isEditing !== record.key) {
          return {
            style: {
              padding: "5px",
            },
          };
        }
      },
    },
    {
      title: "In charge",
      dataIndex: "inCharge",
      key: "inCharge",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item: any) => item.inCharge)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.inCharge === value,
      render: (text: string, record: DataRow) =>
        isEditing === record.key ? (
          <Input
            value={editForm.in_change}
            onChange={(e) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                in_change: e.target.value,
              }));
            }}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item: any) => item.manager)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.manager === value,
      render: (text: string, record: DataRow) =>
        isEditing === record.key ? (
          <Input
            value={editForm.manager}
            onChange={(e) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                manager: e.target.value,
              }));
            }}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "Action",
      key: "operation",
      align: "center" as AlignType,
      width: 100,
      render: (text: string, record: DataRow) => {
        if (record.key.startsWith("blank-")) {
          return <Space></Space>;
        }

        return isEditing === record.key ? (
          <Space>
            <Button type="link" onClick={() => saveEdit(record.key)}>
              Save
            </Button>
            <Button type="link" onClick={() => cancelEdit(record.key)}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Space>
            <EditOutlined
              onClick={() => startEdit(record.key, record)}
              style={{ cursor: "pointer" }}
            />

            <CustomPopover
              title=""
              triggerElement={
                <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
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
                      onClick={() => deleteRow(record.key)}
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
  const detailedColumns = [
    ...columns.slice(0, -1),
    {
      title: "Detect By",
      dataIndex: "detectBy",
      key: "detectBy",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item: any) => item.detectBy)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.detectBy === value,
      render: (text: string, record: DataRow) =>
        // isEditing === record.key ? <Input defaultValue={text} /> : text,
        isEditing === record.key ? (
          <DropdownEdit
            value={{ label: editForm.detect_by, value: editForm.detect_by }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              // const current_part_no = String(value.value);
              // const part_name = filteredTableEditDropDownData.parts.find(
              //   (item) => item.part_no === current_part_no
              // )?.part_name;

              setEditForm((prevForm) => ({
                ...prevForm,
                detect_by: String(value.value) || "",
              }));
            }}
            options={detectBy.map((item) => ({
              value: item.value,
              label: item.value,
            }))}
            placeholder={""}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "Defect Details",
      dataIndex: "defectDetails",
      key: "defectDetails",
      align: "center" as AlignType,
      width: 250,
      filters: toFilterListNoEmpty(data.map((item: any) => item.defectDetails)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.defectDetails === value,
      render: (text: string, record: DataRow) =>
        isEditing === record.key ? (
          <Input
            value={editForm.defect_detail}
            onChange={(e) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                defect_detail: e.target.value,
              }));
            }}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item: any) => item.rank)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.rank === value,
      render: (text: string, record: DataRow) =>
        // isEditing === record.key ? <Input defaultValue={text} /> : text,
        isEditing === record.key ? (
          <DropdownEdit
            value={{ label: editForm.rank, value: editForm.rank }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              // const current_part_no = String(value.value);
              // const part_name = filteredTableEditDropDownData.parts.find(
              //   (item) => item.part_no === current_part_no
              // )?.part_name;

              setEditForm((prevForm) => ({
                ...prevForm,
                rank: String(value.value) || "",
              }));
            }}
            options={rankList.map((item) => ({
              value: item.value,
              label: item.value,
            }))}
            placeholder={""}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "Root Cause Process",
      dataIndex: "rootCauseProcess",
      key: "rootCauseProcess",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(
        data.map((item: any) => item.rootCauseProcess)
      ),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.rootCauseProcess === value,
      render: (text: string, record: DataRow) =>
        // isEditing === record.key ? <Input defaultValue={text} /> : text,
        isEditing === record.key ? (
          <DropdownEdit
            value={{
              label: editForm.root_cause_process,
              value: editForm.root_cause_process,
            }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              // const current_part_no = String(value.value);
              // const part_name = filteredTableEditDropDownData.parts.find(
              //   (item) => item.part_no === current_part_no
              // )?.part_name;

              setEditForm((prevForm) => ({
                ...prevForm,
                root_cause_process: String(value.value) || "",
              }));
            }}
            options={rootCauseProcess.map((item) => ({
              value: item.value,
              label: item.value,
            }))}
            placeholder={""}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "Process Name/Supplier Name",
      dataIndex: "processNameOrSupplierName",
      key: "processNameOrSupplierName",
      align: "center" as AlignType,
      width: 300,
      filters: toFilterListNoEmpty(
        data.map((item: any) => item.processNameOrSupplierName)
      ),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.processNameOrSupplierName === value,
      render: (text: string, record: DataRow) =>
        // isEditing === record.key ? <Input defaultValue={text} /> : text,
        isEditing === record.key ? (
          <Input
            value={editForm.process_name_supplier_name}
            onChange={(e) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                process_name_supplier_name: e.target.value,
              }));
            }}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "Cause",
      dataIndex: "cause",
      key: "cause",
      align: "center" as AlignType,
      width: 400,
      filters: toFilterListNoEmpty(data.map((item: any) => item.cause)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.cause === value,
      render: (text: string, record: DataRow) =>
        // isEditing === record.key ? <Input defaultValue={text} /> : text,
        isEditing === record.key ? (
          <Input
            value={editForm.cause}
            onChange={(e) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                cause: e.target.value,
              }));
            }}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    {
      title: "New/Re-occur",
      dataIndex: "newOrReoccur",
      key: "newOrReoccur",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item: any) => item.newOrReoccur)),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean, record: DataRow) =>
        record.newOrReoccur === value,
      render: (text: string, record: DataRow) =>
        // isEditing === record.key ? <Input defaultValue={text} /> : text,
        isEditing === record.key ? (
          <DropdownEdit
            value={{
              label: editForm.new_re_occur,
              value: editForm.new_re_occur,
            }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              // const current_part_no = String(value.value);
              // const part_name = filteredTableEditDropDownData.parts.find(
              //   (item) => item.part_no === current_part_no
              // )?.part_name;

              setEditForm((prevForm) => ({
                ...prevForm,
                new_re_occur: String(value.value) || "",
              }));
            }}
            options={newOrReoccur.map((item) => ({
              value: item.value,
              label: item.value,
            }))}
            placeholder={""}
          />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "left" }}>{text}</div>
          </div>
        ),
    },
    columns[columns.length - 1],
  ];

  // fetch preview popup information
  useEffect(() => {
    if (!visible) {
      return;
    }

    fetchAbnormalOccurenceViewNoErr(input);
  }, [visible]);

  // const dataTest = data.concat(data, [data[-1]])

  // const generateFakeData = (count: number): DataRow[] => {
  //   return Array.from({ length: count }, (_, index) => ({
  //     id: index + 1,
  //     key: `key-${index + 1}`,
  //     no: `${index + 1}`,
  //     date: `2025-01-${String(index + 1).padStart(2, "0")}`, // Example date
  //     partNo: `P${String(index + 1).padStart(3, "0")}`,
  //     shift: `Shift ${index + 1}`,
  //     trouble: `Trouble ${index + 1}`,
  //     action: `Action ${index + 1}`,
  //     inCharge: `Person ${index + 1}`,
  //     manager: `Manager ${index + 1}`,
  //     detectBy: `Inspector ${index + 1}`,
  //     defectDetails: `Defect Details ${index + 1}`,
  //     rank: `Rank ${index + 1}`,
  //     rootCauseProcess: `Process ${index + 1}`,
  //     processNameOrSupplierName: `Supplier ${index + 1}`,
  //     cause: `Cause ${index + 1}`,
  //     newOrReoccur: index % 2 === 0 ? "New" : "Reoccur", // Alternate between "New" and "Reoccur"
  //   }));
  // };

  const transformToApiFormat = (
    data: DataRow
  ): PChartAbnormalOccurrenceEditSaveRequest => {
    return {
      month: input.month || "",
      line_name: input.line_name || "",
      part_no: input.part_no || "",
      shift: shift || input.shift || "",
      process: input.process || "",
      sub_line: input.sub_line || "",
      no: parseInt(data.no) || 0,
      date: data.date,
      trouble: data.trouble,
      action: data.action,
      in_change: data.inCharge,
      manager: data.manager,
      detect_by: data.detectBy,
      defect_detail: data.defectDetails,
      rank: data.rank,
      root_cause_process: data.rootCauseProcess,
      process_name_supplier_name: data.processNameOrSupplierName,
      cause: data.cause,
      new_re_occur: data.newOrReoccur,
      id: parseInt(data.key),
    };
  };

  const mapToDeleteReq = (
    data: DataRow
  ): PChartAbnormalOccurrenceDeleteRequest => {
    return {
      month: input.month || "",
      line_name: input.line_name || "",
      part_no: input.part_no || "",
      shift: shift || input.shift || "",
      process: input.process || "",
      sub_line: input.sub_line || "",
      id: data.id,
    };
  };

  const startEdit = (key: string, record: DataRow) => {
    // do not let user edit blank item
    // if (record.id === 0) {
    //   return;
    // }

    setIsEditing(key);
    // console.log("record.defect_item:", record.defect_item);
    setEditForm({
      month: input.month || "",
      line_name: input.line_name || "",
      part_no: input.part_no || "",
      shift: shift || input.shift || "",
      process: input.process || "",
      sub_line: input.sub_line || "",
      defect_item: record.defect_item.map((defect: any) => defect.id) || [],
      category: record.category || [],
      no: parseInt(record.no) || 0,
      date: record.date,
      trouble: record.trouble,
      action: record.action,
      in_change: record.inCharge,
      manager: record.manager,
      detect_by: record.detectBy,
      defect_detail: record.defectDetails,
      rank: record.rank,
      root_cause_process: record.rootCauseProcess,
      process_name_supplier_name: record.processNameOrSupplierName,
      cause: record.cause,
      new_re_occur: record.newOrReoccur,
      id: parseInt(record.key),
      creator: username,
    });
  };

  const cancelEdit = async (key: string) => {
    setIsEditing(null);
  };

  const saveEdit = async (key: string) => {
    const editedRow = data.find((row: any) => row.key === key);
    if (!editedRow) return;

    // const requestBody = transformToApiFormat(editedRow);
    const requestBody = editForm;

    try {
      const response = await pChartAbnormalOccurrenceEditSave(requestBody);
      // console.log("Updated data:", response.abnormal_occurrence_view_result);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        await fetchAbnormalOccurenceViewNoErr(input);
      }

      setIsEditing(null);
    } catch (error) {
      console.error("Error saving edits:", error);
    }
  };

  const deleteRow = async (key: string | null) => {
    const deletedItem = data.find((item: any) => item.key === key);

    if (!deletedItem) {
      return;
    }

    const reqBody = mapToDeleteReq(deletedItem);

    try {
      const response = await pChartAbnormalOccurrenceDelete(reqBody);

      // update data in table if deletion success
      if (response !== null) {
        // Update the table data

        await fetchAbnormalOccurenceViewNoErr(input);
      }
    } catch (error) {
      console.error("Error delete:", error);
    }
    // setData(data.filter((item) => item.key !== key));
  };

  const handleAddRowButton = () => {
    setIsAddRowModalVisible(true);
  };

  // const handleAddRowOk = async (values: PChartPreviewPopupAddRowFormData) => {
  //   const reqBody = mapToCreateReq(values);

  //   try {
  //     const response = await pChartAbnormalOccurrenceAddRowOk(reqBody);

  //     // update data in table if addition success
  //     if (response !== null) {
  //       // Update the table data
  //       await fetchAbnormalOccurenceView(input);
  //     }
  //   } catch (error) {
  //     console.error("Error delete:", error);
  //   }

  //   setIsAddRowModalVisible(false);
  // };

  return (
    <Modal
      title={null}
      open={visible}
      footer={null}
      onCancel={onClose}
      width={1200} // Increased width for a more spacious layout
      bodyStyle={{ paddingBottom: "40px" }} // Adds space at the bottom
    >
      <Row justify="space-between" align="middle">
        <Title level={3} style={{ color: "red", margin: 0 }}>
          Abnormal Occurrence & Action Record
        </Title>
      </Row>
      <Text>ลงบันทึกปัญหาหรือสิ่งผิดปกติและการแก้ไข</Text>
      <div style={{ margin: "10px 0" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRowButton}
        >
          Add a row
        </Button>

        <Button
          type="primary"
          style={{ marginLeft: "10px", float: "right" }}
          onClick={() => setIsDetailedView(!isDetailedView)}
        >
          {isDetailedView ? "See less" : "See more"}
        </Button>
      </div>

      <div>
        <Table
          dataSource={data}
          columns={isDetailedView ? detailedColumns : columns}
          pagination={{
            position: ["bottomRight"],
            pageSize: 10,
            total: data.length,
          }}
          rowClassName={() => "custom-row"}
          scroll={{ x: isDetailedView ? 2700 : 1300 }}
        />
      </div>

      <AddRowAbnormalPopup
        visible={isAddRowModalVisible}
        onClose={() => setIsAddRowModalVisible(false)}
        triggerUpdateTable={() => fetchAbnormalOccurenceViewNoErr(input)}
        input={input}
        shift={shift}
        defectModes={defectModes}
        username={username}
        date={date}

        // pChartRecordTableSelectedDefectMode={pChartRecordTableSelectedDefectMode}
      />
    </Modal>
  );
};

const getFormattedMonth = (datetime: string) =>
  datetime
    ? new Date(datetime)
        .toLocaleString("en-US", { month: "long", year: "numeric" })
        .replace(" ", "-")
    : "";

const addRowViewDefault = {
  month: "",
  line_name: "",
  part_no: "",
  shift: "",
  defect_item: [],
  category: [],
  process: "",
  sub_line: "",
  no: 0,
  date: "",
  trouble: "",
  action: "",
  in_change: "",
  manager: "",
  detect_by: "",
  defect_detail: "",
  rank: [],
  root_cause_process: "",
  process_name_supplier_name: "",
  cause: "",
  new_re_occur: "",
  id: 0,
};

const addRowOkFormDefault = {
  month: "",
  line_name: "",
  part_no: "",
  shift: "",
  defect_item: [],
  category: [],
  process: "",
  sub_line: "",
  date: "",
  trouble: "",
  action: "",
  in_change: "",
  manager: "",
  detect_by: "",
  defect_detail: "",
  rank: "",
  root_cause_process: "",
  process_name_supplier_name: "",
  cause: "",
  new_re_occur: "",
  creator: "",
  id: null,
};

interface AddRowAbnormalPopupProps {
  visible: boolean;
  onClose: () => void;
  triggerUpdateTable: () => Promise<void>;
  input: PChartPreviewPopupInput;
  shift?: string;
  defectModes: SettingTableResult[];
  username: string;
  date?: Dayjs | null;
}

const AddRowAbnormalPopup: React.FC<AddRowAbnormalPopupProps> = ({
  visible,
  onClose,
  triggerUpdateTable,
  input,
  shift,
  defectModes,
  username,
  date,
}) => {
  const handleOnCloseModal = () => {
    onClose();
  };

  const mapToCreateReq = (
    data: PChartPreviewPopupAddRowFormData,
    input: PChartPreviewPopupInput,
    username: string,
    shift?: string | null
  ): PChartAbnormalOccurrenceAddRowOkRequest => {
    // console.log("mapToCreateReq data:", data);
    // console.log("mapToCreateReq input:", input);
    // console.log("mapToCreateReq username:", username);

    const formattedMonth = data.date
      ? new Date(data.date)
          .toLocaleString("en-US", {
            month: "long",
            year: "numeric",
            timeZone: "Asia/Bangkok",
          })
          .replace(" ", "-")
      : "";

    const convertToBangkokTimeISO = (date: string) => {
      const bangkokDate = new Date(date).toLocaleString("en-CA", {
        timeZone: "Asia/Bangkok",
        hour12: false,
      }); // yyyy-MM-dd, HH:mm:ss
      const [datePart, timePart] = bangkokDate.split(", ");
      // return `${datePart}T${timePart}:00.000+07:00`;
      return `${datePart}`;
    };

    const formattedDate = data.date ? convertToBangkokTimeISO(data.date) : "";

    return {
      date: formattedDate || "", // [x] 2025-01-15T00:00:00:00.000+07:00
      // 2025-01-15
      trouble: data.trouble || "",
      action: data.action || "",
      in_change: data.inCharge || "",
      manager: data.manager || "",
      detect_by: data.detectBy || "",
      defect_detail: data.defectDetails || "",
      rank: data.rank || "",
      root_cause_process: data.rootCauseProcess || "",
      process_name_supplier_name: data.processNameOrSupplierName || "",
      cause: data.cause || "",
      new_re_occur: data.newOrReoccur || "",
      id: data.id || 0,
      month: formattedMonth,
      line_name: input.line_name || "",
      part_no: input.part_no || "",
      shift: data.shift || "",
      defect_item: data.defect_item || [],
      category: data.category || [],
      process: input.process || "",
      sub_line: input.sub_line || "",
      creator: username,
    };
  };

  const fetchAddRowView = async (
    input: PChartPreviewPopupInput,
    shift?: string | null
  ): Promise<PChartAbnormalOccurrenceAddRowView> => {
    try {
      const response = await pChartAbnormalOccurrenceAddRowView({
        month: input.line_name || "",
        line_name: input.line_name || "",
        part_no: input.part_no || "",
        shift: shift || input.shift || "",
        process: input.process || "",
        sub_line: input.sub_line || "",
      });

      // console.log("fetchAddRowView(): response:", response);

      setAddRowView(response.abnormal_occurrence_add_view_result[0]);
      return response.abnormal_occurrence_add_view_result[0];
    } catch (error) {
      console.error("Error Add Row View :", error);
    }
    return addRowViewDefault;
  };

  const handleAddRowOk = async (values: PChartPreviewPopupAddRowFormData) => {
    // console.log("values:", values);
    // validate input
    const missingFields = [];
    if (!values.date) missingFields.push("Date");
    if (!values.partNo) missingFields.push("Part No");
    if (!values.shift) missingFields.push("Shift");
    if (!values.trouble) missingFields.push("Trouble");
    if (!values.action) missingFields.push("Action");
    if (!values.inCharge) missingFields.push("In charge");
    if (!values.manager) missingFields.push("Manager");
    if (!values.defect_item) missingFields.push("defect_item");
    if (!values.category) missingFields.push("category");
    // if (!values.detectBy) missingFields.push("Detect By");
    // if (!values.defectDetails) missingFields.push("Defect details");
    // if (!values.rank) missingFields.push("Rank");
    // if (!values.rootCauseProcess) missingFields.push("Root cause process");
    // if (!values.processNameOrSupplierName)
    //   missingFields.push("Process name / Supplier name");
    // if (!values.cause) missingFields.push("Cause");
    // if (!values.newOrReoccur) missingFields.push("New / Re-occur");

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

    const reqBody = mapToCreateReq(values, input, username, shift);

    // Subtract 1 day from the date
    // disable this for now
    // reqBody.date = dayjs(reqBody.date).subtract(1, "day").format("YYYY-MM-DD");
    // reqBody.month = getFormattedMonth(reqBody.date);

    try {
      const response = await pChartAbnormalOccurrenceAddRowOk(reqBody);

      // update data in table if addition success
      if (response !== null) {
        // Update the table data
        // await fetchAbnormalOccurenceView(input);
        await triggerUpdateTable();
      }
    } catch (error) {
      console.error("Error add row:", error);
    }

    handleOnCloseModal();
  };

  const [form] = Form.useForm();
  const [addRowView, setAddRowView] =
    useState<PChartAbnormalOccurrenceAddRowView>(addRowViewDefault);
  const [createRowForm, setCreateRowForm] =
    useState<PChartAbnormalOccurrenceAddRowOkRequest>(addRowOkFormDefault);
  // const [shiftAddRow, setShiftAddRow] = useState<string | undefined | null>(
  //   shift
  // );
  // const handleSelectShift = (e: RadioChangeEvent) => {
  //   const selectedShift = e.target.value;
  //   setShiftAddRow(selectedShift);
  // };
  // trigger only when start modal
  useEffect(() => {
    if (!visible) {
      return;
    }

    console.log("on open preview pop up modal");

    fetchAddRowView(input, shift).then((res) => {
      // console.log("fetchAddRowView res:", res);
      let shift_set_value;
      const formattedMonth = res.date
        ? new Date(res.date)
            .toLocaleString("en-US", { month: "long", year: "numeric" })
            .replace(" ", "-")
        : "";

      //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      if ((shift || input.shift) == "All") {
        shift_set_value = undefined;
      } else {
        shift_set_value = shift || input.shift;
      }
      // setShiftAddRow(shift_set_value);
      // console.log("shift : ", shift);
      // console.log("shift_set_value : ", shift_set_value);
      // console.log(
      //   'dayjs(res.date).format("MMMM-YYYY"):',
      //   dayjs(res.date).format("MMMM-YYYY")
      // );
      // console.log("input.month:", input.month);
      const updatedValues = {
        date: res.date ? dayjs(res.date).format("YYYY-MM-DD") : "", // get date from api res
        trouble: res.trouble || "",
        action: res.action || "",
        in_change: res.in_change || "",
        manager: res.manager || "",
        detect_by: res.detect_by || "",
        defect_detail: res.defect_detail || "",
        // rank: res.rank.length > 1 ? res.rank[0] : "",
        rank: " ",
        root_cause_process: res.root_cause_process || "",
        process_name_supplier_name: res.process_name_supplier_name || "",
        cause: res.cause || "",
        new_re_occur: res.new_re_occur || "",
        id: res.id,
        month: formattedMonth,
        line_name: res.line_name || "",
        part_no: res.part_no || "",
        // part_no: input.part_no || "",
        shift: shift_set_value || "",
        defect_item: res.defect_item || [],
        category: res.category || [],
        process: res.process || "",
        sub_line: res.sub_line || "",
        creator: username,
      };

      setCreateRowForm(updatedValues);

      form.setFieldsValue({
        date:
          date ||
          (res.date && dayjs(res.date).format("MMMM-YYYY") == input.month
            ? dayjs(res.date)
            : null), // get date from api res
        trouble: res.trouble || "",
        action: res.action || "",
        inCharge: res.in_change || "",
        manager: res.manager || "",
        detectBy: res.detect_by || "",
        defectDetails: res.defect_detail || "",
        // rank: res.rank.length > 1 ? res.rank[0] : "",
        rank: " ",
        rootCauseProcess: res.root_cause_process || "",
        processNameOrSupplierName: res.process_name_supplier_name || "",
        cause: res.cause || "",
        newOrReoccur: res.new_re_occur || "",
        id: res.id,
        month: formattedMonth,
        line_name: res.line_name || "",
        partNo: res.part_no || "",
        // part_no: input.part_no || "",
        shift: shift_set_value || "",
        process: res.process || "",
        creator: username,

        // ...updatedValues,
        // part_no: res.part_no,
        // date: res.date ? dayjs(res.date) : null, // Use Dayjs for the form
      });
    });
  }, [visible, form, input, shift, username]);

  return (
    <Modal
      title="Add Row Abnormal"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={740}
    >
      <Form
        form={form}
        layout="horizontal" // เปลี่ยน Layout เป็นแนวนอน
        onFinish={handleAddRowOk}
        labelCol={{ span: 8 }} // ความกว้างของ Label
        wrapperCol={{ span: 16 }} // ความกว้างของ Input
        style={{ width: "100%" }}
      >
        <Collapse defaultActiveKey={["required"]} size="large" className="mb-6">
          {/* Required Fields Panel - Always expanded by default */}
          <Panel
            header={
              <Space>
                <span>📋</span>
                <span className="font-semibold">ข้อมูลที่จำเป็นต้องกรอก</span>
                <span className="text-red-500">*</span>
              </Space>
            }
            key="required"
          >
            {/* Date */}
            <Form.Item
              label={
                <p>
                  Date <text style={{ color: "red" }}>*</text>
                </p>
              }
              name="date"
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            {/* Part No */}
            <Form.Item
              label={
                <p>
                  Part No <text style={{ color: "red" }}>*</text>
                </p>
              }
              name="partNo"
            >
              <Input
                // value={addRowView?.part_no || "[Debugging] No Value Set"}
                readOnly
              />
            </Form.Item>
            {/* Shift */}

            <Form.Item
              label={
                <p>
                  Shift <text style={{ color: "red" }}>*</text>
                </p>
              }
              name="shift"
            >
              {/* <Select> */}
              <Radio.Group>
                {shiftAbnormalList.map((item: any) => (
                  <Radio.Button key={item.value} value={item.value}>
                    {item.value}
                  </Radio.Button>
                ))}
              </Radio.Group>
              {/* </Select> */}
              {/* <Radio.Group
            buttonStyle="solid"
            value={shiftAddRow}
            style={{
              flex: 3,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
            onChange={handleSelectShift}
          >
             
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
          </Radio.Group> */}
            </Form.Item>
            {/*defect_item*/}
            <Form.Item
              label={
                <p>
                  Defect item <text style={{ color: "red" }}>*</text>
                </p>
              }
              name="defect_item"
            >
              {/* <Input.Group
            compact
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #d9d9d9",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          > */}
              <Select
                placeholder=""
                style={{
                  border: "none",
                  flex: 1,
                  // height: "32px",
                  color: "black",
                }}
                mode="multiple"
                options={defectModes.map((item) => ({
                  value: item.id,
                  label: `[${item.defect_type}] ${item.defect_mode}`,
                }))}
                onChange={(value) => {
                  // setCreateForm((prev) => ({
                  //   ...prev,
                  //   pic: value,
                  // }));
                  // closeHistoryRecordTableVisible();
                }}
              />
              {/* </Input.Group> */}
            </Form.Item>
            {/*category*/}
            <Form.Item
              label={
                <p>
                  5M1E <text style={{ color: "red" }}>*</text>
                </p>
              }
              name="category"
            >
              {/* <Input.Group
            compact
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #d9d9d9",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          > */}
              <Select
                placeholder=""
                style={{
                  border: "none",
                  flex: 1,
                  // height: "32px",
                  // minWidth: "120px",
                  // width: "100%",
                  color: "black",
                }}
                mode="multiple"
                options={categories.map((item) => ({
                  value: item,
                  label: item,
                }))}
                onChange={(value) => {
                  // setCreateForm((prev) => ({
                  //   ...prev,
                  //   pic: value,
                  // }));
                  // closeHistoryRecordTableVisible();
                }}
              />
              {/* </Input.Group> */}
            </Form.Item>
            {/* Trouble */}
            <Form.Item
              label={
                <p>
                  Trouble <text style={{ color: "red" }}>*</text>
                </p>
              }
              name="trouble"
            >
              <Input
              // value={createRowForm.trouble}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     trouble: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              />
            </Form.Item>

            {/* Action */}
            <Form.Item
              label={
                <p>
                  Action <text style={{ color: "red" }}>*</text>
                </p>
              }
              name="action"
            >
              <Input
              // value={createRowForm.action}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     action: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              />
            </Form.Item>

            {/* In Charge */}
            <Form.Item
              label={
                <p>
                  In Charge <text style={{ color: "red" }}>*</text>
                </p>
              }
              name="inCharge"
            >
              <Input
              // value={createRowForm.in_change}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     in_change: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              />
            </Form.Item>

            {/* Manager */}
            <Form.Item
              label={
                <p>
                  Manager <text style={{ color: "red" }}>*</text>
                </p>
              }
              name="manager"
            >
              <Input
              // value={createRowForm.manager}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     manager: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              />
            </Form.Item>
          </Panel>
          <Panel
            header={
              <Space>
                <span>⚙️</span>
                <span className="font-semibold">ข้อมูลเสริม</span>
                <span className="text-muted-foreground text-sm">
                  (คลิกเพื่อแสดง)
                </span>
              </Space>
            }
            key="optional"
          >
            {/* Detect By */}
            <Form.Item label="Detect By" name="detectBy">
              <Radio.Group
              // value={createRowForm.detect_by}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     detect_by: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              >
                {detectBy.map((item) => (
                  <Radio key={item.value} value={item.value}>
                    {item.value}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>

            {/* Defect details */}
            <Form.Item label="Defect details" name="defectDetails">
              <Input
              // value={createRowForm.defect_detail}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     defect_detail: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              />
            </Form.Item>

            {/* Rank */}
            <Form.Item label="Rank" name="rank">
              <Radio.Group
              // value={createRowForm.rank}
              // onChange={(value) => {
              //   console.log("Trouble e.target.value:", value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     rank: value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              >
                {/* <Option value="A">A</Option>
            <Option value="B">B</Option>
            <Option value="C">C</Option> */}
                {rankList.map((item) => (
                  <Radio key={item.value} value={item.value}>
                    {item.value}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>

            {/* Root Cause Process */}
            <Form.Item label="Root cause process" name="rootCauseProcess">
              <Radio.Group
              // value={createRowForm.root_cause_process}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     root_cause_process: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              >
                {/* <Radio value="In-house">In-house</Radio>
            <Radio value="Supplier">Supplier</Radio> */}
                {rootCauseProcess.map((item) => (
                  <Radio key={item.value} value={item.value}>
                    {item.value}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>

            {/* Process Name / Supplier Name */}
            <Form.Item
              label="Process name / Supplier name"
              name="processNameOrSupplierName"
            >
              <Input
              // value={createRowForm.process_name_supplier_name}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     process_name_supplier_name: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              />
            </Form.Item>

            {/* Cause */}
            <Form.Item label="Cause" name="cause">
              <Input
              // value={createRowForm.cause}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     cause: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              />
            </Form.Item>

            {/* New / Re-occur */}
            <Form.Item label="New / Re-occur" name="newOrReoccur">
              <Radio.Group
              // value={createRowForm.new_re_occur}
              // onChange={(e) => {
              //   console.log("Trouble e.target.value:", e.target.value);
              //   setCreateRowForm((prev) => ({
              //     ...prev,
              //     new_re_occur: e.target.value,
              //   }));
              //   console.log("createRowForm:", createRowForm);
              // }}
              >
                {/* <Radio value="New">New</Radio>
            <Radio value="Re-occur">Re-occur</Radio> */}
                {newOrReoccur.map((item) => (
                  <Radio key={item.value} value={item.value}>
                    {item.value}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Panel>
        </Collapse>
        {/* Footer Buttons */}
        <Form.Item
          wrapperCol={{ offset: 8, span: 16 }}
          style={{ textAlign: "right" }}
        >
          <Button onClick={handleOnCloseModal}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginLeft: "10px" }}
            onClick={() => {}}
          >
            OK
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PreviewPopup;
