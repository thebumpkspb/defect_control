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
  GraphYearlyDefectSummary,
} from "@/types/inlineOutlineDefectSumApi";

const { Title } = Typography;

const defaultGrapData = {
  axis_x: ["Year"],
  target_percent: [0],
  defect_percent: [0],
  defect_qty: [],
};

const mockGrapData = {
  axis_x: ["AVG\nFY2022", "AVG\nFY2023", "AVG\nFY2024"],
  target_percent: [0, 0, 7.5],
  defect_percent: [0, 0, 0.05],
  defect_qty: [
    {
      name: "Scrap",
      qty: [0, 0, 264],
    },
    {
      name: "M/C Set up",
      qty: [0, 0, 5],
    },
    {
      name: "Quality Test",
      qty: [0, 0, 112],
    },
  ],
};

interface YearlyDefectSummaryProps {
  DefectDataSource: DefectSummaryResult;
  // setChartData: (data: GraphYearlyDefectSummary) => void;
  username: string;
}

export interface YearlyDefectSummaryRef {
  setChartToDefault: () => void;
  refreshChart: () => void;
}

const YearlyDefectSummary = forwardRef<
  YearlyDefectSummaryRef,
  YearlyDefectSummaryProps
>(({ DefectDataSource: defectDataSource, username }, ref) => {
  // const [isModalVisible, setIsModalVisible] = useState(false);
  // const [graphData, setGraphData] =
  //   useState<GraphYearlyDefectSummary>(defaultGrapData);

  const setChartToDefault = () => {
    console.log("yearly Chart reset to default");
    setChartOption(toChartOption(defaultGrapData));
  };

  const refreshChart = () => {
    console.log("Refresh yearly Chart");
    setChartOption(toChartOption(defectDataSource.graph_yearly_defect_summary));
  };

  useImperativeHandle(ref, () => ({
    setChartToDefault,
    refreshChart,
  }));

  const toDeflectStackBarGraph = (defect: DefectQty[]): PChartDefectBar[] => {
    if (defect.length === 0) {
      return [];
    }

    return defect.map((defectItem) => ({
      name: defectItem.name ? defectItem.name : "",
      type: "bar",
      stack: "defect",
      data: defectItem.qty,
      itemStyle: null,
    }));
  };

  const toChartOption = (
    graphData: GraphYearlyDefectSummary
  ): EChartsOption => {
    return {
      backgroundColor: "#ffffff",
      legend: {
        left: "5%",
        top: 10,
        textStyle: {
          color: "#000000",
          fontSize: 12,
        },
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
          data: graphData.axis_x,
          // data: ["testja"],
          name: "Year",
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
          show: false, // ซ่อนแกน Y ซ้าย
          // min: graphData.y_left_axis[0],
          // min: 0,
          // max: 300,
          // max: graphData.y_left_axis[-1],
        },
        {
          type: "value",
          name: "%Ratio",
          position: "right",
          // min: graphData.y_right_axis[0],
          // max: graphData.y_right_axis[-1],
          axisLabel: {
            formatter: "{value} %",
            color: "#000000",
          },
          show: false, // ซ่อนแกน Y ขวา
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
          data: graphData.target_percent,
          lineStyle: {
            type: "solid",
            color: "red",
            width: 1.5,
            symbolSize: 0,
          },
        },
        {
          name: "%Defect (Actual)",
          type: "line",
          smooth: true,
          symbol: "circle",
          yAxisIndex: 1,
          data: graphData.defect_percent,
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
        //   data: graphData,
        //   symbol: "none",
        //   showSymbol: false,
        //   lineStyle: {
        //     type: "dotted",
        //     color: "#2ECC71",
        //     width: 1.5,
        //     symbolSize: 0,
        //   },
        // },
        ...toDeflectStackBarGraph(graphData.defect_qty),
      ],
    };
  };

  const [chartOption, setChartOption] = useState<EChartsOption>(
    toChartOption(defaultGrapData)
  );

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
          <Title level={3} style={{ textAlign: "left", fontSize: "18px" }}>
            Yearly Defect Summary
          </Title>
        </Col>
      </Row>
      <div style={{ borderRadius: "7px 7px", backgroundColor: "#fff" }}>
        <ReactECharts
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

YearlyDefectSummary.displayName = "YearlyDefectSummary";

export default YearlyDefectSummary;
