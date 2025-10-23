"use client";

import React, {
  forwardRef,
  Key,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Button, Table, Typography, Row, Col } from "antd";
import { AlignType } from "rc-table/lib/interface";
import { DefectParetoChartResult } from "@/types/inlineOutlineDefectSumApi";
import { formatNumberWithCommas, isNotEmptyValue } from "@/functions";

const { Title } = Typography;

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

interface TableData {
  key: string;
  date: string;
  lineName: string;
  partNo: string;
  subLine: string;
  partName: string;
  trouble: string;
  process: string;
  prodVolume: string;
  defectQty: number;
  percentDefect: string;
}

const defaultTableData: TableData[] = [];

// const defaultGrapData: DefectParetoChartResult = {
//   month: "",
//   department: "",
//   section: "",
//   line: [""],
//   defect_pareto_chart: {
//     axis_x: [""],
//     axis_y_lift: [""],
//     axis_y_right: [""],
//     pareto: [0],
//     defect_qty: [0],
//   },
//   description_of_defect: [
//     {
//       date: "",
//       line_name: "",
//       part_no: "",
//       part_name: "",
//       trouble: "",
//       prod_vol: 0,
//       defect_qty: 0,
//       percent_defect: 0,
//     },
//   ],
// };

// const mockData: DefectParetoChartResult = {
//   month: "November-2024",
//   department: "Manufacturing",
//   section: "414454 - Sta. Assy PA70",
//   line: ["414259 - Mag. Sw. PA", "414454 - Starter Assy PA70"],
//   defect_pareto_chart: {
//     axis_x: ["Scrap 1", "Other 1", "Name plate NG"],
//     axis_y_lift: ["0", "25", "50", "75", "100", "125"],
//     axis_y_right: ["0", "100", "150", "200", "250", "300"],
//     pareto: [
//       10.06, 18.27, 26.04, 33.58, 40.97, 47.64, 54.28, 59.31, 63.42, 67.11,
//       70.45, 73.73, 76.6, 79.27, 81.94, 84.09, 86.25, 88.1, 89.84, 91.28, 92.61,
//       93.95, 95.28, 96.36, 97.43, 98.36, 99.23, 99.9, 100,
//     ],
//     defect_qty: [
//       392, 320, 303, 294, 288, 260, 259, 196, 160, 144, 130, 128, 112, 104, 104,
//       84, 84, 72, 68, 56, 52, 52, 52, 42, 42, 36, 34, 26, 4,
//     ],
//   },
//   description_of_defect: [
//     {
//       date: "2024-11-01",
//       line_name: "414259 - Mag. Sw. PA",
//       part_no: "TG053400-4980",
//       sub_line: "123",
//       part_name: "SWITCH ASSY, MAGNETIC",
//       trouble: "Trouble_1_Outline",
//       process: "inline",
//       prod_vol: 3071,
//       defect_qty: 58,
//       percent_defect: 1.89,
//     },
//     {
//       date: "2024-11-01",
//       line_name: "414454 - Starter Assy PA70",
//       part_no: "TG428000-0630",
//       sub_line: "123",
//       part_name: "STARTER ASSY",
//       trouble: "Mobin ขาหักผิดปกติ",
//       process: "inline",
//       prod_vol: 3071,
//       defect_qty: 35,
//       percent_defect: 1.14,
//     },
//     {
//       date: "2024-11-01",
//       line_name: "414259 - Mag. Sw. PA",
//       part_no: "TG053400-5050",
//       sub_line: "123",
//       part_name: "SWITCH ASSY, MAGNETIC (G)",
//       trouble: "Trouble_1_Inspection",
//       process: "inline",
//       prod_vol: 3071,
//       defect_qty: 120,
//       percent_defect: 3.91,
//     },
//   ],
// };

interface DescriptionOfDefectProps {
  dataSource: DefectParetoChartResult;
  username: string;
}

export interface DescriptionOfDefectRef {
  setTableToDefault: () => void;
  refreshTable: () => void;
}

