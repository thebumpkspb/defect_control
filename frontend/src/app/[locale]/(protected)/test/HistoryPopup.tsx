"use client";

import React from "react";
import { Modal } from "antd";
import "./PreviewPopup.css";
import { PChartPreviewPopupInput } from "@/types/pChart";

import HistoryRecordTable from "./HistoryRecordTable";

interface PreviewPopupProps {
  visible: boolean;
  onClose: () => void;
  input: PChartPreviewPopupInput;
  shift?: string;
  username: string;
  refresh_key?: number;
  // pChartRecordTableSelectedDefectMode: string;
}

export const HistoryPopup: React.FC<PreviewPopupProps> = ({
  visible,
  onClose,
  input,
  username,
  refresh_key,
  // pChartRecordTableSelectedDefectMode,
}) => {
  //   const [tableVisible, setTableVisible] = useState<boolean>(false);
  //   useEffect(() => {
  //     setTimeout(function () {
  //       // console.log("Delayed message");
  //     }, 1000);
  //     setTableVisible(visible);
  //   }, [visible]);
  return (
    <Modal
      title={"History Table"}
      open={visible}
      footer={null}
      onCancel={onClose}
      width={1200} // Increased width for a more spacious layout
      bodyStyle={{ paddingBottom: "40px" }} // Adds space at the bottom
      //   afterOpenChange={setTableVisible(true)}
      //   onClose={setTableVisible(false)}
    >
      <div>
        <HistoryRecordTable
          visible={visible}
          input={{
            //   month: convertFullDateToYearMonth(input.date),
            month: input.month,
            line_name: input.line_name,
            part_no: input.part_no,
            shift: input.shift,
            process: input.process,
            sub_line: input.sub_line,
            line_code_rx: null,
          }}
          username={username}
          refresh_key={refresh_key}
        />
      </div>
    </Modal>
  );
};
