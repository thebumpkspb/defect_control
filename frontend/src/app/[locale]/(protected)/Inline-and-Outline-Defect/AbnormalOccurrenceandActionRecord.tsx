"use client";

import React, {
  forwardRef,
  Key,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Button, Table, Typography, Row, Col, Space, Flex } from "antd";
import { TablePaginationConfig } from "antd";
import { AlignType, FixedType } from "rc-table/lib/interface";
import {
  AbnormalOccurrenceTable,
  CauseOfAbnormalResult,
} from "@/types/inlineOutlineDefectSumApi";
import { inlineOutlineExportAbnormalOccurrenceDownload } from "@/lib/api";
import { isNotEmptyValue } from "@/functions";

const mockData: CauseOfAbnormalResult = {
  month: "November-2024",
  department: "Manufacturing",
  section: "414454 - Sta. Assy PA70",
  line: ["414259 - Mag. Sw. PA", "414454 - Starter Assy PA70"],
  abnormal_occurrence_table: [
    {
      date: "2024-11-01",
      part_no: "TG053400-4980",
      sub_line: "123",
      trouble: "Trouble_1_Outline",
      action: "Action_1_Outline",
      in_charge: "Mr. B",
      manager: "Mr. A",
      detect_by: "M/C",
      defect_details: "Defect_1_Outline",
      rank: "A",
      root_cause_process: "In-house",
      process_name_supplier_namecause: "Name_1_Outline",
      cause: "Cause_1_Outline",
      new_re_occur: "New",
    },
  ],
};

// const defaultData: CauseOfAbnormalResult = {
//   month: "",
//   department: "",
//   section: "",
//   line: [""],
//   abnormal_occurrence_table: [
//     {
//       date: "",
//       part_no: "",
//       trouble: "",
//       action: "",
//       in_charge: "",
//       manager: "",
//       detect_by: "",
//       defect_details: "",
//       rank: "",
//       root_cause_process: "",
//       process_name_supplier_namecause: "",
//       cause: "",
//       new_re_occur: "",
//     },
//   ],
// };

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

// Define the row type
interface DataRow {
  id: number;
  key: string;
  no: string;
  date: string;
  partNo: string;
  subLine: string;
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

// Define the mapping function
const mapPChartToDataRow = (data: CauseOfAbnormalResult): DataRow[] => {
  return data.abnormal_occurrence_table.map((item, index) => ({
    id: index + 1,
    key: (index + 1).toString(),
    no: (index + 1).toString(),
    date: item.date,
    partNo: item.part_no,
    subLine: item.sub_line,
    trouble: item.trouble,
    action: item.action,
    inCharge: item.in_charge,
    manager: item.manager,
    detectBy: item.detect_by,
    defectDetails: item.defect_details,
    rank: item.rank,
    rootCauseProcess: item.root_cause_process,
    processNameOrSupplierName: item.process_name_supplier_namecause,
    cause: item.cause,
    newOrReoccur: item.new_re_occur,
  }));
};

interface AbnormalOccurrenceActionRecordProp {
  dataSource: CauseOfAbnormalResult;
  username: string;
}

export interface AbnormalOccurrenceAndActionRecordRef {
  setTableToDefault: () => void;
  refreshTable: () => void;
}

const AbnormalOccurrenceAndActionRecord = forwardRef<
  AbnormalOccurrenceAndActionRecordRef,
  AbnormalOccurrenceActionRecordProp
>(({ dataSource: dataSource, username }, ref) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [isDetailedView, setIsDetailedView] = useState(false);

  // useEffect(() => {
  //   // Mock data fetch (replace with API call)

  //   setData(mapPChartToDataRow(mockData));
  // }, []);

  const setTableToDefault = () => {
    console.log("abnormal occurence Table reset to default");
    // setData(mapPChartToDataRow(defaultData));
  };

  const refreshTable = () => {
    console.log("Refresh abnormal occurence Table");
    setData(mapPChartToDataRow(dataSource));
  };

  useImperativeHandle(ref, () => ({
    setTableToDefault,
    refreshTable,
  }));

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.no)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.no.includes(value as string),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.date)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.date.includes(value as string),
    },
    {
      title: "Part No",
      dataIndex: "partNo",
      key: "partNo",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.partNo)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.partNo.includes(value as string),
    },
    {
      title: "Sub Line",
      dataIndex: "subLine",
      key: "subLine",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.subLine)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.subLine.includes(value as string),
    },
    {
      title: "Trouble",
      dataIndex: "trouble",
      key: "trouble",
      align: "center" as AlignType,
      fixed: "left" as FixedType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.trouble)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.trouble.includes(value as string),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.action)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.action.includes(value as string),
    },
    {
      title: "In Charge",
      dataIndex: "inCharge",
      key: "inCharge",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.inCharge)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.inCharge.includes(value as string),
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.manager)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.manager.includes(value as string),
    },
  ];

  const detailedColumns = [
    ...columns,
    {
      title: "Detect By",
      dataIndex: "detectBy",
      key: "detectBy",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.detectBy)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.detectBy.includes(value as string),
    },
    {
      title: "Defect Details",
      dataIndex: "defectDetails",
      key: "defectDetails",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.defectDetails)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.defectDetails.includes(value as string),
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.rank)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.rank.includes(value as string),
    },
    {
      title: "Root Cause Process",
      dataIndex: "rootCauseProcess",
      key: "rootCauseProcess",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.rootCauseProcess)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.rootCauseProcess.includes(value as string),
    },
    {
      title: "Process Name/Supplier Name",
      dataIndex: "processNameOrSupplierName",
      key: "processNameOrSupplierName",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(
        data.map((item) => item.processNameOrSupplierName)
      ),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.processNameOrSupplierName.includes(value as string),
    },
    {
      title: "Cause",
      dataIndex: "cause",
      key: "cause",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.cause)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.cause.includes(value as string),
    },
    {
      title: "New/Re-occur",
      dataIndex: "newOrReoccur",
      key: "newOrReoccur",
      align: "center" as AlignType,
      width: 200,
      filters: toFilterListNoEmpty(data.map((item) => item.newOrReoccur)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: DataRow) =>
        record.newOrReoccur.includes(value as string),
    },
  ];

  return (
    <Flex justify="flex-start" align="flex-end" vertical>
      <Button
        type="link"
        style={{ marginBottom: "10px" }}
        onClick={() => setIsDetailedView(!isDetailedView)}
      >
        {isDetailedView ? "<--See Less" : "See More -->"}
      </Button>
      <Table
        dataSource={data}
        columns={isDetailedView ? detailedColumns : columns}
        pagination={{
          position: ["bottomRight"],
          pageSize: 10,
          total: data.length,
        }}
        style={{ width: "100%" }}
        rowKey="key"
        rowClassName={() => "custom-row"}
        scroll={{ x: "max-content" }}
      />
    </Flex>
  );
});

AbnormalOccurrenceAndActionRecord.displayName =
  "AbnormalOccurrenceAndActionRecord";

export default AbnormalOccurrenceAndActionRecord;
