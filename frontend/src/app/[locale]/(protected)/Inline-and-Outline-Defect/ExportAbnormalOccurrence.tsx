"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Button, Table, Typography, Row, Col, Space, Flex, Modal } from "antd";
import { TablePaginationConfig } from "antd";
import { AlignType } from "rc-table/lib/interface";
import {
  AbnormalOccurrenceTable,
  CauseOfAbnormalResult,
} from "@/types/inlineOutlineDefectSumApi";
import { inlineOutlineExportAbnormalOccurrenceDownload } from "@/lib/api";
import { InlineOutlineInput } from "@/types/inlineOutline";

interface ExportAbnormalOccurrenceProp {
  // dataSource: CauseOfAbnormalResult;
  input: InlineOutlineInput;
  username: string;
}

const ExportAbnormalOccurrence: React.FC<ExportAbnormalOccurrenceProp> = ({input, username}) => {
// download export excel button logic
const [loadingExportFile, setLoadingExportFile] = useState(false);

const handleDownloadExportFile = async () => {
  const missingFields = [];

    if (!input.month) {
      missingFields.push("Month/Year");
    }
    if (!input.line || input.line?.length === 0) {
      missingFields.push("Line");
    }

    // Show a modal if there are missing fields
    if (missingFields.length > 0) {
      Modal.warning({
        title: "Missing Information",
        content: `Please Select the following fields:\n${missingFields.join(
          "\n"
        )}`,
        okText: "OK",
      });
      return; // Exit the function to prevent submission
    }

  setLoadingExportFile(true);
  await inlineOutlineExportAbnormalOccurrenceDownload({"month": input.month, "line": input.line || []});
  setLoadingExportFile(false);
};

return (
    <Button
      type="primary"
      style={{ marginBottom: "10px" }}
      onClick={handleDownloadExportFile}
    >
      {loadingExportFile ? "Downloading..." : "Export" }
    </Button>
);
}

export default ExportAbnormalOccurrence;
