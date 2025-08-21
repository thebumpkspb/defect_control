"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export interface PChartRecordDefect {
  defect_name: string;
  value: number[];
}

export interface PChartRecordGraphResult {
  month: string;
  line_name: string;
  part_no: string;
  shift: string;
  process: string;
  sub_line: string;
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

const defectColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#A3E635",
  "#F472B6",
  "#60A5FA",
  "#FBBF24",
  "#34D399",
  "#818CF8",
  "#F87171",
];

// interface PChartGraphProps {
//   data: PChartRecordGraphResult;
// }

const ChartJSComponent: React.FC<any> = ({ data }) => {
  const [dataSets, setDatasets] = useState<any>([]);
  const [option, setOptions] = useState<any>([]);
  console.log("data:", data);
  useEffect(() => {
    const datasets = [
      // Defect stacked bars
      ...data.defect?.map((def: any, i: any) => ({
        label: def.defect_name,
        data: def.value,
        backgroundColor: defectColors[i % defectColors.length],
        stack: "defectStack",
        type: "bar" as const,
        borderWidth: 1,
        yAxisID: "y",
        hidden: false,
      })),
      // %Defect line
      {
        label: "%Defect",
        type: "line" as const,
        yAxisID: "y1",
        data: data.percent_defect,
        borderColor: "#73C0DE",
        backgroundColor: "#73C0DE33",
        tension: 0.4,
        pointStyle: "circle",
        pointRadius: 6,
        pointBackgroundColor: "#73C0DE",
        borderWidth: 2,
        fill: false,
      },
      // UCL Target line
      {
        label: "UCL Target",
        type: "line" as const,
        data: data.ucl_target,
        yAxisID: "y1",
        borderColor: "red",
        backgroundColor: "red",
        borderDash: [5, 3],
        borderWidth: 1.5,
        fill: false,
        pointRadius: 0,
      },
      // P-bar dotted line
      {
        label: "P-bar",
        type: "line" as const,
        data: data.p_bar,
        yAxisID: "y1",
        borderColor: "#2ECC71",
        backgroundColor: "#2ECC71",
        borderDash: [2, 2],
        borderWidth: 1.5,
        fill: false,
        pointRadius: 0,
      },
    ];
    const option: ChartOptions<"bar" | "line"> = {
      maintainAspectRatio: false,
      // responsive: true,
      backgroundColor: "#fff",
      plugins: {
        legend: {
          display: true,
          position: "top",
          align: "start",
          labels: {
            color: "#000000",
            font: { size: 12 },
          },
          // "scroll" is not a Chart.js option, but you may customize further here
        },
        // title: {
        //   display: true,
        //   text: "P Chart Graph",
        //   color: "#000000",
        //   font: { size: 16 },
        // },
        // tooltip: {
        //   mode: "index",
        //   intersect: false,
        //   backgroundColor: "#fff",
        //   borderColor: "#888",
        //   borderWidth: 1,
        //   titleColor: "#333",
        //   bodyColor: "#000",
        //   // callbacks: {
        //   //   label: function (context) {
        //   //     // Hide tooltip for bars with value 0, but always show for lines
        //   //     if (
        //   //       context.dataset.type === "bar" &&
        //   //       (context.raw === 0 || context.raw === null)
        //   //     )
        //   //       return "";
        //   //     if (context.dataset.label && context.formattedValue)
        //   //       return `${context.dataset.label}: ${context.formattedValue}`;
        //   //     return "";
        //   //   },
        //   // },
        // },
      },
      layout: {
        padding: {
          left: 30,
          right: 30,
          top: 60,
          bottom: 30,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Day",
            color: "#333",
          },
          ticks: {
            color: "#000",
          },
          grid: {
            color: "#eee",
          },
          stacked: true,
        },
        y: {
          title: {
            display: true,
            text: "Q'ty (pcs.)",
            color: "#000",
          },
          min: data.y_left_axis[0],
          max: data.y_left_axis[data.y_left_axis.length - 1],
          ticks: {
            color: "#000",
            callback: (val) => `${val} pcs.`,
          },
          grid: {
            color: "#eee",
          },
          stacked: true,
          position: "left",
        },
        y1: {
          title: {
            display: true,
            text: "%Ratio",
            color: "#000",
          },
          min: data.y_right_axis[0],
          max: data.y_right_axis[data.y_right_axis.length - 1],
          ticks: {
            color: "#000",
            callback: (val) => `${val} %`,
          },
          position: "right",
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
    setDatasets(datasets);
    setOptions(option);
  }, [data]);
  console.log("data:", data);

  const chartData: ChartData<"bar" | "line"> = {
    labels: data.x_axis_label,
    datasets: dataSets,
  };
  console.log("chartData:", chartData);
  console.log("options:", option);
  // if (data.length > 0) {
  return (
    <div
      style={{
        height: "500px",
        width: "100%",
        margin: "0 0 7px 0",
        borderRadius: "0 0 7px 7px",
      }}
    >
      <Chart type="bar" data={chartData} options={option} />
    </div>
  );
  // } else {
  // return <div></div>;
  // }
};

export default ChartJSComponent;
