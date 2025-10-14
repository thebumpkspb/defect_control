import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import { Layout, Typography, Button, Row, Col, Space, Grid } from "antd";
import { PChartDefectBar, PChartInput } from "@/types/pChart";
import {
  PChartRecordDefect,
  PChartRecordGraphRequest,
  PChartRecordGraphResult,
} from "@/types/pChartApi";
import { delay } from "@/functions";
import {
  DefectQty,
  DefectSummaryResult,
  GraphDailyDefectProcessSummary,
  GraphDailyDefectSummary,
} from "@/types/inlineOutlineDefectSumApi";

const { Title } = Typography;

interface GraphData {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  prod_vol: number;
  defect: PChartRecordDefect[];
  percent_defect: number[];
  p_bar: number[];
  ucl_target: number[];
  x_axis_label: string[];
  x_axis_value: number[];
  x_axis_maxmin: number[];
  y_left_axis: number[];
  y_right_axis: number[];
}

// const defaultGrapData = {
//   month: "",
//   line_name: "",
//   part_no: "",
//   shift: "",
//   process: "",
//   defect: [],
//   percent_defect: [],
//   p_bar: [],
//   ucl_target: [],
//   x_axis_label: [],
//   x_axis_value: [],
//   x_axis_maxmin: [1, 30],
//   y_left_axis: [0, 20, 40, 60, 80, 100],
//   y_right_axis: [0, 1, 2, 3, 4, 5],
// };

const defaultGrapData = {
  prod_vol: 0,
  defect: 0,
  defect_percent: 0,
  axis_x: ["Date"],
  axis_y_lift: ["string"],
  axis_y_right: ["string"],
  defect_percent_actual: [0],
  defect_qty: [],
};

// const mockGrapData = {
//   month: "",
//   line_name: "",
//   part_no: "",
//   shift: "",
//   process: "",
//   defect: [
//     { id: 1, defect_name: "Bolt Alarm องศาเกิน", value: [5, 10, 15, 20, 10, 15, 5, 10, 15, 20, 10, 15, 5, 10, 15, 20, 10, 15, 5, 10, 15, 20, 10, 15, 5, 10, 15, 20, 10, 15] },
//     { id: 2, defect_name: "ขัน Screw Housing ไม่ลง", value: [10, 5, 10, 15, 5, 10, 15, 10, 5, 10, 15, 5, 10, 15, 10, 5, 10, 15, 5, 10, 15, 10, 5, 10, 15, 5, 10, 15, 5, 10] },
//     { id: 3, defect_name: "Short - Over part", value: [15, 20, 10, 15, 20, 10, 5, 15, 20, 10, 5, 15, 20, 10, 5, 15, 20, 10, 5, 15, 20, 10, 5, 15, 20, 10, 5, 15, 20, 10] },
//   ],
//   p_bar: [], // remove later
//   x_axis_value: [],  // remove later
//   percent_defect: [2, 2.5, 3, 3.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 2, 2.5, 3, 3.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 2],
//   ucl_target: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
//   x_axis_label: Array.from({ length: 30 }, (_, i) => (i + 1).toString()),
//   x_axis_maxmin: [1, 30],
//   y_left_axis: [0, 25, 50, 75, 100, 125],
//   y_right_axis: [0, 1, 2, 3, 4, 5],
// };

const mockGrapData = {
  prod_vol: 74103,
  defect: 381,
  defect_percent: 0.51,
  axis_x: [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
  ],
  axis_y_lift: ["0.00", "25.00", "50.00", "75.00", "100.00", "125.00"],
  axis_y_right: ["0.00%", "1.00%", "2.00%", "3.00%", "4.00%", "5.00%"],
  defect_percent_actual: [
    0.52, 0, 0, 0.75, 0.52, 0.74, 0.44, 0.36, 0, 0, 0.36, 0.64, 0.54, 0.6, 0.52,
    0, 0, 0.54, 0.41, 0.35, 0.34, 0.75, 0, 0, 0.4, 0.6, 0.48, 0.51, 0.48, 0.51,
  ],
  defect_qty: [
    {
      name: "ขัน Bolt, Screw, Nut หัวเยิน",
      qty: [
        3, 0, 0, 12, 5, 4, 1, 1, 0, 0, 10, 7, 3, 12, 5, 0, 0, 4, 1, 1, 10, 7, 0,
        0, 3, 12, 5, 4, 5, 4,
      ],
    },
    {
      name: "Name plate NG",
      qty: [
        8, 0, 0, 7, 6, 9, 8, 4, 0, 0, 0, 8, 8, 7, 6, 0, 0, 9, 8, 4, 0, 8, 0, 0,
        8, 7, 6, 9, 6, 9,
      ],
    },
    {
      name: "M/C Set up",
      qty: [
        1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0,
      ],
    },
    {
      name: "Quality Test",
      qty: [
        4, 0, 0, 4, 4, 8, 4, 4, 0, 0, 4, 8, 4, 4, 4, 0, 0, 8, 4, 4, 4, 8, 0, 0,
        4, 4, 4, 8, 4, 8,
      ],
    },
  ],
};

