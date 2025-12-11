import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import { Layout, Typography, Button, Row, Col, Space, Grid, Radio } from "antd";
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
  GraphMonthlyDefectProcessSummary,
  GraphMonthlyDefectSummary,
} from "@/types/inlineOutlineDefectSumApi";
import { formatNumber } from "@/functions/helper";

const { Title } = Typography;

const defaultGrapData = {
  axis_x: ["Month"],
  target_percent: [0],
  defect_percent: [0],
  defect_qty: [],
};

const mockGrapData = {
  axis_x: ["Jan'25"],
  target_percent: [0.477],
  defect_percent: [0.25],
  defect_qty: [
    {
      name: "ขัน Bolt, Screw, Nut หัวเยิน",
      qty: [0],
    },
    {
      name: "ขัน Screw Housing ไม่ลง",
      qty: [0],
    },
  ],
};

interface MonthlyDefectSummaryProps {
  defectDataSource: GraphMonthlyDefectProcessSummary;
  username: string;
}

export interface MonthlyDefectSummaryRef {
  setChartToDefault: () => void;
  refreshChart: () => void;
}

const MonthlyDefectSummary = forwardRef<
  MonthlyDefectSummaryRef,
  MonthlyDefectSummaryProps
>(({ defectDataSource: defectDataSource, username }, ref) => {
  const [process, setProcess] = useState<string>("inline");
  // const [isModalVisible, setIsModalVisible] = useState(false);
  // const [graphData, setGraphData] =
  //   useState<PChartRecordGraphResult>(defaultGrapData);
  const chartRef = useRef<any>();
  const setChartToDefault = () => {
    console.log("Chart reset to default");
    setChartOption(toChartOption(defaultGrapData));
  };

  const refreshChart = () => {
    console.log("Refresh monthly Chart");
    if (process == "inline") {
      setChartOption(toChartOption(defectDataSource.inline));
    } else if (process == "outline") {
      setChartOption(toChartOption(defectDataSource.outline));
    } else if (process == "inspection") {
      setChartOption(toChartOption(defectDataSource.inspection));
    }
  };

  useImperativeHandle(ref, () => ({
    setChartToDefault,
    refreshChart,
  }));
  useEffect(() => {
    if (process == "inline") {
      setChartOption(toChartOption(defectDataSource.inline));
    } else if (process == "outline") {
      setChartOption(toChartOption(defectDataSource.outline));
    } else if (process == "inspection") {
      setChartOption(toChartOption(defectDataSource.inspection));
    }
  }, [process]);
  // console.log("defectDataSource:", defectDataSource);
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
    if (defect?.length === 0) {
      return [];
    }

    const colors: string[] = generateUniqueColors(defect?.length);

    return (
      defect?.map((defectItem: DefectQty, index: number) => ({
        name: defectItem.name ? defectItem.name : "",
        type: "bar",
        stack: "defect",
        data: defectItem.qty,
        itemStyle: {
          color: colors[index % colors.length],
        },
      })) || []
    );
  };

  const toChartOption = (graphData: GraphMonthlyDefectSummary) => {
    const barSeries = toDeflectStackBarGraph(graphData?.defect_qty);
    // console.log("graphData:", graphData);
    // Compute totals dynamically for each x-axis index
    const totals = graphData?.axis_x?.map((_, i) =>
      barSeries.reduce((sum, s) => sum + (s.data[i] ?? 0), 0)
    );
    return {
      backgroundColor: "#ffffff",
      // legend: {
      //   left: "5%",
      //   top: 10,
      //   textStyle: {
      //     color: "#000000",
      //     fontSize: 12,
      //   },
      // },
      legend: {
        type: "scroll",
        orient: "horizontal",
        left: "5%", // ย้าย legend ไปทางซ้าย
        textStyle: {
          color: "#000000", // ตัวหนังสือสีดำ
          fontSize: 12,
        },
        data: ["%Target", "%Defect(Actual)"].concat(
          graphData?.defect_qty.map((a) => a.name)
        ),
      },
      grid: {
        left: 30,
        containLabel: true,
        bottom: 30,
        top: 120,
        right: 30,
      },
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
      xAxis: [
        {
          type: "category",
          data: graphData?.axis_x,
          name: "Month",
          nameLocation: "center",
          nameGap: 40,
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "Q'ty (pcs.)",
          position: "left",
          axisLabel: {
            formatter: "{value} pcs.",
            color: "#000000",
          },
          // show: false, // ซ่อนแกน Y ซ้าย
        },
        {
          type: "value",
          name: "%Ratio",
          position: "right",
          axisLabel: {
            formatter: "{value} %",
            color: "#000000",
          },
          // show: false, // ซ่อนแกน Y ขวา
        },
      ],
      series: [
        {
          name: "%Target",
          type: "line",
          step: "middle",
          symbol: "none",
          yAxisIndex: 1,
          showSymbol: false,
          data: graphData?.target_percent,
          itemStyle: {
            color: "red",
          },
          lineStyle: {
            type: "solid",
            color: "red",
            width: 1.5,
          },
        },
        {
          name: "%Defect(Actual)",
          type: "line",
          smooth: true,
          symbol: "circle",
          yAxisIndex: 1,
          data: graphData?.defect_percent,
          itemStyle: {
            color: "#73C0DE",
          },
          lineStyle: {
            width: 2,
          },

          symbolSize: 8,
        },
        // {
        //   name: "P-bar",
        //   type: "line",
        //   data: graphData.target_percent,
        //   symbol: "none",
        //   showSymbol: false,
        //   lineStyle: {
        //     type: "dotted",
        //     color: "#2ECC71",
        //     width: 1.5,
        //   },
        // },
        ...toDeflectStackBarGraph(graphData?.defect_qty),
        {
          name: "Total",
          type: "line",
          data: totals, // use computed totals
          lineStyle: { color: "transparent" },
          itemStyle: { color: "transparent" },
          symbolSize: 0,
          label: {
            show: true,
            position: "top",
            color: "#000",
            // fontWeight: "bold",
            formatter: (params: any) => {
              const total = params.data;
              // Only show label if total > 0
              return total > 0 ? formatNumber(total) : "";
            },
          },
        },
      ],
    };
  };

  const [chartOption, setChartOption] = useState<EChartsOption>(
    toChartOption(defaultGrapData)
  );
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
        ![
          "%Defect",
          "UCL Target",
          "P-bar",
          "%Defect(Actual)",
          "%Target",
        ].includes(name)
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
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Col>
          <h3 style={{ textAlign: "left", fontSize: "18px" }}>
            Monthly Defect Summary
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
        <Col>
          <Radio.Group
            size="small"
            buttonStyle="solid"
            value={process}
            onChange={(e) => setProcess(e.target.value)}
          >
            <Radio.Button value="inline">Inline</Radio.Button>
            <Radio.Button value="outline">Outline</Radio.Button>
            <Radio.Button value="inspection">Inspection</Radio.Button>
          </Radio.Group>
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
});

MonthlyDefectSummary.displayName = "MonthlyDefectSummary";

export default MonthlyDefectSummary;
