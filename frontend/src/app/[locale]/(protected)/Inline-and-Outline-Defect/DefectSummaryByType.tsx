import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import { AlignType } from "rc-table/lib/interface";
import { Layout, Typography, Row, Col, Table } from "antd";
import {
  GraphDefectSummaryByType,
  Defect,
  DefectSummaryResult,
} from "@/types/inlineOutlineDefectSumApi";
import { formatNumber } from "@/functions/helper";

const { Title } = Typography;

// Mock Data for Chart and Table
const mockData = {
  totalPercent: 6.58,
  defects: [
    { label: "Scrap", value: 352, percent: "3.20%", color: "#FF4D4F" },
    { label: "Quality Test", value: 125, percent: "2.20%", color: "#FFA500" },
    { label: "Repeat NG", value: 100, percent: "1.18%", color: "#FFD700" },
    { label: "M/C Set up", value: 100, percent: "1.18%", color: "#00BFFF" },
    { label: "Appearance", value: 100, percent: "1.18%", color: "#7CFC00" },
    { label: "Dimension", value: 100, percent: "1.18%", color: "#1E90FF" },
    { label: "Performance", value: 100, percent: "1.18%", color: "#00FA9A" },
    { label: "Other", value: 100, percent: "1.18%", color: "#FFFF00" },
  ],
};

const mockChartData: GraphDefectSummaryByType = {
  total: 0.51,
  defect: [
    {
      name: "Scrap",
      qty: 264,
      percent: 0.36,
    },
    {
      name: "Quality Test",
      qty: 112,
      percent: 0.15,
    },
    {
      name: "M/C Set up",
      qty: 5,
      percent: 0.01,
    },
  ],
};

const defaultChartData: GraphDefectSummaryByType = {
  total: 0.01,
  defect: [
    {
      name: "String",
      qty: 1,
      percent: 0.01,
    },
  ],
};

interface TableDataSource {
  label: String;
  value: number;
  percent: number;
  color: string;
}

interface DefectSummaryByTypeProps {
  defectDataSource: GraphDefectSummaryByType;
  addtionalLabel: string;
  username: string;
}

export interface DefectSummaryByTypeRef {
  setChartToDefault: () => void;
  refreshChart: () => void;
  setTableToDefault: () => void;
  refreshTable: () => void;
}