interface DailyDefectSummaryProps {
  defectDataSource: GraphDailyDefectSummary;
  addtionalLabel: string;
  username: string;
}

export interface DailyDefectSummaryRef {
  setChartToDefault: () => void;
  refreshChart: () => void;
}

const DailyDefectSummary = forwardRef<
  DailyDefectSummaryRef,
  DailyDefectSummaryProps
>(
  (
    {
      defectDataSource: defectDataSource,
      addtionalLabel: addtionalLabel,
      username,
    },
    ref
  ) => {
    console.log("defectDataSource:", defectDataSource);
    const setChartToDefault = () => {
      console.log("Chart reset to default");
      setChartOption(toChartOption(defaultGrapData));
    };
    const chartRef = useRef<any>();
    const refreshChart = () => {
      console.log("Refresh Daily Chart");
      // console.log(
      //   "allDataSource.graph_daily_defect_summary:",
      //   defectDataSource.graph_daily_defect_summary
      // );
      setChartOption(toChartOption(defectDataSource));
    };

    useImperativeHandle(ref, () => ({
      setChartToDefault,
      refreshChart,
    }));

    const generateUniqueColors = (count: number): string[] => {
      const colors = new Set<string>();
      let i = 0;
      while (colors.size < count) {
        const hue = (i * 331) % 360;
        const saturation = 50 + ((i * 29) % 50);
        const lightness = 30 + ((i * 37) % 40);

        // Introduce tone variations by alternating between warm, cool, and neutral colors
        let color;
        if (i % 3 === 0) {
          color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        } else if (i % 3 === 1) {
          color = `hsl(${(hue + 180) % 360}, ${saturation - 10}%, ${
            lightness + 10
          }%)`;
        } else {
          color = `hsl(${(hue + 90) % 360}, ${saturation + 10}%, ${
            lightness - 10
          }%)`;
        }

        if (!colors.has(color)) {
          colors.add(color);
        }
        i++;
      }
      return Array.from(colors);
    };

    const toDeflectStackBarGraph = (defect: DefectQty[]): PChartDefectBar[] => {
      if (defect.length === 0) {
        return [];
      }

      const colors: string[] = generateUniqueColors(defect.length);

      return defect.map((defectItem: DefectQty, index: number) => ({
        name: defectItem.name ? defectItem.name : "",
        type: "bar",
        stack: "defect",
        data: defectItem.qty,
        itemStyle: {
          color: colors[index % colors.length],
        },
      }));
    };

    const toChartOption = (graphData: GraphDailyDefectSummary) => {
      console.log("graphData:", graphData);
      return {
        backgroundColor: "#ffffff",
        // legend: {
        //   top: 10,
        //   left: "center",
        //   textStyle: { color: "#000000", fontSize: 12 },
        // },
        legend: {
          type: "scroll",
          orient: "horizontal",
          left: "5%", // ย้าย legend ไปทางซ้าย
          textStyle: {
            color: "#000000", // ตัวหนังสือสีดำ
            fontSize: 12,
          },
          data: graphData.defect_qty.map((a) => a.name),
        },
        grid: { left: 50, right: 50, bottom: 50, top: 120, containLabel: true },
        tooltip: {
          trigger: "axis",
          formatter: function (params: any) {
            // params is an array when trigger='axis'
            // console.log("params:", params);
            const filtered = params.filter(
              (item: any) => item.data !== 0 || item.componentSubType == "line"
            );
            if (filtered.length === 0) {
              return ""; // No tooltip if all zero
            }
            // Build tooltip lines
            return filtered
              .map(
                (item: any) => `${item.marker}${item.seriesName}: ${item.data}`
              )
              .join("<br/>");
          },
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          type: "category",
          data: graphData.axis_x,
          name: "Date",
          nameLocation: "center",
          nameGap: 30,
        },
        yAxis: [
          {
            type: "value",
            name: "Q'ty (pcs.)",
            position: "left",
            axisLabel: { formatter: "{value} pcs.", color: "#000000" },
            min: graphData.axis_y_lift,
            max: graphData.axis_y_lift,
          },
          {
            type: "value",
            name: "% Defect",
            position: "right",
            axisLabel: { formatter: "{value} %", color: "#000000" },
            min: graphData.axis_y_right,
            max: graphData.axis_y_right,
          },
        ],
        series: [
          {
            name: "%Defect(Actual)",
            type: "line",
            smooth: true,
            symbol: "circle",
            yAxisIndex: 1,
            data: graphData.defect_percent_actual,
            itemStyle: {
              color: "#73C0DE",
            },
            lineStyle: {
              width: 2,
            },
            symbolSize: 8,
          },
          // {
          //   name: "UCL Target",
          //   type: "line",
          //   step: "middle",
          //   symbol: "none",
          //   yAxisIndex: 1,
          //   showSymbol: false,
          //   // data: graphData.target_percent,
          //   data: [0],
          //   lineStyle: {
          //     type: "solid",
          //     color: "red",
          //     width: 1.5,
          //   },
          // },
          // {
          //   name: "P-bar",
          //   type: "line",
          //   // data: graphData.target_percent,
          //   data: [0],
          //   symbol: "none",
          //   showSymbol: false,
          //   lineStyle: {
          //     type: "dotted",
          //     color: "#2ECC71",
          //     width: 1.5,
          //   },
          // },
          ...toDeflectStackBarGraph(graphData.defect_qty),
        ],
      };
    };

    const [chartOption, setChartOption] = useState<EChartsOption>(
      toChartOption(defaultGrapData)
    );
    // console.log("chartOption:", chartOption);
    const handleSelectAll = () => {
      const allNames = chartOption.series.map((series: any) => series.name);
      allNames.forEach((name: any) => {
        chartRef.current.getEchartsInstance().dispatchAction({
          type: "legendSelect",
          name,
        });
      });
    };

    // Function to deselect all legend items
    const handleDeselectAll = () => {
      const allNames = chartOption.series.map((series: any) => series.name);
      allNames.forEach((name: any) => {
        if (
          !["%Defect", "UCL Target", "P-bar", "%Defect(Actual)"].includes(name)
        ) {
          chartRef.current.getEchartsInstance().dispatchAction({
            type: "legendUnSelect",
            name,
          });
        }
      });
    };
    return (
      <Layout
        style={{
          display: "flex",
          padding: "0px",
          flexDirection: "column",
          // backgroundColor: "#ffffff",
          maxWidth: "100%",
          margin: "15px 0 15px 0",
          // borderRadius: "7px",
          alignItems: "stretch",
        }}
      >
        <Row
          align="middle"
          style={{
            backgroundColor: "#ffffff",
            padding: "10px 10px 10px 10px",
            borderRadius: "7px 7px 0 0",
          }}
        >
          <Col>
            <h3 style={{ textAlign: "left", fontSize: "18px" }}>
              Daily Defect Summary - {addtionalLabel}
            </h3>
            <div>
              <Button size="small" type="link" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button size="small" type="link" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
          </Col>
          <Col span={10}></Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <strong>Prod. Vol.</strong>
                <strong>Defect</strong>
                <strong>%Defect</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  marginTop: "5px",
                }}
              >
                <span>{defectDataSource?.prod_vol} pcs.</span>
                <span>{defectDataSource?.defect} pcs.</span>
                <span>{defectDataSource?.defect_percent}%</span>
              </div>
            </div>
          </Col>
        </Row>
        <div style={{ borderRadius: "7px 7px", backgroundColor: "#fff" }}>
          <ReactECharts
            ref={chartRef}
            // option={option}
            option={chartOption}
            notMerge={true}
            style={{
              height: "500px",
              width: "100%",
              margin: "0 0 7px 0",
              borderRadius: "0 0 7px 7px",
            }}
          />
        </div>
      </Layout>
    );
  }
);

DailyDefectSummary.displayName = "DailyDefectSummary";

export default DailyDefectSummary;
