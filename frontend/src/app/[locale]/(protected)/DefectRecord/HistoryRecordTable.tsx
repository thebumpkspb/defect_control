import CustomPopover from "@/components/button/custom-popover";
import { PChartTableInput } from "@/types/pChart";
import {
  HistoryRecordsEditResult,
  HistoryRecordsResult,
  HistoryRecordsResultDetail,
  PChartRecordHistoryRecordsEditSaveRequest,
} from "@/types/settingApi";
import { AutoComplete, Flex, Spin, Table, Tag } from "antd";
import type { GetRef, TableProps } from "antd";
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Space,
  TableColumnsType,
} from "antd/lib";
import Title from "antd/lib/typography/Title";
import { Key, ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { MdDelete } from "react-icons/md";
import DropdownEdit from "@/components/button/dropdown-edit";
import dayjs from "dayjs";
import { CalendarOutlined } from "@ant-design/icons/lib/icons";
import { FaEdit } from "react-icons/fa";
import {
  pChartRecordHistoryRecordsDelete,
  pChartRecordHistoryRecordsEditSave,
  pChartRecordHistoryRecordsEditView,
  pChartRecordHistoryRecordsEditViewChange,
  pChartRecordHistoryRecordsView,
} from "@/lib/api";
import { delay } from "@/functions/event-handle";
import alertDelete from "@/assets/alert-delete.svg";
import {
  defectType,
  processType,
  shiftList,
  targetType,
} from "@/master_data/masterdata";
import { isNotEmptyValue } from "@/functions";
import { categories, pics } from "@/constants";

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

interface LineTargetColumnType {
  title: string | ReactNode;
  dataIndex: string;
  render: (
    text: string,
    record?: HistoryRecordsResultDetail
  ) => string | JSX.Element;
  onCell?: any;
  filters?: {
    text: string;
    value: string;
    children?: { text: string; value: string }[];
  }[]; // Add filters property
  filterMode?: "menu" | "tree"; // Add filterMode property
  filterSearch?: boolean; // Add filterSearch property
  width?: number;
  onFilter?: (
    value: Key | boolean,
    record: HistoryRecordsResultDetail
  ) => boolean; // Add onFilter method
}

interface HistoryRecordTableProps {
  visible: boolean;

  input: PChartTableInput;
  username: string;
  line_code_rx?: string;
  refresh_key?: number;
  //   handleRefreshPChart: () => void;
  //   refreshGeneralInfomation: () => void;
}

const defaultDataSource = {
  month: "",
  line_name: "",
  part_no: "",
  shift: "",
  process: "",
  sub_line: "",
  history_records_result: [
    {
      no: 0,
      date: "",
      shift: "",
      line: "",
      part_no: "",
      process: "",
      sub_line: "",
      defect_type: "",
      defect_mode: "",
      qty: 0,
      pic: "",
      id: 0,
      creator: "",
    },
  ],
};

const HistoryRecordTable: React.FC<HistoryRecordTableProps> = ({
  visible,
  input,
  username,
  refresh_key,
}) => {
  // console.log("HistoryRecordTable input:", input);
  const [dataSource, setDataSource] =
    useState<HistoryRecordsResult>(defaultDataSource);
  // console.log("dataSource:", dataSource);
  const column: LineTargetColumnType[] | any = [
    {
      title: <div style={{ textAlign: "center" }}>No</div>,
      dataIndex: "no",
      render: (text: any, record: any) => {
        if (record === null) {
          return text || "-";
        }
        return text;
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Date</div>,
      dataIndex: "date",
      // filters: [{ text: " ", value: " " }],
      filters: toFilterListNoEmpty(
        dataSource.history_records_result.map((item) => item.date)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value: any, record: any) => record.date === (value as string),
      render: (text: any, record: any) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DatePicker
            disabled
            picker="date" // Keep it as a date picker
            placeholder="YYYY-MM-DD"
            format="YYYY-MM-DD"
            inputReadOnly
            allowClear={false}
            value={
              editForm.date
                ? dayjs(editForm.date, "YYYY-MM-DD") // Parse full date correctly
                : null
            }
            onChange={(date) => {
              if (date) {
                const formattedDate = date.format("YYYY-MM-DD"); // Keep full date
                // console.log("Selected Date:", formattedDate);
                setEditForm((prevForm) => ({
                  ...prevForm,
                  date: formattedDate, // Store full date back
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
        ) : (
          text || "-"
        );
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Shift</div>,
      dataIndex: "shift",
      // filters: [{ text: "Inline", value: "Inline" }],
      filters: toFilterListNoEmpty(
        dataSource.history_records_result.map((item) => item.shift)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value: any, record: any) =>
        record.shift.includes(value as string),
      render: (text: any, record: any) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            disabled
            value={{ label: editForm.shift, value: editForm.shift }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                shift: String(value.value ?? ""),
              }));
            }}
            options={
              filteredTableEditDropDownData.shift?.map((shift) => ({
                value: shift,
                label: shift,
              })) ??
              shiftList.map(({ value }) => ({
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
      title: <div style={{ textAlign: "center" }}>Line</div>,
      dataIndex: "line",
      // filters: [{ text: "Inline", value: "Inline" }],
      filters: toFilterListNoEmpty(
        dataSource.history_records_result.map((item) => item.line)
      ),
      filterMode: "menu",
      width: 50,
      filterSearch: true,
      onFilter: (value: any, record: any) =>
        record.line.includes(value as string),
      render: (text: any, record: any) => {
        if (record === null) {
          return (
            <div className="ellipsisStyle" /*style={{ width: 150 }}*/>
              {text || "-"}
            </div>
          );
        }

        return editingId === record!!!.id ? (
          // <div style={{ width: "90%" }}>
          <DropdownEdit
            disabled
            value={{ label: editForm.line, value: editForm.line }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                line: String(value.value ?? ""),
              }));
            }}
            options={
              filteredTableEditDropDownData.line?.map((shift) => ({
                value: shift,
                label: shift,
              })) ?? []
            }
            placeholder={""}
          />
        ) : (
          // </div>
          // text || "-"
          <div className="ellipsisStyle" /*style={{ width: 150 }}*/>
            {text || "-"}
          </div>
        );
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Part No</div>,
      dataIndex: "part_no",
      // filters: [{ text: "Inline", value: "Inline" }],
      filters: toFilterListNoEmpty(
        dataSource.history_records_result.map((item) => item.part_no)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value: any, record: any) =>
        record.part_no.includes(value as string),
      render: (text: any, record: any) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            disabled
            value={{ label: editForm.part_no, value: editForm.part_no }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                part_no: String(value.value ?? ""),
              }));
            }}
            options={
              filteredTableEditDropDownData.part_no?.map((part_no) => ({
                value: part_no,
                label: part_no,
              })) ?? []
            }
            placeholder={""}
          />
        ) : (
          text || "-"
        );
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Type</div>,
      dataIndex: "defect_type",
      // filters: [{ text: "Inline", value: "Inline" }],
      filters: toFilterListNoEmpty(
        dataSource.history_records_result.map((item) => item.defect_type)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value: any, record: any) =>
        record.defect_type.includes(value as string),
      render: (text: any, record: any) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            disabled
            value={{ label: editForm.defect_type, value: editForm.defect_type }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                defect_type: String(value.value ?? ""),
              }));
            }}
            options={
              filteredTableEditDropDownData.defect_type?.map((defect_type) => ({
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
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Defect Mode</div>,
      dataIndex: "defect_mode",
      filters: toFilterListNoEmpty(
        dataSource.history_records_result.map((item) => item.defect_mode)
      ),
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value: any, record: any) =>
        record.defect_mode.includes(value as string),
      render: (text: any, record: any) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <DropdownEdit
            disabled
            value={{ label: editForm.defect_mode, value: editForm.defect_mode }}
            handleChange={(value: {
              value: string | number | null;
              label: string;
            }) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                defect_mode: String(value.value ?? ""),
              }));
            }}
            options={
              filteredTableEditDropDownData.defect_mode?.map((defect_mode) => ({
                value: defect_mode,
                label: defect_mode,
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
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      // key: "category",
      // fixed: "left" as FixedType,
      width: 120,
      filters: toFilterListNoEmpty(categories),
      filterMode: "menu" as "tree",
      filterSearch: true,
      onFilter: (value: Key | boolean | any, record: any) =>
        // record.action === value,
        record?.category?.some((cat: any) => value.includes(cat)),
      render: (tags: any) => {
        // console.log("tags: ", tags, " color:", color);
        return (
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
        );
      },
      onCell: (record: any, index: any) => {
        return {
          style: {
            padding: "5px",
          },
        };
      },
    },
    {
      title: <div style={{ textAlign: "center" }}>Q'ty</div>,
      dataIndex: "qty",
      // filters: [{ text: " ", value: " " }],
      filters: toNumberFilterListNoEmpty(
        dataSource.history_records_result.map((item) => item.qty)
      ),
      filterMode: "menu",
      filterSearch: true,
      align: "center",
      width: 13,
      onFilter: (value: any, record: any) => record.qty === value,
      render: (
        text: string,
        record: HistoryRecordsResultDetail | undefined
      ) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          <InputNumber
            defaultValue={text} // Initial value
            // style={{ width: "100%" }}
            onChange={(value) => {
              setEditForm((prevForm) => ({
                ...prevForm,
                qty: typeof value === "number" ? value : 0,
              }));
            }}
            step={1} // Allows both integers and floating-point numbers
            placeholder="Enter a number"
          />
        ) : (
          text || "0"
        );
      }, // input field
    },
    {
      title: <div style={{ textAlign: "center" }}>PIC</div>,
      dataIndex: "pic",
      filters: toFilterListNoEmpty(
        dataSource.history_records_result.map((item) => item.pic)
      ),
      width: 120,
      align: "center",
      filterMode: "menu",
      filterSearch: true,
      onFilter: (value: any, record: any) =>
        record.pic.includes(value as string),
      render: (text: any, record: any) => {
        if (record === null) {
          return text || "-";
        }

        return editingId === record!!!.id ? (
          // <DropdownEdit
          //   allowClear={true}
          //   value={{ label: editForm.pic, value: editForm.pic }}
          //   handleChange={(value: {
          //     value: string | number | null;
          //     label: string;
          //   }) => {
          //     setEditForm((prevForm: any) => ({
          //       ...prevForm,
          //       pic: value?.value ? String(value?.value) : null,
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
          //   options={pics.map((item) => ({
          //     value: item,
          //     label: item,
          //   }))}
          //   placeholder={""}
          // />
          <AutoComplete
            style={{ width: 100 }}
            allowClear
            options={pics.map((item) => ({
              value: item,
            }))}
            value={editForm.pic}
            placeholder=""
            filterOption={(inputValue, option) =>
              option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
              -1
            }
            // style={{
            //   border: "none",
            //   flex: 1,
            //   height: "32px",
            //   color: "black",
            //   // width: "100%",
            // }}
            onChange={(value) => {
              setEditForm((prev) => ({
                ...prev,
                pic: value,
              }));
              // closeHistoryRecordTableVisible();
            }}
          />
        ) : (
          text || "-"
        );
      },
    },
    !refresh_key
      ? {
          title: <div style={{ textAlign: "center" }}>Action</div>,
          dataIndex: "",
          render: (text: any, record: any) => {
            // do not let user edit blank item
            if (record === null || (record?.id === 0 && record.line === "")) {
              return <Space></Space>;
            }

            return editingId === record?.id ? (
              // <Space>
              <div>
                <Button
                  size="small"
                  type="link"
                  onClick={() => saveEdit(record.id)}
                >
                  Save
                </Button>
                <Button size="small" type="link" onClick={() => cancelEdit()}>
                  Cancel
                </Button>
              </div>
            ) : (
              //</Space>
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
      : null,
  ].filter(Boolean);

  const defaultTableEditDropDownData = {
    no: 0,
    date: "",
    shift: [],
    line: [],
    part_no: [],
    process: [],
    sub_line: [],
    defect_type: [],
    defect_mode: [],
    qty: 0,
    id: 0,
    // "creator": ""
  };

  const defalutEditForm = {
    no: 0,
    date: "",
    shift: "",
    line: "",
    part_no: "",
    process: "",
    sub_line: "",
    defect_type: "",
    defect_mode: "",
    qty: 0,
    pic: "",
    id: 0,
    creator: "",
  };

  const fetchSettingTargetTableView = async () => {
    console.log("input2:", input);
    setIsLoading(true);
    try {
      const response = await pChartRecordHistoryRecordsView({
        line_name: input.line_name || "",
        part_no: input.part_no,
        month: input.month || "",
        process: input.process || "",
        sub_line: input.sub_line,
        shift: input.shift || "",
        // sub_line:input.sub_line,
      });
      // console.log("fetch data:", response.history_records_result);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        setDataSource(response.history_records_result[0]);
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }
    setIsLoading(false);
  };

  const triggerUpdateTableData = async () => {
    await fetchSettingTargetTableView();
  };

  const [editingId, setEditingId] = useState<number | null>(null);

  const [tableEditDropDownData, settableEditDropDownData] =
    useState<HistoryRecordsEditResult>(defaultTableEditDropDownData);
  const [filteredTableEditDropDownData, setFilteredTableEditDropDownData] =
    useState<HistoryRecordsEditResult>(defaultTableEditDropDownData);
  const [editForm, setEditForm] =
    useState<PChartRecordHistoryRecordsEditSaveRequest>(defalutEditForm);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const startEdit = async (key: number, record: HistoryRecordsResultDetail) => {
    // do not let user edit blank item
    if (record.id === 0 && record.line === "") {
      return;
    }

    // console.log("startEdit(): record", record);

    setEditingId(key);

    setEditForm({
      id: record.id, // need to replacy this with actual id in db
      no: record.no,
      date: record.date,
      shift: record.shift,
      line: record.line,
      part_no: record.part_no,
      process: record.process,
      sub_line: record.sub_line,
      defect_type: record.defect_type,
      defect_mode: record.defect_mode,
      qty: record.qty,
      pic: record.pic,
      creator: username,
    });

    // fetch dropdown data
    setIsLoading(true);
    try {
      const response = await pChartRecordHistoryRecordsEditView({
        id: record.id,
        no: record.no,
        date: record.date,
        shift: record.shift,
        line: record.line,
        part_no: record.part_no,
        process: record.process,
        sub_line: record.sub_line,
        defect_type: record.defect_type,
        defect_mode: record.defect_mode,
        qty: record.qty,
        creator: username,
      });
      // console.log("Updated data:", response.history_records_edit_result);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        settableEditDropDownData(response.history_records_edit_result[0]);
        // // update id to actual id in db
        // setEditForm((previous) => ({
        //   ...previous,
        //   id: response.history_records_edit_result[0].id,
        // }));
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }
    setIsLoading(false);
    // fetch filtered dropdown if id is not empty
    if (record.id) {
      setIsLoading(true);
      await fetchFilteredTableEditDropDownData(
        record.no,
        record.date,
        record.shift,
        record.line,
        record.part_no,
        record.process,
        record.sub_line,
        record.defect_type,
        record.defect_mode,
        record.qty,
        record.id,
        record.creator
      );
      setIsLoading(false);
    }
  };

  const saveEdit = async (key: number) => {
    const editedRow = dataSource.history_records_result.find(
      (row) => row.id === key
    );

    if (editedRow === null) {
      return;
    }
    const hasValue = [
      editForm.no,
      editForm.date,
      editForm.shift,
      editForm.line,
      editForm.part_no,
      editForm.process,
      editForm.sub_line,
      editForm.defect_type,
      editForm.defect_mode,
      editForm.qty,
      editForm.id,
      editForm.creator,
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
    setIsLoading(true);
    try {
      const response = await pChartRecordHistoryRecordsEditSave({
        id: editForm.id,
        no: editForm.no,
        date: editForm.date,
        shift: editForm.shift,
        line: editForm.line,
        part_no: editForm.part_no,
        process: editForm.process,
        sub_line: editForm.sub_line,
        defect_type: editForm.defect_type,
        defect_mode: editForm.defect_mode,
        qty: editForm.qty,
        pic: editForm.pic,
        creator: username,
      });
      // console.log("Updated data:", response.history_records);

      // update data in table if saving success
      if (response !== null) {
        // Update the table data (disable history table reload update after save for now)
        await delay(200);
        await triggerUpdateTableData();
      }

      setEditingId(null);
    } catch (error) {
      console.error("Error saving edits:", error);
    }
    setIsLoading(false);
  };

  const deleteRow = async (key: number | null) => {
    const deletedItem = dataSource.history_records_result.find(
      (item) => item.id === key
    );
    // console.log("dataSource:", dataSource);
    if (!deletedItem) {
      return;
    }
    // console.log("deletedItem:", deletedItem);
    const hasData = [
      deletedItem.no,
      deletedItem.date,
      deletedItem.shift,
      deletedItem.line,
      deletedItem.part_no,
      deletedItem.process,
      deletedItem.sub_line,
      deletedItem.defect_type,
      deletedItem.defect_mode,
      deletedItem.qty,
      deletedItem.id,
      deletedItem.creator,
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
    setIsLoading(true);
    try {
      const response = await pChartRecordHistoryRecordsDelete({
        id: deletedItem.id,
        no: deletedItem.no,
        date: deletedItem.date,
        shift: deletedItem.shift,
        line: deletedItem.line,
        part_no: deletedItem.part_no,
        process: deletedItem.process,
        sub_line: deletedItem.sub_line,
        defect_type: deletedItem.defect_type,
        defect_mode: deletedItem.defect_mode,
        qty: deletedItem.qty,
        creator: username,
      });

      // update data in table if deletion success
      if (response !== null) {
        // Update the table data
        await triggerUpdateTableData();
      }
    } catch (error) {
      console.error("Error delete:", error);
    }
    setIsLoading(false);
  };

  const fetchFilteredTableEditDropDownData = async (
    no: number,
    date: string,
    shift: string,
    line: string,
    part_no: string,
    process: string,
    sub_line: string,
    defect_type: string,
    defect_mode: string,
    qty: number,
    id: number,
    creator: string
  ): Promise<HistoryRecordsEditResult[]> => {
    // fetch dropdown data
    setIsLoading(true);
    try {
      const response = await pChartRecordHistoryRecordsEditViewChange({
        no: no,
        date: date,
        shift: shift,
        line: line,
        part_no: part_no,
        process: process,
        sub_line: sub_line,
        defect_type: defect_type,
        defect_mode: defect_mode,
        qty: qty,
        id: id,
        creator: creator,
      });

      // update data in table if saving success
      if (response !== null) {
        // Update the table data
        setFilteredTableEditDropDownData(
          response.history_records_edit_result[0]
        );
        return response.history_records_edit_result;
      }
    } catch (error) {
      console.error("Error saving edits:", error);
    }
    setIsLoading(false);
    return [];
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // trigger on open
  useEffect(() => {
    // console.log("testkrub");
    let ignore = false;
    if (!visible) {
      return;
    }

    fetchSettingTargetTableView();
    return () => {
      ignore = true;
    };
  }, [visible, refresh_key]);
  // useEffect(() => {
  //   if (visible) {
  //     fetchSettingTargetTableView();
  //   }
  // }, []);
  // console.log("visible:", visible);
  // const testRef = useRef<TableRef>(null);

  return (
    <>
      <Spin spinning={isLoading}>
        {visible && (
          <Table
            size="small"
            columns={column}
            dataSource={dataSource.history_records_result}
            rowKey={(record) => record.id}
            // width=
            // ref={testRef}
          />
        )}
      </Spin>
    </>
  );
};

export default HistoryRecordTable;
