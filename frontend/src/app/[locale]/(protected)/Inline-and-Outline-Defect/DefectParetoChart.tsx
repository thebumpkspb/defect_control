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
import { delay } from "@/functions";
import { DefectParetoChartResult } from "@/types/inlineOutlineDefectSumApi";

const { Title } = Typography;

const defaultGrapData: DefectParetoChartResult = {
  month: "November-2024",
  department: "",
  section: "",
  line: ["string"],
  defect_pareto_chart: {
    axis_x: [""],
    axis_y_lift: ["string"],
    axis_y_right: ["string"],
    pareto: [0],
    defect_qty: [0],
  },
  description_of_defect: [
    {
      date: "2024-11-01",
      line_name: "string",
      part_no: "string",
      part_name: "string",
      sub_line: "string",
      trouble: "string",
      process: "string",
      prod_vol: 0,
      defect_qty: 0,
      percent_defect: 0,
    },
  ],
};

const mockGrapData: DefectParetoChartResult = {
  month: "November-2024",
  department: "Manufacturing",
  section: "414454 - Sta. Assy PA70",
  line: ["414259 - Mag. Sw. PA", "414454 - Starter Assy PA70"],
  defect_pareto_chart: {
    axis_x: ["Scrap 1", "Other 1", "Name plate NG"],
    axis_y_lift: ["0", "25", "50", "75", "100", "125"],
    axis_y_right: ["0", "100", "150", "200", "250", "300"],
    pareto: [
      10.06, 18.27, 26.04, 33.58, 40.97, 47.64, 54.28, 59.31, 63.42, 67.11,
      70.45, 73.73, 76.6, 79.27, 81.94, 84.09, 86.25, 88.1, 89.84, 91.28, 92.61,
      93.95, 95.28, 96.36, 97.43, 98.36, 99.23, 99.9, 100,
    ],
    defect_qty: [
      392, 320, 303, 294, 288, 260, 259, 196, 160, 144, 130, 128, 112, 104, 104,
      84, 84, 72, 68, 56, 52, 52, 52, 42, 42, 36, 34, 26, 4,
    ],
  },
  description_of_defect: [
    {
      date: "2024-11-01",
      line_name: "414259 - Mag. Sw. PA",
      part_no: "TG053400-4980",
      part_name: "SWITCH ASSY, MAGNETIC",
      sub_line: "123",
      trouble: "Trouble_1_Outline",
      process: "inline",
      prod_vol: 3071,
      defect_qty: 58,
      percent_defect: 1.89,
    },
    {
      date: "2024-11-01",
      line_name: "414454 - Starter Assy PA70",
      part_no: "TG428000-0630",
      part_name: "STARTER ASSY",
      sub_line: "123",
      trouble: "Mobin ขาหักผิดปกติ",
      process: "inline",
      prod_vol: 3071,
      defect_qty: 35,
      percent_defect: 1.14,
    },
    {
      date: "2024-11-01",
      line_name: "414259 - Mag. Sw. PA",
      part_no: "TG053400-5050",
      part_name: "SWITCH ASSY, MAGNETIC (G)",
      sub_line: "123",
      trouble: "Trouble_1_Inspection",
      process: "inline",
      prod_vol: 3071,
      defect_qty: 120,
      percent_defect: 3.91,
    },
  ],
};

interface DefectParetoChartProps {
  dataSource: DefectParetoChartResult;
  username: string;
}

export interface DefectParetoChartRef {
  setChartToDefault: () => void;
  refreshChart: () => void;
}

const DefectParetoChart = forwardRef<
  DefectParetoChartRef,
  DefectParetoChartProps
>(({ dataSource, username }, ref) => {
  const setChartToDefault = () => {
    console.log("pareto Chart reset to default");
    setChartOption(toChartOption(defaultGrapData));
  };

  const refreshChart = () => {
    console.log("Refresh Pareto Chart");
    console.log("DefectParetoChart data source:", dataSource);
    setChartOption(toChartOption(dataSource));
  };

  useImperativeHandle(ref, () => ({
    setChartToDefault,
    refreshChart,
  }));

  const toChartOption = (defectData: DefectParetoChartResult) => {
    return {
      backgroundColor: "#ffffff",
      legend: {
        top: "5%",
        left: "center",
        textStyle: { color: "#000000", fontSize: 12 },
        data: ["Defect Q'ty", "Pareto"],
      },
      grid: {
        left: "2%",
        right: "2%",
        bottom: "10%",
        top: "20%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      xAxis: {
        type: "category",
        data: defectData.defect_pareto_chart.axis_x.map((item) => item),
        axisLabel: { rotate: 45, color: "#000" },
      },
      yAxis: [
        {
          type: "value",
          name: "",
          position: "left",
          axisLabel: { formatter: "{value}", color: "#000000" },
          min: defectData.defect_pareto_chart.axis_y_lift[0],
          max: defectData.defect_pareto_chart.axis_y_lift[-1],
        },
        {
          type: "value",
          name: "",
          position: "right",
          min: defectData.defect_pareto_chart.axis_y_right[0],
          max: defectData.defect_pareto_chart.axis_y_right[-1],
          axisLabel: { formatter: "{value}%", color: "#000000" },
        },
      ],
      series: [
        {
          name: "Defect Q'ty",
          type: "bar",
          data: defectData.defect_pareto_chart.defect_qty.map((item) => item),
          itemStyle: { color: "#FF4D4F" },
          label: { show: true, position: "top", formatter: "{c}" },
        },
        {
          name: "Pareto",
          type: "line",
          yAxisIndex: 1,
          data: defectData.defect_pareto_chart.pareto,
          itemStyle: { color: "#36CFC9" },
          lineStyle: { width: 2 },
          symbol: "circle",
          symbolSize: 8,
          label: { show: true, formatter: "{c}%" },
        },
      ],
    };
  };

  const [chartOption, setChartOption] = useState<EChartsOption>(
    toChartOption(mockGrapData)
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
            Defect Pareto Chart
          </Title>
        </Col>
      </Row>
      <div style={{ borderRadius: "7px 7px", backgroundColor: "#fff" }}>
        <ReactECharts
          option={chartOption}
          notMerge={true}
          style={{
            height: "700px",
            width: "100%",
            margin: "0 0 7px 0",
            borderRadius: "0 0 7px 7px",
          }}
        />
      </div>
    </Layout>
  );
});

DefectParetoChart.displayName = "DefectParetoChart";

export default DefectParetoChart;
