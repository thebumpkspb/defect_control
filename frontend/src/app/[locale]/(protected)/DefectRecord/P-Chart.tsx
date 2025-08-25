import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import {
  Layout,
  Typography,
  Button,
  Row,
  Col,
  Space,
  Grid,
  Badge,
  ConfigProvider,
} from "antd";
import PreviewPopup from "./PreviewPopup";
import { PChartDefectBar, PChartInput } from "@/types/pChart";
import {
  PChartRecordDefect,
  PChartRecordGraphRequest,
  PChartRecordGraphResult,
} from "@/types/pChartApi";
import { pChartRecordGraphNoErr } from "@/lib/api";
import { delay } from "@/functions";
import { HistoryPopup } from "./HistoryPopup";

const { Title } = Typography;

const defaultGrapData = {
  month: "",
  line_name: "",
  part_no: "",
  shift: "",
  process: "",
  sub_line: "",
  defect: [
    // {
    //   id: 1,
    //   defect_name: "",
    //   value: [],
    // },
  ],
  percent_defect: [],
  p_bar: [],
  ucl_target: [],
  x_axis_label: [],
  x_axis_value: [],
  x_axis_maxmin: [1, 30],
  y_left_axis: [0, 20, 40, 60, 80, 100],
  y_right_axis: [0, 1, 2, 3, 4, 5],
};

interface PChartProps {
  input: PChartInput;
  username: string;
}

export interface PChartRef {
  setChartToDefault: () => void;
  refreshPChart: () => void;
}