const DefectSummaryByType = forwardRef(
  ({ defectDataSource, addtionalLabel }: DefectSummaryByTypeProps, ref) => {
    const [selectedDefects, setSelectedDefects] = useState<string[]>([]);
    const [chartOption, setChartOption] = useState<EChartsOption>({});
    const [totalPercent, setTotalPercent] = useState<number>(0.0);

    const toggleDefect = (defectName: string) => {
      setSelectedDefects((prev) => {
        const newSelectedDefects = prev.includes(defectName)
          ? prev.filter((name) => name !== defectName)
          : [...prev, defectName];

        updateChart(newSelectedDefects);
        return newSelectedDefects;
      });
    };

    const refreshChart = () => {
      console.log("Refresh By Type Pie Chart");
      console.log(
        "allDataSource.graph_daily_defect_summary:",
        defectDataSource
      );
      setChartOption(toChartOption(defectDataSource, selectedDefects));
      setTotalPercent(
        Math.round(
          defectDataSource.defect.reduce(
            (sum, defect) => sum + defect.percent,
            0
          ) * 100
        ) / 100
      );
    };

    const setChartToDefault = () => {
      console.log("ByType Chart reset to default");
      // setTableDataSource(toTableDataSource(defaultChartData));
    };
    const setTableToDefault = () => {
      console.log("ByType Table reset to default");
      // setTableDataSource(toTableDataSource(defaultChartData));
    };

    const refreshTable = () => {
      console.log("Refresh By Type Table");
      setTableDataSource(toTableDataSource(defectDataSource));
    };

    useImperativeHandle(ref, () => ({
      setChartToDefault,
      refreshChart,
      setTableToDefault,
      refreshTable,
    }));

    const colorList = [
      "#FF0000", // Red (Scrap)
      "#FF7F00", // Orange (Quality Test)
      "#FFD700", // Gold (Repeat NG)
      "#0080FF", // Blue (M/C Set up)
      "#00C400", // Green (Appearance)
      "#8A2BE2", // Purple (Dimension)
      "#FF1493", // Pink (Performance)
      "#A52A2A", // Brown (Other)
    ];

    const defectNames = [
      "Scrap",
      "Quality Test",
      "Repeat NG",
      "M/C Set up",
      "Appearance",
      "Dimension",
      "Performance",
      "Other",
    ];
    const colorMap: { [key: string]: string } = {};
    defectNames.forEach((name, index) => {
      colorMap[name] = colorList[index % colorList.length];
    });

    const toChartOption = (
      chartData: GraphDefectSummaryByType,
      selectedDefects: string[]
    ): EChartsOption => {
      const filteredData = chartData?.defect?.filter(
        (item) => !selectedDefects.includes(item.name)
      );

      return {
        tooltip: {
          trigger: "item",
          formatter: (params: any) => {
            return `${params.seriesName} <br/>${params.name}: ${
              params.value
            } (${params.percent.toFixed(2)}%)`;
          },
        },
        series: [
          {
            name: "Defect Type",
            type: "pie",
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "18",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: true,
            },
            data: filteredData?.map((item) => ({
              value: item.qty,
              name: item.name,
              itemStyle: { color: colorMap[item.name] || "#CCCCCC" },
            })),
          },
        ],
      };
    };

    const toTableDataSource = (
      chartData: GraphDefectSummaryByType
    ): TableDataSource[] => {
      return chartData.defect.map((item) => ({
        label: item.name,
        value: item.qty,
        percent: parseFloat(item.percent.toFixed(2)),
        color: colorMap[item.name] || "#CCCCCC",
      }));
    };

    const updateChart = (selectedDefects: string[]) => {
      const chartData = defectDataSource;
      setChartOption(toChartOption(chartData, selectedDefects));

      const updatedTotalPercent = parseFloat(
        chartData?.defect
          .filter((item) => !selectedDefects.includes(item.name))
          .reduce((sum, defect) => sum + defect.percent, 0)
          .toFixed(2)
      );
      setTotalPercent(updatedTotalPercent);
    };

    useEffect(() => {
      updateChart(selectedDefects);
    }, [selectedDefects, defectDataSource]);

    // Table Columns and Data
    const columns = [
      {
        title: "Color",
        dataIndex: "color",
        key: "color",
        align: "center" as AlignType,
        render: (color: string, record: { label: String }) => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: color,
                borderRadius: "50%",
                cursor: "pointer",
                border: "1px solid #ddd",
              }}
              onClick={() => toggleDefect(record.label.toString())}
            ></div>
          </div>
        ),
        width: "60px",
      },
      {
        title: "Label",
        dataIndex: "label",
        key: "label",
        align: "center" as AlignType,
        render: (text: string, record: { color: string }) => (
          <span
            style={{
              color: selectedDefects.includes(text) ? "gray" : record.color,
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "12px",
              textAlign: "left",
              display: "block",
            }}
            onClick={() => toggleDefect(text)}
          >
            {text}
          </span>
        ),
        width: "200px",
      },
      {
        title: "Q'ty",
        dataIndex: "value",
        key: "value",
        align: "center" as AlignType,
        render: (value: number) => (
          <span
            style={{ fontSize: "12px", textAlign: "right", display: "block" }}
          >
            {formatNumber(value)}
          </span>
        ),
        width: "75px",
      },
      {
        title: "%",
        dataIndex: "percent",
        key: "percent",
        align: "center" as AlignType,
        render: (percent: number) => (
          <span
            style={{ fontSize: "12px", textAlign: "right", display: "block" }}
          >
            {percent.toFixed(2)}%
          </span>
        ),
        width: "75px",
      },
    ];

    const [tableDataSource, setTableDataSource] = useState<TableDataSource[]>(
      []
    );

    const updateTable = (selectedDefects: string[]) => {
      const tableData = defectDataSource?.defect?.map((item) => ({
        label: item.name,
        value: item.qty,
        percent: parseFloat(item.percent.toFixed(2)),
        color: selectedDefects.includes(item.name)
          ? "gray"
          : colorMap[item.name] || "#CCCCCC",
      }));

      setTableDataSource(tableData);
    };

    useEffect(() => {
      updateTable(selectedDefects);
    }, [selectedDefects, defectDataSource]);

    return (
      <Layout
        style={{
          display: "flex",
          padding: "20px",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          maxWidth: "100%",
          margin: "15px 0",
          alignItems: "center",
        }}
      >
        {/* Title */}
        <Row
          align="middle"
          style={{
            backgroundColor: "#ffffff",
            padding: "10px 10px 10px 10px",
          }}
        >
          <Col>
            <Title level={3} style={{ textAlign: "center", fontSize: "18px" }}>
              %Defect Summary by Type - {addtionalLabel}
            </Title>
          </Col>
        </Row>

        {/* Donut Chart */}
        <Row
          justify="center"
          style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
        >
          <Col>
            <ReactECharts
              option={chartOption}
              notMerge={true}
              style={{
                height: "300px",
                width: "300px",
              }}
            />
          </Col>
        </Row>

        <Row
          justify="center"
          style={{
            width: "100%",
            padding: "0 20px",
          }}
        >
          <Col>
            {/* Center Text */}
            <div
              style={{
                // position: "absolute",
                top: "50%",
                left: "50%",
                // transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <Title level={2} style={{ margin: 0 }}>
                {totalPercent.toFixed(2)}%
              </Title>
              <p style={{ margin: 0 }}>TOTAL</p>
            </div>
          </Col>
        </Row>

        {/* Data Table */}
        <Row
          justify="center"
          style={{
            width: "100%",
            padding: "0 20px",
          }}
        >
          <Col>
            <Table
              dataSource={tableDataSource}
              columns={columns}
              pagination={{ pageSize: 4, size: "small" }}
              rowKey="label"
              bordered
              scroll={{ x: "max-content" }}
              style={{ width: "100%" }}
              size="small"
            />
          </Col>
        </Row>
      </Layout>
    );
  }
);

DefectSummaryByType.displayName = "DefectSummaryByType";

export default DefectSummaryByType;