const toTableData = (defectData: DefectParetoChartResult): TableData[] => {
  return defectData.description_of_defect.map((item, i) => ({
    key: String(i),
    date: item.date,
    lineName: item.line_name,
    partNo: item.part_no,
    subLine: item.sub_line,
    partName: item.part_name,
    trouble: item.trouble,
    process: item.process,
    prodVolume: formatNumberWithCommas(item.prod_vol),
    defectQty: item.defect_qty,
    percentDefect: item.percent_defect.toFixed(2) + "%",
  }));
};

const DescriptionOfDefect = forwardRef<
  DescriptionOfDefectRef,
  DescriptionOfDefectProps
>(({ dataSource, username }, ref) => {
  const [data, setData] = useState<TableData[]>(defaultTableData);

  // useEffect(() => {
  //   // Mock API call or use real data fetching logic here
  //   setData(toTableData(mockData));
  // }, []);
  // Define Columns
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      align: "center" as AlignType,
      filters: toFilterListNoEmpty(data.map((item) => item.date)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: TableData) =>
        record.date.includes(value as string),
    },
    {
      title: "Line Name",
      dataIndex: "lineName",
      key: "lineName",
      align: "center" as AlignType,
      filters: toFilterListNoEmpty(data.map((item) => item.lineName)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: TableData) =>
        record.lineName.includes(value as string),
    },
    {
      title: "Part No",
      dataIndex: "partNo",
      key: "partNo",
      align: "center" as AlignType,
      filters: toFilterListNoEmpty(data.map((item) => item.partNo)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: TableData) =>
        record.partNo.includes(value as string),
    },
    {
      title: "Part Name",
      dataIndex: "partName",
      key: "partName",
      align: "center" as AlignType,
      filters: toFilterListNoEmpty(data.map((item) => item.partName)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: TableData) =>
        record.partName.includes(value as string),
    },
    {
      title: "Sub Line",
      dataIndex: "subLine",
      key: "subLine",
      align: "center" as AlignType,
      filters: toFilterListNoEmpty(data.map((item) => item.subLine)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: TableData) =>
        record.subLine.includes(value as string),
    },
    {
      title: "Trouble",
      dataIndex: "trouble",
      key: "trouble",
      align: "center" as AlignType,
      filters: toFilterListNoEmpty(data.map((item) => item.trouble)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: TableData) =>
        record.trouble.includes(value as string),
    },
    {
      title: "Process",
      dataIndex: "process",
      key: "process",
      align: "center" as AlignType,
      filters: toFilterListNoEmpty(data.map((item) => item.process)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: TableData) =>
        record.process.includes(value as string),
    },
    {
      title: "Prod. Volume",
      dataIndex: "prodVolume",
      key: "prodVolume",
      align: "center" as AlignType,
      filters: toFilterListNoEmpty(data.map((item) => item.prodVolume)),
      filterMode: "menu" as "tree" | "menu" | undefined,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: TableData) =>
        record.prodVolume.includes(value as string),
    },
    {
      title: "Defect Q'ty",
      dataIndex: "defectQty",
      key: "defectQty",
      align: "center" as AlignType,
    },
    {
      title: "% Defect",
      dataIndex: "percentDefect",
      key: "percentDefect",
      align: "center" as AlignType,
    },
  ];

  const setTableToDefault = () => {
    console.log("descriptionOfDefect table reset to default");
    // setData(toTableData(defaultGrapData));
  };

  const refreshTable = () => {
    console.log("Refresh Daily descriptionOfDefect table");
    setData(toTableData(dataSource));
  };

  useImperativeHandle(ref, () => ({
    setTableToDefault,
    refreshTable,
  }));

  return (
    <div style={{ padding: "20px", backgroundColor: "#fff" }}>
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "20px" }}
      ></Row>
      <Table
        dataSource={data}
        columns={columns}
        pagination={{
          position: ["bottomRight"],
          pageSize: 10,
        }}
        bordered
        rowKey="key"
        scroll={{ x: 1000 }}
      />
    </div>
  );
});

DescriptionOfDefect.displayName = "DescriptionOfDefect";

export default DescriptionOfDefect;