const PChart = forwardRef<PChartRef, PChartProps>(
  ({ input, username }, ref) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [graphData, setGraphData] =
      useState<PChartRecordGraphResult>(defaultGrapData);
    const [chartData, setChartData] = useState<PChartRecordDefect[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const chartRef = useRef<any>();
    // const chartData = [
    //   { value: 1048, name: "Desktop", category: "Computers" },
    //   { value: 735, name: "Mobile", category: "Phones" },
    //   { value: 580, name: "Tablet", category: "Tablets" },
    //   { value: 484, name: "Smart TV", category: "Entertainment" },
    //   { value: 300, name: "Gaming Console", category: "Gaming" },
    //   { value: 250, name: "Wearables", category: "Accessories" },
    //   { value: 200, name: "Smart Home", category: "IoT" },
    //   { value: 150, name: "Audio Devices", category: "Audio" },
    //   { value: 320, name: "Laptops", category: "Computers" },
    //   { value: 180, name: "Cameras", category: "Photography" },
    //   { value: 220, name: "Headphones", category: "Audio" },
    //   { value: 160, name: "Speakers", category: "Audio" },
    //   { value: 280, name: "Monitors", category: "Displays" },
    //   { value: 140, name: "Keyboards", category: "Accessories" },
    //   { value: 190, name: "Mice", category: "Accessories" },
    //   { value: 110, name: "Webcams", category: "Photography" },
    //   { value: 95, name: "Printers", category: "Office" },
    //   { value: 85, name: "Routers", category: "Network" },
    //   { value: 1048, name: "Desktop", category: "Computers" },
    //   { value: 735, name: "Mobile", category: "Phones" },
    //   { value: 580, name: "Tablet", category: "Tablets" },
    //   { value: 484, name: "Smart TV", category: "Entertainment" },
    //   { value: 300, name: "Gaming Console", category: "Gaming" },
    //   { value: 250, name: "Wearables", category: "Accessories" },
    //   { value: 200, name: "Smart Home", category: "IoT" },
    //   { value: 150, name: "Audio Devices", category: "Audio" },
    //   { value: 320, name: "Laptops", category: "Computers" },
    // ];
    const setChartToDefault = () => {
      console.log("Chart reset to default");
      setGraphData(defaultGrapData);
      setChartOption(toChartOption(defaultGrapData));
    };

    const refreshPChart = () => {
      console.log("Refresh Chart");
      // need to fech 2 time so the chart can update

      delay(3000)
        .then(() => fetchPChart(mapToPChartRecordGraphReqBody(input)))
        .catch((error) => console.error("Error refreshing chart:", error));
    };

    useImperativeHandle(ref, () => ({
      setChartToDefault,
      refreshPChart,
    }));

    const mapToPChartRecordGraphReqBody = (
      input: PChartInput
    ): PChartRecordGraphRequest => {
      return {
        month: input.month,
        line_name: input.line_name,
        part_no: input.part_no,
        shift: input.shift,
        process: input.process,
        sub_line: input.sub_line,
      };
    };

    const fetchPChart = async (input: PChartRecordGraphRequest) => {
      // { "month": "November-2024", "line_name": "414454 - Sta. Assy : PA70 Type", "part_no": "TG428000-0630", "shift": "B", "process": "Inline" }

      // setGraphData(defaultGrapData)

      try {
        const response = await pChartRecordGraphNoErr({
          month: input.month,
          line_name: input.line_name,
          part_no: input.part_no,
          shift: input.shift,
          process: input.process,
          sub_line: input.sub_line,
        });
        // console.log("pchart graph data:", response.p_chart_graph_result);
        // setGraphData(response.p_chart_graph_result[0]);
        setChartOption(toChartOption(response.p_chart_graph_result[0]));
        setChartData(response.p_chart_graph_result[0]?.defect);
        console.log(
          "response.p_chart_graph_result[0]:",
          response.p_chart_graph_result[0]
        );
      } catch (error) {
        // setGraphData(defaultGrapData)
        setChartOption(toChartOption(defaultGrapData));
        console.error("Error fetching abnomal occurrence view:", error);
      }
    };

    const toDeflectStackBarGraph = (
      defect: PChartRecordDefect[]
    ): PChartDefectBar[] => {
      if (defect.length === 0) {
        return [];
      }

      return defect.map((defectItem) => ({
        name: defectItem.defect_name ? defectItem.defect_name : "",
        type: "bar",
        stack: "defect",
        data: defectItem.value,
        itemStyle: defectItem.itemStyle,
      }));
    };

    useEffect(() => {
      // don't fetch if input is empty
      if (
        !input.line_name ||
        !input.month ||
        !input.part_no ||
        !input.process ||
        !input.shift ||
        !input.sub_line
      ) {
        return;
      }

      console.log("fetchPchart trigger by 'input'");
      fetchPChart(mapToPChartRecordGraphReqBody(input));
    }, [
      input.line_name,
      input.month,
      input.part_no,
      input.process,
      input.shift,
      input.sub_line,
    ]);

    const showModal = () => {
      setIsModalVisible(true);
    };

    const closeModal = () => {
      setIsModalVisible(false);
    };
    const showHistoryModal = () => {
      setIsHistoryModalVisible(true);
      setRefreshKey((prev) => prev + 1);
    };

    const closeHistoryModal = () => {
      setIsHistoryModalVisible(false);
    };

    const [chartOption, setChartOption] =
      useState<EChartsOption>(defaultGrapData);
    // console.log("chartOption:", chartOption);
    const toChartOption = (
      graphData: PChartRecordGraphResult
    ): EChartsOption => {
      // const legendData = graphData.defect.map((a) => a.defect_name);

      // // Split the legendData array into 2 rows
      // const middle = Math.ceil(legendData.length / 2);
      // const legendRow1 = legendData.slice(0, middle);
      // const legendRow2 = legendData.slice(middle);
      return {
        backgroundColor: "#ffffff", // พื้นหลังสีขาว
        // legend: {
        //   // data: ["%Defect", "Actual Defect (Q'ty)", "UCL Target", "P-bar"],
        //   left: "5%", // ย้าย legend ไปทางซ้าย
        //   textStyle: {
        //     color: "#000000", // ตัวหนังสือสีดำ
        //     fontSize: 12,
        //   },
        // },
        legend: {
          type: "scroll",
          orient: "horizontal",
          // right: 10,
          // top: 20,
          left: "5%", // ย้าย legend ไปทางซ้าย
          textStyle: {
            color: "#000000", // ตัวหนังสือสีดำ
            fontSize: 12,
          },
          // bottom: 20,
          // height: 120,
          // itemGap: 20,
          // width: "80%",
          data: graphData.defect.map((a) => a.defect_name),
        },
        // legend: [
        //   {
        //     type: "scroll",
        //     data: [legendRow1, legendRow2],
        //     orient: "horizontal",
        //     left: "5%", // ย้าย legend ไปทางซ้าย
        //     textStyle: {
        //       color: "#000000", // ตัวหนังสือสีดำ
        //       fontSize: 12,
        //     },
        //     // top: "bottom", // First row at bottom
        //     itemGap: 20,
        //   },
        //   {
        //     type: "scroll",
        //     data: legendRow2,
        //     orient: "horizontal",
        //     left: "5%", // ย้าย legend ไปทางซ้าย
        //     textStyle: {
        //       color: "#000000", // ตัวหนังสือสีดำ
        //       fontSize: 12,
        //     },
        //     // top: "bottom", // Second row: offset a bit higher to place above the first row
        //     top: 20, // Or use 'top', e.g., top: '90%' if you prefer
        //     itemGap: 20,
        //   },
        // ],
        // legend: {
        //   show: false, // Hide built-in legend
        // },
        grid: {
          left: 30,
          containLabel: true,
          bottom: 30,
          top: 60,
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
          // position: function (point, params, dom, rect, size) {
          //   // `point` is [x, y] of mouse
          //   // We want to show the tooltip below the point
          //   var x = point[0];
          //   var y = point[1];
          //   var tooltipHeight = size.contentSize[1];
          //   var chartHeight = size.viewSize[1];

          //   // Make sure tooltip does not go outside the chart
          //   // 10 is a bottom margin
          //   var top = Math.min(y + 200, chartHeight - tooltipHeight - 10);
          //   return [x, top];
          // },
        },
        xAxis: [
          {
            type: "category",
            // data: Array.from({ length: 30 }, (_, i) => i + 1),
            data: graphData.x_axis_label,
            name: "Day",
            nameLocation: "center",
            nameGap: 25,
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
            min: graphData.y_left_axis[0], // ตั้งค่าต่ำสุดของแกน Y
            max: graphData.y_left_axis[-1],
          },
          {
            type: "value",
            name: "%Ratio",
            position: "right",
            min: graphData.y_right_axis[0], // ตั้งค่าต่ำสุดของแกน Y
            max: graphData.y_right_axis[-1],
            axisLabel: {
              formatter: "{value} %",
              color: "#000000",
            },
          },
        ],
        series: [
          // {
          //   name: "Actual Defect (Q'ty)",
          //   type: "bar",
          //   stack: "defect",
          //   data: [],
          //   itemStyle: {
          //     color: {
          //       type: "linear", // Use linear gradient for rainbow effect
          //       x: 0, // Gradient start point (x-axis)
          //       y: 0, // Gradient start point (y-axis)
          //       x2: 1, // Gradient end point (x-axis)
          //       y2: 0, // Gradient end point (y-axis)
          //       colorStops: [
          //         { offset: 0, color: "red" },
          //         { offset: 0.25, color: "orange" },
          //         { offset: 0.5, color: "yellow" },
          //         { offset: 0.75, color: "green" },
          //         { offset: 1, color: "blue" },
          //       ],
          //     },
          //   },
          //   tooltip: {
          //     formatter: function () {
          //       return "";
          //     },
          //   },
          // },
          {
            name: "%Defect",
            type: "line",
            smooth: true,
            symbol: "circle",
            yAxisIndex: 1,
            data: graphData.percent_defect,
            itemStyle: {
              color: "#73C0DE", // เปลี่ยนสีเส้น
            },
            lineStyle: {
              width: 2,
            },
            symbolSize: 8,
          },
          {
            name: "UCL Target",
            type: "line",
            step: "middle",
            symbol: "none",
            yAxisIndex: 1,
            showSymbol: false,
            data: graphData.ucl_target,
            itemStyle: {
              color: "red", // เปลี่ยนสีเส้น
            },
            lineStyle: {
              type: "solid",
              color: "red",
              width: 1.5,
              symbolSize: 0,
            },
          },
          {
            name: "P-bar",
            type: "line",
            data: graphData.p_bar,
            symbol: "none",
            showSymbol: false,
            itemStyle: {
              color: "#2ECC71", // เปลี่ยนสีเส้น
            },
            lineStyle: {
              type: "dotted",
              color: "#2ECC71",
              width: 1.5,
              symbolSize: 0,
            },
          },
          ...toDeflectStackBarGraph(graphData.defect),
          // ...toDeflectStackBarGraph(visibleData),
        ],
      };
    };
    // const categoryColors: Record<string, string> = {
    //   Computers: "#5470c6",
    //   Phones: "#91cc75",
    //   Tablets: "#fac858",
    //   Entertainment: "#ee6666",
    //   Gaming: "#73c0de",
    //   Accessories: "#3ba272",
    //   IoT: "#fc8452",
    //   Audio: "#9a60b4",
    //   Photography: "#ea7ccc",
    //   Displays: "#5470c6",
    //   Office: "#91cc75",
    //   Network: "#fac858",
    // };
    const LegendItem = ({
      item,
      isHidden,
    }: {
      item: (typeof sortedLegendData)[0];
      isHidden: boolean;
    }) => {
      // console.log("item:", item);
      return (
        <Button
          onClick={() => toggleSeries(item.defect_name)}
          className={`flex  items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-100 w-full text-left ${
            isHidden ? "opacity-50" : ""
          }`}
          style={{
            padding: "2px",
            margin: "2px",
            opacity: isHidden ? 0.5 : 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* <div
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: isHidden ? "#ccc" : item.color }}
            // style={{ backgroundColor: item.color }}
          /> */}
            <div
              style={{
                width: "15px",
                height: "15px",
                background: item.color,
                border: "0px",
                borderRadius: "4px",
                // solid: item.color,
              }}
            ></div>
            {/* <Badge color={item.color} /> */}
            <div className="flex-1 min-w-0 " style={{ margin: "1px" }}>
              <div
                className={`${
                  isHidden ? "line-through text-gray-400" : "text-gray-700"
                }`}
                style={{ fontSize: "12px" }}
              >
                {item.defect_name}
              </div>
              {/* <div className="text-xs text-gray-500">
            {item.category} • {item.percentage}%
          </div> */}
            </div>
          </div>
          {/* <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
          {item?.value}
        </span> */}
        </Button>
      );
    };

    const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
    // const generateColor = (index: number, total: number) => {
    //   const hue = (index * 360) / total;
    //   return `rgb(${hue}, 65, 55)`;
    // };
    const generateColor = (index: number, total: number) => {
      const hue = (index * 360) / total;
      return `hsl(${hue}, 65%, 55%)`;
    };

    const legendData = useMemo(() => {
      return chartData?.map((item, index) => ({
        id: item.id,
        defect_name: item.defect_name,
        value: item.value,
        // category: item.category,
        color: generateColor(index, chartData?.length),
        // percentage: (
        //   (item.value / chartData?.reduce((sum, d) => sum + d.value, 0)) *
        //   100
        // ).toFixed(1),
      }));
    }, [chartData]);
    // console.log("legendData:", legendData);
    const sortedLegendData = useMemo(() => {
      return [...legendData].sort((a: any, b: any) => b.value - a.value);
    }, [legendData]);

    const toggleSeries = (name: string) => {
      // console.log("name:", name);
      const newHidden = new Set(hiddenSeries);
      if (newHidden.has(name)) {
        newHidden.delete(name);
      } else {
        newHidden.add(name);
      }
      setHiddenSeries(newHidden);
    };
    const visibleData = useMemo(() => {
      return legendData
        .filter((item) => !hiddenSeries.has(item.defect_name))
        .map((item) => ({
          id: item.id,
          value: item.value,
          defect_name: item.defect_name,
          itemStyle: { color: item.color },
        }));
    }, [legendData, hiddenSeries]);

    // Function to select all legend items
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
        // console.log("name:", name);
        if (!["%Defect", "UCL Target", "P-bar"].includes(name)) {
          chartRef.current.getEchartsInstance().dispatchAction({
            type: "legendUnSelect",
            name,
          });
        }
      });
    };
    console.log("chartOption:", chartOption);
    // console.log("HiddenSeries:", hiddenSeries);
    return (
      // <ConfigProvider
      //   theme={{
      //     components: {
      //       Badge: {
      //         dotSize: 20,
      //         /* here is your component tokens */
      //       },
      //     },
      //   }}
      // >
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
              Defect (In-line Defect)
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
          <Col style={{ marginLeft: "auto" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              <Button type="primary" onClick={showHistoryModal}>
                History record
              </Button>
              <Button type="primary" onClick={showModal}>
                Action record
              </Button>
            </div>
          </Col>
        </Row>
        <div style={{ borderRadius: "7px 7px", backgroundColor: "#fff" }}>
          {/* <div className="border rounded-lg p-4 bg-gray-50">
            <div
              // className="overflow-y-auto pr-2"
              className="scrollbox"
              style={{
                height: "70px",
                overflow: "auto",

                // scrollbarWidth: "thin",
                // scrollbarColor: "#cbd5e1 #f1f5f9",
              }}
            >
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gridAutoFlow: "row",
                  // height: "100px",
                }}
              >
                {sortedLegendData.map((item) => (
                  <LegendItem
                    key={item.defect_name}
                    item={item}
                    isHidden={hiddenSeries.has(item.defect_name)}
                  />
                ))}
              </div>
            </div> */}
          {/* Dynamic legend info */}
          {/* <div className="text-center pt-2 border-t mt-2">
              <span className="text-xs text-gray-500">
                Showing {legendData.length - hiddenSeries.size} of{" "} */}
          {/* {legendData.length} items •{Object.keys(categoryColors).length}{" "} */}
          {/* categories • Scroll vertically ↓
              </span>
            </div>
          </div> */}
          {/* Custom scrollbar styling */}
          <ReactECharts
            // option={option}
            ref={chartRef}
            option={chartOption}
            notMerge={true}
            style={{
              height: "500px",
              width: "100%",
              margin: "0 0 7px 0",
              borderRadius: "0 0 7px 7px",
            }}
          />
          <div
            style={{ display: "flex", justifyContent: "center", color: "red" }}
          >
            ***Defect Repeat จะไม่ขึ้นกราฟ***
          </div>
        </div>

        <PreviewPopup
          visible={isModalVisible}
          onClose={closeModal}
          input={input}
          username={username}
        />
        <HistoryPopup
          visible={isHistoryModalVisible}
          onClose={closeHistoryModal}
          input={input}
          username={username}
          refresh_key={refreshKey}
        />
      </Layout>
      // </ConfigProvider>
    );
  }
);

PChart.displayName = "PChart";

export default PChart;
