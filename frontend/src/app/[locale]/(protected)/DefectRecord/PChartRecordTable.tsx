import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Divider,
  Input,
  Modal,
  Popconfirm,
  Table,
  TableColumnsType,
  Tag,
  Typography,
} from "antd";
import AddNewRecord, { AddNewRecordRef } from "./AddNewRecord";

const { Title } = Typography;

import "./PChartRecordTable.css";
import { PChartTableInput } from "@/types/pChart";
import {
  PChartRecordTableRequest,
  PChartRecordTableResult,
} from "@/types/pChartApi";
import {
  biWeeklyApproval,
  dailyApproval,
  pChartRecordTable,
  pChartRecordTableNoErr,
  weeklyApproval,
} from "@/lib/api";
import { ColumnsType } from "antd/es/table";
import { shiftList } from "@/master_data/masterdata";
import { ExpandableConfig } from "antd/es/table/interface";
import { delay, useAwaitableState } from "@/functions";
import { FixedType } from "rc-table/lib/interface";
import LoadingModal from "@/components/modals/LoadingModal";
import TextDivider from "@/components/text-divider";
import { UserStore } from "@/store";
import { SearchOutlined } from "@ant-design/icons";
import debounce from "lodash.debounce";
import { first } from "lodash";

interface DataType {
  key: string;
  defectType: string;
  number: string;
  defectiveItems: string;
  // category:string[];
  children?: DataType[];
  isChild: boolean;
  mainDefectType?: string;
  // record_by?:string;
  total?: number;
  [key: string]:
    | number[]
    | string
    | string[]
    | number
    | boolean
    | undefined
    | DataType[];
}

interface BaseDataType {
  key: string;
  defectType: string;
  number: string;
  defectiveItems: string;
  category?: string[];
  isChild: boolean;
  mainDefectType?: string;
}

const putNumberToEachDayKey = (
  numbers: number[],
  baseObject: BaseDataType | any
): DataType => {
  // Extract the last number without modifying the original array
  const total = numbers[numbers.length - 1]; // Get the last element
  const days = numbers.slice(0, -1); // Get all elements except the last one

  // Create the object by spreading the baseObject and adding day properties dynamically
  const result = days.reduce<DataType>(
    (acc, value, index) => {
      acc[`day${index + 1}`] = value;
      return acc;
    },
    { ...baseObject, total }
  );
  // console.log("result:", result);
  return result;
};
const putStringToEachDayKey = (
  numbers: string[],
  baseObject: BaseDataType
): DataType => {
  // Extract the last number without modifying the original array
  // const total = numbers[numbers.length - 1]; // Get the last element
  const days = numbers.slice(0, -1); // Get all elements except the last one

  // Create the object by spreading the baseObject and adding day properties dynamically
  const result = days.reduce<any>(
    (acc, value, index) => {
      acc[`day${index + 1}`] = value;
      return acc;
    },
    { ...baseObject, total: "" }
  );

  return result;
};

const putElementToEachDayKey = (
  numbers: { shift_a: string | undefined; shift_b: string | undefined }[],
  baseObject: BaseDataType | any,
  shift: string | null
): DataType => {
  // console.log("numbers:", numbers);
  // Extract the last number without modifying the original array
  // const total = numbers[numbers.length - 1]; // Get the last element
  // const days = numbers.slice(0, -1); // Get all elements except the last one

  // Create the object by spreading the baseObject and adding day properties dynamically
  // const result = numbers.reduce<any>(
  //   (acc, subArray, outerIndex) => {
  //     console.log("subArray:", subArray);
  //     if (Array.isArray(subArray)) {
  //       console.log("it is");
  //       subArray.forEach((value, innerIndex) => {
  //         // Mapping logic inside reduce
  //         // const mappedValue = (
  //         //   <div>
  //         //     <div>{value?.shift_a}</div>
  //         //     <div>{value?.shift_b}</div>
  //         //   </div>
  //         // ); // Transform the value
  //         const mappedValue = (
  //           <div>
  //             <div>{value?.shift_a}</div>
  //             <div>{value?.shift_b}</div>
  //           </div>
  //         ); // Transform the value
  //         // acc[`day${outerIndex + 1}`] = [{ a: "s" }, { b: "g" }]; // Accumulate with dynamic keys
  //         acc[`day${outerIndex + 1}`] = ["a", "j"];
  //       });
  //     } else {
  //       // console.log("it is not");
  //       acc[`day${outerIndex + 1}`] = ["a", "j"];
  //       // console.log("it is not2");
  //     }
  //     return acc;
  //   },
  //   { ...baseObject, total: "" }
  // );
  // console.log("result:", result);
  const result = numbers.reduce<any>(
    (acc, value, index) => {
      // console.log("value:", value.shift_a);
      // if(value!=""){}
      // acc[`day${index + 1}`] = value;
      if (typeof value !== "string") {
        if (
          (value["shift_a"] != null && value["shift_b"] != null) ||
          shift == "All"
        ) {
          acc[`day${index + 1}`] = {
            shift_a: value.shift_a || null,
            shift_b: value.shift_b || null,
          };
        } else if (value["shift_a"] != null) {
          acc[`day${index + 1}`] = value.shift_a;
        } else if (value["shift_b"] != null) {
          acc[`day${index + 1}`] = value.shift_b;
        }
        // else {
        //   acc[`day${index + 1}`] = value.shift_a || value.shift_b;
        // }
      } else {
        acc[`day${index + 1}`] = value;
      }
      return acc;
    },
    { ...baseObject, total: "" }
  );
  // console.log("result:", result);
  return result;
};

const mapToProdQtyTableData = (data: PChartRecordTableResult): DataType => {
  const numbers = data.prod_qty;

  const baseObject = {
    key: "1",
    defectType: "Prod. Q'ty (n)",
    number: "",
    defectiveItems: "(B)",
    isChild: false,
  };

  // Create the object by spreading the baseObject and adding day properties dynamically
  return putNumberToEachDayKey(numbers, baseObject);
};

const mapToDefectQtyTableData = (data: PChartRecordTableResult): DataType => {
  const numbers = data.defect_qty;

  const baseObject = {
    key: "2",
    defectType: "Defect Q'ty (np)",
    number: "",
    defectiveItems: "(A)",
    isChild: false,
  };

  // Create the object by spreading the baseObject and adding day properties dynamically
  return putNumberToEachDayKey(numbers, baseObject);
};
const mapToUCLTargetTableData = (data: PChartRecordTableResult): DataType => {
  const numbers = data.ucl_target;

  const baseObject = {
    key: "0",
    defectType: "UCL Target",
    number: "",
    defectiveItems: "(A)",
    isChild: false,
    isShow: false,
  };

  // Create the object by spreading the baseObject and adding day properties dynamically
  return putNumberToEachDayKey(numbers, baseObject);
};
const mapToDefectRatioTableData = (data: PChartRecordTableResult): DataType => {
  const numbers = data.defect_ratio;

  const baseObject = {
    key: "3",
    defectType: "Defect Ratio",
    number: "",
    defectiveItems: "(A)/(B) x 100%",
    isChild: false,
  };

  // Create the object by spreading the baseObject and adding day properties dynamically
  return putNumberToEachDayKey(numbers, baseObject);
};

const mapToDeflectTypeRepeatTableData = (
  data: PChartRecordTableResult,
  expanded: boolean
): DataType | null => {
  const defectType = "Repeat";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `4_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on the table)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: "4",
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `4_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: "4",
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};

const mapToDeflectTypeRepeatNgTableData = (
  data: PChartRecordTableResult,
  expanded: boolean
): DataType | null => {
  const defectType = "Repeat NG";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `5_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on table if no data)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: "5",
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `5_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: "5",
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};

const mapToDeflectTypeScrapTableData = (
  data: PChartRecordTableResult,
  expanded: boolean
): DataType | null => {
  const defectType = "Scrap";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `6_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on table if no data)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: "6",
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `6_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: "6",
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};

const mapToDeflectTypeAppearanceTableData = (
  data: PChartRecordTableResult,
  expanded: boolean
): DataType | null => {
  const defectType = "Appearance";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `7_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on table if no data)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: "7",
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `7_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: "7",
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};

const mapToDeflectTypeDimensionTableData = (
  data: PChartRecordTableResult,
  expanded: boolean
): DataType | null => {
  const defectType = "Dimension";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `8_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on table if no data)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: "8",
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `8_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: "8",
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};

const mapToDeflectTypePerformanceTableData = (
  data: PChartRecordTableResult,
  expanded: boolean
): DataType | null => {
  const defectType = "Performance";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `9_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on table if no data)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: "9",
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `9_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: "9",
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};

const mapToDeflectTypeOtherTableData = (
  data: PChartRecordTableResult,
  expanded: boolean
): DataType | null => {
  const defectType = "Other";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `10_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on table if no data)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: "10",
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `10_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: "10",
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};

const mapToDeflectTypeMCSetupTableData = (
  data: PChartRecordTableResult,
  expanded: boolean
): DataType | null => {
  const defectType = "M/C Set up";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `11_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on table if no data)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: "11",
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `11_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: "11",
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};

const mapToDeflectTypeQualityTestTableData = (
  data: PChartRecordTableResult,
  expanded: boolean
): DataType | null => {
  const defectType = "Quality Test";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `12_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on table if no data)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: "12",
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `12_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: "12",
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};

const mapToDeflectTypeToTableData = (
  data: PChartRecordTableResult,
  defectType: string,
  initKey: string,
  expanded: boolean
): DataType | null => {
  // const defectType = "Quality Test";

  // Filter for items with the specified defectType
  const filteredItems = data.defect_table.filter(
    (item) => item.defect_type === defectType
  );

  if (expanded) {
    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.map((item, index) => {
      const baseObject = {
        key: `${initKey}_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    // If no matching items, return null (not show on table if no data)
    if (children.length === 0) {
      return null;
    }

    // Return the parent object with children
    return {
      key: initKey,
      defectType,
      number: "",
      defectiveItems: "",
      category: [],
      isChild: false,
      children,
    };
  } else {
    // case: expend

    if (filteredItems.length === 0) {
      return null;
    }

    // Map the filtered items to children objects
    const children: DataType[] = filteredItems.slice(1).map((item, index) => {
      const baseObject = {
        key: `${initKey}_${index + 1}`,
        defectType: item.defect_type,
        number: item.id.toString(),
        mainDefectType: defectType,
        defectiveItems: item.defect_item,
        category: item.category,
        isChild: true,
      };

      return putNumberToEachDayKey(item.value, baseObject);
    });

    const firstItem = filteredItems[0];

    const resObj = {
      key: initKey,
      defectType,
      number: firstItem.id.toString(),
      defectiveItems: firstItem.defect_item,
      category: firstItem.category,
      isChild: false,
      children,
    };
    return putNumberToEachDayKey(firstItem.value, resObj);
  }
};
//  'Repeat','Repeat NG','Scrap','Appearance','Dimension','Performance','Other',
//  'M/C Set up','Quality Test'

const mapToRecordByLLupTableData = (
  data: PChartRecordTableResult
): DataType => {
  // const numbers: number[] = []; // data.defect_ratio;
  const numbers = data.record_by;
  const baseObject = {
    key: "18",
    defectType: "Record by (LL up)",
    number: "",
    defectiveItems: "(1/D)",
    isChild: false,
  };

  // Create the object by spreading the baseObject and adding day properties dynamically
  return putStringToEachDayKey(numbers, baseObject);
};

const mapToReviewByTlTableData = (
  data: PChartRecordTableResult,
  shift: string | null
): DataType => {
  // const numbers: number[] = []; // data.defect_ratio;
  const numbers = data.review_by_tl;
  const baseObject = {
    key: "19",
    defectType: "Review by (TL)",
    number: "",
    // defectiveItems: "(1/D)",
    defectiveItems: (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "end" }}
      >
        <div style={{ paddingRight: "10px" }}>(1/D)</div>
        <div className="grid grid-cols-4 gap-4 ">
          <p className="text-center mb-1 min-h-[20px] leading-[20px]">
            Shift A
          </p>
          <Divider style={{ margin: "1px 0", borderColor: "#000" }} />
          <p className="text-center mt-1 min-h-[20px] leading-[20px]">
            Shift B
          </p>
        </div>
      </div>
    ),
    isChild: false,
  };

  // Create the object by spreading the baseObject and adding day properties dynamically
  return putElementToEachDayKey(numbers, baseObject, shift);
};

const mapToReviewByMgrTableData = (
  data: PChartRecordTableResult,
  shift: string | null
): DataType => {
  // const numbers: number[] = []; // data.defect_ratio;

  // const baseObject = {
  //   key: "15",
  //   defectType: "Review by (MGR)",
  //   number: "",
  //   defectiveItems: (
  //     <div
  //       style={{ display: "flex", alignItems: "center", justifyContent: "end" }}
  //     >
  //       <div style={{ paddingRight: "10px" }}>(1/W)</div>
  //       <div className="grid grid-cols-4 gap-4 ">
  //         <p className="text-center mb-1 min-h-[20px] leading-[20px]">
  //           Shift A
  //         </p>
  //         <Divider style={{ margin: "1px 0", borderColor: "#000" }} />
  //         <p className="text-center mt-1 min-h-[20px] leading-[20px]">
  //           Shift B
  //         </p>
  //       </div>
  //     </div>
  //   ),
  //   isChild: false,
  // };

  // // Create the object by spreading the baseObject and adding day properties dynamically
  // return putNumberToEachDayKey(numbers, baseObject);
  // const numbers: number[] = []; // data.defect_ratio;
  const numbers = data.review_by_mgr;
  const baseObject = {
    key: "20",
    defectType: "Review by (MGR)",
    number: "",
    // defectiveItems: "(1/D)",
    defectiveItems: (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "end" }}
      >
        <div style={{ paddingRight: "10px" }}>(1/W)</div>
        <div className="grid grid-cols-4 gap-4 ">
          <p className="text-center mb-1 min-h-[20px] leading-[20px]">
            Shift A
          </p>
          <Divider style={{ margin: "1px 0", borderColor: "#000" }} />
          <p className="text-center mt-1 min-h-[20px] leading-[20px]">
            Shift B
          </p>
        </div>
      </div>
    ),
    isChild: false,
  };

  // Create the object by spreading the baseObject and adding day properties dynamically
  return putElementToEachDayKey(numbers, baseObject, shift);
};

const mapToReviewByGmTableData = (
  data: PChartRecordTableResult,
  shift: string | null
): DataType => {
  // const numbers: number[] = []; // data.defect_ratio;

  // const baseObject = {
  //   key: "16",
  //   defectType: "Review by (GM)",
  //   number: "",
  //   defectiveItems: (
  //     <div
  //       style={{ display: "flex", alignItems: "center", justifyContent: "end" }}
  //     >
  //       <div style={{ paddingRight: "10px" }}>(2/M)</div>
  //       <div className="grid grid-cols-4 gap-4 ">
  //         <p className="text-center mb-1 min-h-[20px] leading-[20px]">
  //           Shift A
  //         </p>
  //         <Divider style={{ margin: "1px 0", borderColor: "#000" }} />
  //         <p className="text-center mt-1 min-h-[20px] leading-[20px]">
  //           Shift B
  //         </p>
  //       </div>
  //     </div>
  //   ),
  //   isChild: false,
  // };

  // // Create the object by spreading the baseObject and adding day properties dynamically
  // return putNumberToEachDayKey(numbers, baseObject);
  const numbers = data.review_by_gm;
  const baseObject = {
    key: "21",
    defectType: "Review by (GM)",
    number: "",
    // defectiveItems: "(1/D)",
    defectiveItems: (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "end" }}
      >
        <div style={{ paddingRight: "10px" }}>(2/M)</div>
        <div className="grid grid-cols-4 gap-4 ">
          <p className="text-center mb-1 min-h-[20px] leading-[20px]">
            Shift A
          </p>
          <Divider style={{ margin: "1px 0", borderColor: "#000" }} />
          <p className="text-center mt-1 min-h-[20px] leading-[20px]">
            Shift B
          </p>
        </div>
      </div>
    ),
    isChild: false,
  };

  // Create the object by spreading the baseObject and adding day properties dynamically
  return putElementToEachDayKey(numbers, baseObject, shift);
};

const defaultDefectTable = {
  id: 0,
  defect_type: "",
  defect_item: "",
  value: [],
};

const pChartRecordTableResultDefault = {
  month: "",
  line_name: "",
  part_no: "",
  shift: "",
  process: "",
  sub_line: "",
  index: [],
  prod_qty: [],
  defect_qty: [],
  defect_ratio: [],
  defect_table: [],
  record_by: [],
  review_by_tl: [],
  review_by_mgr: [],
  review_by_gm: [],
  ucl_target: [],
};

interface PChartTableProps {
  input: PChartTableInput;
  useruuid: string | undefined;
  username: string;
  handleRefreshPChart: () => void;
  refreshGeneralInfomation: () => void;
}

const PChartRecordTable: React.FC<PChartTableProps> = ({
  input,
  useruuid,
  username,
  handleRefreshPChart,
  refreshGeneralInfomation,
}) => {
  const addNewRecordRef = useRef<AddNewRecordRef>(null);
  const { isAdmin, isOP_up, isTL_up, isMGR_up, isGM_up } = UserStore.getState();
  // console.log("table -> username:", username);
  // const [isFetchingAllShiftOfTableData, setIsFetchingAllShiftOfTableData] = useState<boolean>(false);
  // const isFetchingRef = useRef(false);
  // console.log("input:", input);
  const [isLazyFetchingShiftAB, setIsLazyFetchingShiftAB] =
    useState<boolean>(false);
  const isFetchingShiftABRef = useRef(false);

  const [isFetchingTableShiftData, setIsFetchingTableShiftData] =
    useState<boolean>(false);

  const handleCloseHistoryRecordTable = () => {
    addNewRecordRef.current?.closeHistoryRecordTable();
  };

  const [isModalVisible, setIsModalVisible] = useState(false); // State สำหรับเปิด/ปิด Modal
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);

  // const [tableData, setTableData] = useState<DataType[]>([]);
  const [tableData, setTableData] = useAwaitableState<DataType[]>([]);
  const [filteredData, setFilteredData] = useState<DataType[]>([]);

  const [tableSourceData, setTableSourceData] =
    useAwaitableState<PChartRecordTableResult | null>(null);
  const tableSourceDataRef = useRef<PChartRecordTableResult | null>(null);

  const [expandedRowKeys, setExpandedRowKeys] = useAwaitableState<string[]>([]);

  const [expandRowDefectTypeList, setExpandDefectTypeList] = useAwaitableState<
    string[]
  >([]);
  const defaultExpandableTableConf: ExpandableConfig<DataType> = {
    onExpand: (expanded, record) => {
      setExpandDefectTypeList((prev) => {
        const updated = expanded
          ? [...prev, record.defectType]
          : prev.filter((item) => item !== record.defectType);

        // Call refresh only after both state updates are scheduled
        setExpandedRowKeys((prevKeys) => {
          const newKeys = expanded
            ? [...prevKeys, record.key]
            : prevKeys.filter((item) => item !== record.key);

          refreshExpandedRowTable(newKeys, updated, tableSourceDataRef.current);
          return newKeys;
        });

        return updated;
      });
    },
    rowExpandable: (record) => true,
    expandedRowKeys: expandedRowKeys,
    // defaultExpandAllRows: true,
    // expandedRowKeys: tableData
    //   .filter((item) => item.isShow !== false)
    //   .map((row) => row.key),
  };

  const toExpandableTableConf = (
    expandedRowKeys: string[]
  ): ExpandableConfig<DataType> => {
    return {
      onExpand: (expanded, record) => {
        setExpandDefectTypeList((prev) => {
          const updated = expanded
            ? [...prev, record.defectType]
            : prev.filter((item) => item !== record.defectType);

          // Call refresh only after both state updates are scheduled
          setExpandedRowKeys((prevKeys) => {
            const newKeys = expanded
              ? [...prevKeys, record.key]
              : prevKeys.filter((item) => item !== record.key);

            refreshExpandedRowTable(
              newKeys,
              updated,
              tableSourceDataRef.current
            );
            return newKeys;
          });

          return updated;
        });
      },
      expandedRowKeys: expandedRowKeys,
      // defaultExpandAllRows: true,
    };
  };

  const [expandableTableConf, setExpandableTableConf] = useAwaitableState<
    ExpandableConfig<DataType>
  >(defaultExpandableTableConf);
  const [filterDefectKeys, setFilterDefectKeys] = useState<any>("");
  // console.log("expandableTableConf:", expandableTableConf);
  const defaultColumn: TableColumnsType<DataType> = [
    {
      title: "Defect Type",
      dataIndex: "defectType",
      key: "defectType",
    },
    {
      title: "#",
      dataIndex: "number",
      key: "number",
    },
    {
      title: "Defective Items",
      dataIndex: "defectiveItems",
      key: "defectiveItems",
      render: (text: string, record: DataType, index: number) => {
        const isChild = record.key.includes("_");

        if (isChild) {
          return (
            <div style={{ textAlign: "left", textIndent: "15px" }}>
              {" "}
              {text}{" "}
            </div>
          );
        }

        if (record.children?.length || 0 > 0) {
          return <div style={{ textAlign: "left" }}> {text} </div>;
        } else {
          return <div style={{ textAlign: "right" }}> {text} </div>;
        }
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
    },
    ...Array.from({ length: 30 }, (_, i) => ({
      title: i + 1,
      dataIndex: `day${i + 1}`,
      key: `day${i + 1}`,
      onCell: (record: DataType, index?: number) => ({
        onClick: () => {
          if (
            record.isChild &&
            [
              "Repeat",
              "Repeat NG",
              "Scrap",
              "Appearance",
              "Dimension",
              "Performance",
              "Other",
              "M/C Set up",
              "Quality Test",
              "B-2",
              "Local",
              "CKD",
              "Sub Assy Line",
              "Store / Warehouse",
            ].includes(record.mainDefectType || "") &&
            (isOP_up() || isAdmin())
          ) {
            handleModalOpen(); // เปิด Modal
          }

          if (
            !record.isChild &&
            [
              "Repeat",
              "Repeat NG",
              "Scrap",
              "Appearance",
              "Dimension",
              "Performance",
              "Other",
              "M/C Set up",
              "Quality Test",
              "B-2",
              "Local",
              "CKD",
              "Sub Assy Line",
              "Store / Warehouse",
            ].includes(record.defectType || "") &&
            (isOP_up() || isAdmin())
          ) {
            handleModalOpen(); // เปิด Modal
          }

          // console.log(`Cell clicked on Day ${i + 1}`); // Debug: ดูว่าคลิกเซลล์ใด
          // console.log(
          //   `data type key: ${record.key} isChild: ${record.isChild}`
          // );
          // console.log(
          //   `defectType: ${record.defectType} defectMain: ${record.mainDefectType}`
          // );
        },
      }),
    })),
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
  ];

  const [tableColumn, setTableColumn] =
    useAwaitableState<TableColumnsType<DataType>>(defaultColumn);

  const [shiftABTableData, setShiftABTableData] = useState<
    PChartRecordTableResult[]
  >([]);

  const lazyFetchShiftABPChartTable = async (
    input: PChartRecordTableRequest
  ) => {
    let mergedData: PChartRecordTableResult[] = [];

    setIsLazyFetchingShiftAB(true);

    const notFetchedShiftList = shiftList.filter(
      (item) =>
        item.value !== (tableSourceData?.shift || null) && item.value !== "All"
    );

    try {
      // Use Promise.all to wait for all asynchronous calls to complete
      const results = await Promise.all(
        notFetchedShiftList.map(async (shift) => {
          const response = await pChartRecordTableNoErr({
            month: input.month,
            line_name: input.line_name,
            part_no: input.part_no,
            shift: shift.value,
            process: input.process,
            sub_line: input.sub_line,
          });
          // console.log(
          //   "lazyFetchShiftABPChartTable() response.p_chart_record_table_result:",
          //   response.p_chart_record_table_result
          // );
          return response.p_chart_record_table_result;
        })
      );

      // Merge all results into one array
      mergedData = results.flat().concat(tableSourceData || []); // Flatten the array of arrays
      console.log("lazyFetchShiftABPChartTable() mergedData:", mergedData);

      // Set the merged data
      setShiftABTableData(mergedData);

      setIsLazyFetchingShiftAB(false);

      return Promise.resolve(mergedData);
    } catch (error) {
      console.log("Error pchart table data:", error);

      setIsLazyFetchingShiftAB(false);
      return Promise.reject(error);
    }
  };

  const resetExpandedRowTable = async () => {
    await setExpandedRowKeys([]);

    await setExpandDefectTypeList([]);

    await setExpandableTableConf({
      ...defaultExpandableTableConf,
      expandedRowKeys: expandedRowKeys,
      // defaultExpandAllRows: true,
    });

    refreshExpandedRowTable(
      expandedRowKeys,
      expandRowDefectTypeList,
      tableSourceData
    );
  };
  // console.log("expandedRowKeys:", expandedRowKeys);
  const refreshExpandedRowTable = (
    expandedRowKeys: string[],
    expandRowDefectTypeList: string[],
    tableSourceData: PChartRecordTableResult | null
  ) => {
    if (tableSourceData == null) {
      console.log("refreshExpandedRowTable: tableSoureData is null");
      return;
    }

    // console.log(
    //   "refreshExpandedRowTable: expandRowDefectTypeList:",
    //   expandRowDefectTypeList
    // );

    // console.log("refreshExpandedRowTable: expandedRowKeys:", expandedRowKeys);

    // update expansion / constriction when user click expand row button
    setExpandableTableConf(toExpandableTableConf(expandedRowKeys));
    const data = mapToTableData(tableSourceData, expandRowDefectTypeList);
    setTableData(data);
    // console.log(
    //   "data.map((row) => row.key):",
    //   data.map((row) => row.key)
    // );
    // console.log("expandRowDefectTypeList:", expandRowDefectTypeList);
    // setExpandedRowKeys(
    //   data
    //     .filter(
    //       (item) => Array.isArray(item.children) && item.children.length > 0
    //     )
    //     .map((row) => row.key)
    // );

    setTableColumn(mapToTableColumn(tableSourceData));
  };

  const fetchPChartTable = async (input: PChartRecordTableRequest) => {
    // { "month": "November-2024", "line_name": "414454 - Sta. Assy : PA70 Type", "part_no": "TG428000-0630", "shift": "B", "process": "Inline" }

    setIsFetchingTableShiftData(true);
    try {
      const response = await pChartRecordTableNoErr({
        month: input.month,
        line_name: input.line_name,
        part_no: input.part_no,
        shift: input.shift,
        process: input.process,
        sub_line: input.sub_line,
      });

      const selectedRecordTableData =
        response.p_chart_record_table_result.find((item) => {
          return item.shift === input.shift;
        }) || pChartRecordTableResultDefault;

      if (selectedRecordTableData) {
        setTableData([]);
        setTableColumn(mapToTableColumn(selectedRecordTableData));
        await setTableSourceData(selectedRecordTableData);

        refreshExpandedRowTable(
          expandedRowKeys,
          expandRowDefectTypeList,
          selectedRecordTableData
        );

        setShiftABTableData([selectedRecordTableData]);

        console.log("fetchPChartTable() [selectedRecordTableData]:", [
          selectedRecordTableData,
        ]);
      }
    } catch (error) {
      setTableData(mapToTableData(pChartRecordTableResultDefault, []));
      setTableColumn(defaultColumn);
      setExpandDefectTypeList([]);
      // setShiftABTableData([])
      console.log("Error pchart table data:", error);
    } finally {
      setIsFetchingTableShiftData(false);
    }
  };
  const handleApproval = async (defectType: any, date: any) => {
    // console.log(`Approve -> defectType:${defectType} , date :${date}`);

    if (
      !input.line_name ||
      !input.month ||
      !input.part_no ||
      !input.process ||
      !input.shift ||
      isModalVisible == true
    ) {
      return;
    }
    if (defectType == "Review by (TL)") {
      const resDailyApprove = await dailyApproval({
        month: input.month,
        line_name: input.line_name,
        part_no: input.part_no,
        shift: input.shift,
        process: input.process,
        sub_line: input.sub_line,
        date: date,
        user_uuid: useruuid,
        user_name: username,
      }); // subtract the date by 1 day
    } else if (defectType == "Review by (MGR)") {
      const resWeeklyApprove = await weeklyApproval({
        month: input.month,
        line_name: input.line_name,
        part_no: input.part_no,
        shift: input.shift,
        process: input.process,
        sub_line: input.sub_line,
        date: date,
        user_uuid: useruuid,
        user_name: username,
      }); // subtract the date by 1 day
    } else if (defectType == "Review by (GM)") {
      const resBiWeeklyApprove = await biWeeklyApproval({
        month: input.month,
        line_name: input.line_name,
        part_no: input.part_no,
        shift: input.shift,
        process: input.process,
        sub_line: input.sub_line,
        date: date,
        user_uuid: useruuid,
        user_name: username,
      }); // subtract the date by 1 day
    }
    setShiftABTableData([]); // reset shift A and B data when user add new record

    fetchPChartTable(input)
      .then((res) => {
        handleRefreshPChart();
        refreshGeneralInfomation();

        // fetch every shift data when user open qty modal to change shift only
        // return fetchEveryShiftPChartTable(input);
      })
      .then((res) => {
        console.log("fetchEveryShiftPChartTable after daily approve success");
      });
  };
  const mapToTableData = (
    data: PChartRecordTableResult,
    expandDefectType: string[]
  ): DataType[] => {
    const deflectTypeRepeatTableData = mapToDeflectTypeRepeatTableData(
      data,
      expandDefectType.includes("Repeat")
    );
    const deflectTypeRepeatNGTableData = mapToDeflectTypeRepeatNgTableData(
      data,
      expandDefectType.includes("Repeat NG")
    );
    const deflectTypeScrapTableData = mapToDeflectTypeScrapTableData(
      data,
      expandDefectType.includes("Scrap")
    );
    const deflectTypeAppearanceTableData = mapToDeflectTypeAppearanceTableData(
      data,
      expandDefectType.includes("Appearance")
    );
    const deflectTypeDimensionTableData = mapToDeflectTypeDimensionTableData(
      data,
      expandDefectType.includes("Dimension")
    );
    const deflectTypePerformanceTableData =
      mapToDeflectTypePerformanceTableData(
        data,
        expandDefectType.includes("Performance")
      );
    const deflectTypeOtherTableData = mapToDeflectTypeOtherTableData(
      data,
      expandDefectType.includes("Other")
    );
    const deflectTypeMCSetupTableData = mapToDeflectTypeMCSetupTableData(
      data,
      expandDefectType.includes("M/C Set up")
    );
    const deflectTypeQualityTestTableData =
      mapToDeflectTypeQualityTestTableData(
        data,
        expandDefectType.includes("Quality Test")
      );
    const deflectTypeB2TableData = mapToDeflectTypeToTableData(
      data,
      "B-2",
      "13",
      expandDefectType.includes("B-2")
    );
    const deflectTypeLocalTableData = mapToDeflectTypeToTableData(
      data,
      "Local",
      "14",
      expandDefectType.includes("Local")
    );
    const deflectTypeCKDTableData = mapToDeflectTypeToTableData(
      data,
      "CKD",
      "15",
      expandDefectType.includes("CKD")
    );
    const deflectTypeSubAssyLineTableData = mapToDeflectTypeToTableData(
      data,
      "Sub Assy Line",
      "16",
      expandDefectType.includes("Sub Assy Line")
    );
    const deflectTypeStoreWarehouseTableData = mapToDeflectTypeToTableData(
      data,
      "Store / Warehouse",
      "17",
      expandDefectType.includes("Store / Warehouse")
    );

    // const deflectTypeQualityTestTableData =
    // mapToDeflectTypeQualityTestTableData(
    //   data,
    //   expandDefectType.includes("Quality Test")
    // );

    return [
      // {
      //   key: "1",
      //   defectType: "Prod. Q'ty (n)",
      //   number: "",
      //   defectiveItems: "(B)",
      //   isChild: false,
      // },
      ...(data.prod_qty ? [mapToProdQtyTableData(data)] : ([] as DataType[])),
      // {
      //   key: "2",
      //   defectType: "Defect Q'ty (np)",
      //   number: "",
      //   defectiveItems: "(A)",
      //   isChild: false,
      // },
      ...(data.defect_qty
        ? [mapToDefectQtyTableData(data)]
        : ([] as DataType[])),
      ...(data.ucl_target
        ? [mapToUCLTargetTableData(data)]
        : ([] as DataType[])),
      // mapToDefectQtyTableData(data),
      // {
      //   key: "3",
      //   defectType: "Defect Ratio",
      //   number: "",
      //   defectiveItems: "(A)/(B) x 100%",
      //   isChild: false,
      // },
      ...(data.defect_ratio
        ? [mapToDefectRatioTableData(data)]
        : ([] as DataType[])),
      // mapToDefectRatioTableData(data),
      // {
      //   key: "4",
      //   defectType: "Repeat",
      //   number: "1",
      //   defectiveItems: "Defect detail - Defect mode",
      //   isChild: false,
      //   children: [
      //     {
      //       key: "4_1",
      //       defectType: "Repeat",
      //       number: "1",
      //       mainDefectType: "Repeat",
      //       defectiveItems: "Defect detail - Defect mode",
      //       isChild: true,
      //     },
      //   ],
      // },
      ...(deflectTypeRepeatTableData ? [deflectTypeRepeatTableData] : []),

      ...(deflectTypeRepeatNGTableData ? [deflectTypeRepeatNGTableData] : []),

      ...(deflectTypeScrapTableData ? [deflectTypeScrapTableData] : []),

      ...(deflectTypeAppearanceTableData
        ? [deflectTypeAppearanceTableData]
        : []),

      ...(deflectTypeDimensionTableData ? [deflectTypeDimensionTableData] : []),

      ...(deflectTypePerformanceTableData
        ? [deflectTypePerformanceTableData]
        : []),

      ...(deflectTypeOtherTableData ? [deflectTypeOtherTableData] : []),

      ...(deflectTypeMCSetupTableData ? [deflectTypeMCSetupTableData] : []),

      ...(deflectTypeQualityTestTableData
        ? [deflectTypeQualityTestTableData]
        : []),

      ...(deflectTypeB2TableData ? [deflectTypeB2TableData] : []),

      ...(deflectTypeLocalTableData ? [deflectTypeLocalTableData] : []),

      ...(deflectTypeCKDTableData ? [deflectTypeCKDTableData] : []),

      ...(deflectTypeSubAssyLineTableData
        ? [deflectTypeSubAssyLineTableData]
        : []),

      ...(deflectTypeStoreWarehouseTableData
        ? [deflectTypeStoreWarehouseTableData]
        : []),

      // mapToRecordByLLupTableData(data),
      ...(isTableHasValue(data)
        ? [mapToRecordByLLupTableData(data)]
        : ([] as DataType[])),

      // mapToReviewByTlTableData(data),
      ...(isTableHasValue(data)
        ? [mapToReviewByTlTableData(data, input.shift)]
        : ([] as DataType[])),

      // mapToReviewByMgrTableData(data),
      ...(isTableHasValue(data)
        ? [mapToReviewByMgrTableData(data, input.shift)]
        : ([] as DataType[])),

      // mapToReviewByGmTableData(data),
      ...(isTableHasValue(data)
        ? [mapToReviewByGmTableData(data, input.shift)]
        : ([] as DataType[])),
    ];
  };

  const isTableHasValue = (data: PChartRecordTableResult): boolean => {
    return data.prod_qty.length > 0;
  };
  // console.log("s:", tableSourceData);
  useEffect(() => {
    // if (tableSourceData) {
    //   setTableColumn(mapToTableColumn(tableSourceData));
    // }
    const debouncedFilter = debounce(() => {
      if (filterDefectKeys.length > 0) {
        const result = tableData.map((item) => {
          if (item.children) {
            const filteredChildren = item.children.filter((child) =>
              child.defectiveItems
                .toString()
                .toLowerCase()
                .includes(filterDefectKeys.toLowerCase())
            );
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            } else {
              // Remove children property
              const { children, ...rest } = item;
              return rest;
            }
          }
          return item;
        });
        setFilteredData(result);
        // if (tableSourceData) {
        //   setTableColumn(mapToTableColumn(tableSourceData));
        // }
      }

      // Replace with your API call or action
      // console.log('API call for:', query);
    }, 500);
    if (filterDefectKeys) {
      debouncedFilter();
    } else {
      setFilteredData(tableData);
    }

    return () => {
      debouncedFilter.cancel();
    };
  }, [filterDefectKeys, tableData]);
  // console.log("FilteredData", filteredData);
  // console.log("filterDefectKeys:", filterDefectKeys);
  // const debouncedSearch = useMemo(
  //   () =>
  //     debounce((query: any) => {
  //       // API call or logic here
  //       setFilterDefectKeys(query);
  //       console.log("Searching for:", query);
  //     }, 500),
  //   []
  // );
  // const handleChange = (e: any) => {
  //   debouncedSearch(e.target.value);
  // };
  // useEffect(() => {
  //   return () => debouncedSearch.cancel();
  // }, [debouncedSearch]);
  const mapToTableColumn = (
    data: PChartRecordTableResult
  ): ColumnsType<DataType> => {
    // console.log("mapToTableColumn:", data);
    return [
      {
        title: "Defect Type",
        dataIndex: "defectType",
        key: "defectType",
        fixed: "left" as FixedType,
        width: 230,
        render: (text: string, record: DataType, index: number) => {
          // console.log("record:", record);
          if (text == "Repeat") {
            return <div>{text + " (ไม่นับ%Defect)"}</div>;
          }
          // else if (text == "Repeat NG") {
          //   return <div>{text + " (นับ%Defect)"}</div>;
          // }
          else {
            return text;
          }
        },
      },
      {
        title: "#",
        dataIndex: "number",
        key: "number",
        fixed: "left" as FixedType,
      },
      {
        title: "Defective Items",
        // title: (
        //   <div>
        //     Defective Items
        //     <Input
        //       placeholder="Search defect"
        //       value={filterDefectKeys}
        //       onChange={(e) => {
        //         setFilterDefectKeys(e.target.value);
        //       }}
        //       // onChange={handleChange}
        //       allowClear
        //     />
        //   </div>
        // ),
        dataIndex: "defectiveItems",
        key: "defectiveItems",
        fixed: "left" as FixedType,
        render: (text: string, record: DataType, index: number) => {
          const isChild = record.key.includes("_");

          if (isChild) {
            return (
              <div style={{ textAlign: "left", textIndent: "15px" }}>
                {" "}
                {text}{" "}
              </div>
            );
          }

          if (record.children?.length || 0 > 0) {
            return <div style={{ textAlign: "left" }}> {text} </div>;
          } else {
            return <div style={{ textAlign: "right" }}> {text} </div>;
          }
        },
        // filterDropdown: ({
        //   setSelectedKeys,
        //   selectedKeys,
        //   confirm,
        //   clearFilters,
        // }) => (
        //   <div style={{ padding: 8 }}>
        //     <Input
        //       // ref={searchInputRef}
        //       placeholder="Search name"
        //       value={selectedKeys[0] || ""}
        //       onChange={(e) => {
        //         setSelectedKeys(e.target.value ? [e.target.value] : []);
        //         confirm({ closeDropdown: false });
        //       }}
        //       onPressEnter={() => {
        //         confirm();
        //         // handleSearch(selectedKeys);
        //       }}
        //       style={{ width: 188, marginBottom: 8, display: "block" }}
        //     />
        //     <Button
        //       type="primary"
        //       onClick={() => {
        //         // confirm();
        //         confirm({ closeDropdown: false });
        //         // handleSearch(selectedKeys);
        //       }}
        //       icon={<SearchOutlined />}
        //       size="small"
        //       style={{ width: 90, marginRight: 8 }}
        //     >
        //       Search
        //     </Button>
        //     <Button
        //       onClick={() => {
        //         // handleReset(clearFilters);
        //         // clearFilters()
        //       }}
        //       size="small"
        //       style={{ width: 90 }}
        //     >
        //       Reset
        //     </Button>
        //   </div>
        // ),
        // filterIcon: (filtered) => (
        //   <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        // ),
        // onFilter: (value, record) => {
        //   // console.log("record:", record);
        //   const bool =
        //     record["defectiveItems"]
        //       .toString()
        //       .toLowerCase()
        //       .includes((value as string).toLowerCase()) ||
        //     record["isChild"] == false;
        //   return bool;
        // },
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        fixed: "left" as FixedType,
        width: 120,
        render: (tags) => {
          // console.log("tags: ", tags, " color:", color);
          return (
            <div className="tagRow">
              {tags?.map((tag: string) => {
                let color = "default";
                switch (tag) {
                  case "Man":
                    color = "geekblue";
                    break;
                  case "Machine":
                    color = "green";
                    break;
                  case "Method":
                    color = "orange";
                    break;
                  case "Material":
                    color = "gold";
                    break;
                  case "Measurement":
                    color = "cyan";
                    break;
                  case "Environment":
                    color = "purple";
                    break;
                }
                return (
                  <Tag color={color} key={tag}>
                    {tag.slice(0, 3)}
                  </Tag>
                );
              })}
            </div>
          );
        },
        onCell: (record, index) => {
          return {
            style: {
              padding: "5px",
            },
          };
        },
      },
      // render: (text: string, record: DataType, index: number) => {
      //   const isChild = record.key.includes("_");

      //   if (isChild) {
      //     return (
      //       <div style={{ textAlign: "left", textIndent: "15px" }}>
      //         {" "}
      //         {text}{" "}
      //       </div>
      //     );
      //   }

      //   if (record.children?.length || 0 > 0) {
      //     return <div style={{ textAlign: "left" }}> {text} </div>;
      //   } else {
      //     return <div style={{ textAlign: "right" }}> {text} </div>;
      //   }
      // },
      // },
      ...data.index.slice(0, -1).map((day, dayIndex) => ({
        title: day,
        dataIndex: `day${dayIndex + 1}`,
        key: `day${dayIndex + 1}`,
        width: 70,
        // render: (text: string, record: DataType, index: number) => {
        //   let backgroundColor = "";

        //   if (data.ucl_target) {
        //     // console.log(
        //     //   "data.ucl_target[Number(day) - 1]",
        //     //   data.ucl_target[Number(day) - 1]
        //     // );
        //     // console.log(
        //     //   "data.defect_ratio[Number(day) - 1]",
        //     //   data.defect_ratio[Number(day) - 1]
        //     // );
        //     if (
        //       data.ucl_target[Number(day) - 1] <
        //       data.defect_ratio[Number(day) - 1]
        //     ) {
        //       // console.log("TRUE");
        //       console.log("backgroundColor:", backgroundColor);
        //       backgroundColor = "#AA4A44";
        //     }
        //   }
        //   // console.log("backgroundColor:", backgroundColor);
        //   return {
        //     props: {
        //       style: { background: backgroundColor },
        //     },
        //     children: <div>{text}</div>,
        //   };
        // },
        render: (text: any, record: any) => {
          // console.log("record krub:", record);
          if (
            !record.isChild &&
            ["Review by (TL)", "Review by (MGR)", "Review by (GM)"].includes(
              record.defectType || ""
            )
          ) {
            // console.log("record krub:", record);
            if (
              record[`day${dayIndex + 1}`] == "" &&
              ((record.defectType == "Review by (TL)" &&
                isTL_up() &&
                record.defectType == "Review by (MGR)" &&
                isMGR_up() &&
                record.defectType == "Review by (GM)" &&
                isGM_up()) ||
                isAdmin())
            ) {
              return (
                <Popconfirm
                  title={`Are you sure to check ${record.defectType} ?.`}
                  onConfirm={() =>
                    handleApproval(
                      record.defectType,
                      toDateMonthYearFormat(day, input.month)
                    )
                  }
                  okText="Yes"
                  cancelText="No"
                >
                  {text || (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        // backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      &nbsp;
                    </div>
                  )}
                </Popconfirm>
              );
            } else if (typeof record[`day${dayIndex + 1}`] == "string") {
              return text;
            } else {
              return (
                <div className="grid grid-cols-4 gap-4">
                  <p className="text-center mb-1 min-h-[20px] leading-[20px]">
                    {record[`day${dayIndex + 1}`]?.shift_a || "\u00A0"}
                  </p>
                  <Divider style={{ margin: "1px 0", borderColor: "#000" }} />
                  <p className="text-center mt-1 min-h-[20px] leading-[20px]">
                    {record[`day${dayIndex + 1}`]?.shift_b || "\u00A0"}
                  </p>
                </div>
              );
            }
          } else {
            return text;
            // console.log("record krub:", record);
            // return (
            //   <ul>
            //     {record[`day${dayIndex + 1}`].map((address, index) => (
            //       <li key={index}>
            //         {/* {address.street}, {address.city}, {address.state} */}
            //         {address}
            //       </li>
            //     ))}
            //   </ul>
            // );
          }
          // Render text for records that do not meet the condition
          return text;
        },
        onCell: (record: DataType, index?: number) => {
          let backgroundColor = "#fff";
          let fontColor = "#000";
          if (data.ucl_target) {
            if (record.defectType == "Defect Ratio")
              if (
                data.ucl_target[Number(day) - 1] <
                data.defect_ratio[Number(day) - 1]
              ) {
                backgroundColor = "#f3a3a1";
              }
          }
          if (record[`day${day}`] == 0) {
            fontColor = "#7b8486";
          }
          // console.log("record:", record);
          return {
            onClick: () => {
              if (index && data.ucl_target) {
                // console.log(
                //   "data.ucl_target[Number(day) - 1] :",
                //   data.ucl_target[Number(day) - 1]
                // );
                // console.log(
                //   "data.defect_ratio[Number(day) - 1]:",
                //   data.defect_ratio[Number(day) - 1]
                // );
              }
              // console.log("onClick: record", record);
              // console.log("index:", index);
              // do not allow user to click on black cell
              if (record.number === "") {
                return;
              }
              // console.log("isOP_up():", isOP_up());
              // console.log("isAdmin():", isAdmin());
              // console.log("(isOP_up() || isAdmin()):", isOP_up() || isAdmin());
              if (
                record.isChild &&
                [
                  "Repeat",
                  "Repeat NG",
                  "Scrap",
                  "Appearance",
                  "Dimension",
                  "Performance",
                  "Other",
                  "M/C Set up",
                  "Quality Test",
                  "B-2",
                  "Local",
                  "CKD",
                  "Sub Assy Line",
                  "Store / Warehouse",
                ].includes(record.mainDefectType || "") &&
                input.shift != "All" &&
                (isOP_up() || isAdmin())
              ) {
                handleModalOpen(); // เปิด Modal
                setSelectDayNum((dayIndex || 0) + 1);
                setSelectDate(toDateMonthYearFormat(day, input.month));
                setSelectDefectType(record.defectType);
                setSelectDefectQty((record[`day${day}`] as number) || 0);
                setSelectDefectMode(record.defectiveItems);

                // console.log("month:", input.month);
                // console.log("day:", day);
                // console.log("date:", toDateMonthYearFormat(day, input.month));
                // console.log("qty record:", record);
                // console.log(
                //   "qty record (record[`day${day}`]):",
                //   record[`day${day}`]
                // );
              }

              if (
                !record.isChild &&
                [
                  "Repeat",
                  "Repeat NG",
                  "Scrap",
                  "Appearance",
                  "Dimension",
                  "Performance",
                  "Other",
                  "M/C Set up",
                  "Quality Test",
                  "B-2",
                  "Local",
                  "CKD",
                  "Sub Assy Line",
                  "Store / Warehouse",
                ].includes(record.defectType || "") &&
                input.shift != "All" &&
                (isOP_up() || isAdmin())
              ) {
                handleModalOpen(); // เปิด Modal
                setSelectDayNum((dayIndex || 0) + 1);
                setSelectDate(toDateMonthYearFormat(day, input.month));
                setSelectDefectType(record.defectType);
                setSelectDefectQty((record[`day${day}`] as number) || 0);
                setSelectDefectMode(record.defectiveItems);

                // console.log("month:", input.month);
                // console.log("day:", day);
                // console.log("date:", toDateMonthYearFormat(day, input.month));
              }
              // if (
              //   !record.isChild &&
              //   ["Review by (TL)"].includes(record.defectType || "")
              // ) {
              //   handleApprovalModalOpen();
              //   setSelectDayNum((dayIndex || 0) + 1);
              //   setSelectDate(toDateMonthYearFormat(day, input.month));
              // }
              // console.log(`Cell clicked on Day ${index || 0 + 1}`); // Debug: ดูว่าคลิกเซลล์ใด
              // console.log(
              //   `data type key: ${record.key} isChild: ${record.isChild}`
              // );
              // console.log(
              //   `defectType: ${record.defectType} defectMain: ${record.mainDefectType}`
              // );
            },
            style: {
              padding:
                !record.isChild &&
                [
                  "Record by (LL up)",
                  "Review by (TL)",
                  "Review by (MGR)",
                  "Review by (GM)",
                ].includes(record.defectType || "")
                  ? "5px"
                  : "2",
              backgroundColor: backgroundColor,
              color: fontColor,
            },
          };
        },
      })),
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        width: 100,
      },
    ];
  };

  const toDateMonthYearFormat = (
    day: string,
    monthYear: string | null
  ): string => {
    if (monthYear === null || day === null) {
      return "";
    }

    return `${day}-${monthYear}`;
  };

  // format: DD-<MONTH>-YYYY
  // ex. 4-November-2024
  const [selectDate, setSelectDate] = useState<string>("");
  const [selectDayNum, setSelectDayNum] = useState<number>(1);
  const [selectDefectType, setSelectDefectType] = useState<string>("");
  const [selectDefectQty, setSelectDefectQty] = useState<number>(0);
  const [selectDefectMode, setSelectDefectMode] = useState<string>("");

  const handleModalOk = () => {
    setIsModalVisible(false); // ปิด Modal

    if (
      !input.line_name ||
      !input.month ||
      !input.part_no ||
      !input.process ||
      !input.shift
    ) {
      return;
    }

    setShiftABTableData([]); // reset shift A and B data when user add new record

    fetchPChartTable(input)
      .then((res) => {
        handleRefreshPChart();
        refreshGeneralInfomation();
        // return fetchEveryShiftPChartTable(input);
      })
      .then((res) => {
        console.log("fetchEveryShiftPChartTable success");
      });
  };

  const handleModalOpen = () => {
    setIsModalVisible(true);
  };
  // const handleApprovalModalOpen = () => {
  //   setIsApprovalModalVisible(true);
  // };

  const handleModalCancel = () => {
    setIsModalVisible(false); // ปิด Modal
    handleCloseHistoryRecordTable();
  };
  // console.log("input:", input);
  useEffect(() => {
    // console.log("shiftABTableData:", shiftABTableData);
  }, [shiftABTableData]);
  // console.log("tableData:", tableData);
  useEffect(() => {
    if (
      !input.line_name ||
      !input.month ||
      !input.part_no ||
      !input.process ||
      !input.shift ||
      !input.sub_line ||
      isModalVisible == true
    ) {
      // console.log("input:", input);
      // console.log("isModalVisible:", isModalVisible);
      // console.log("555555");
      return;
    }

    setShiftABTableData([]); // reset shift A and B data when user add new record

    fetchPChartTable(input)
      .then((res) => {
        handleRefreshPChart();
        refreshGeneralInfomation();

        // fetch every shift data when user open qty modal to change shift only
        // return fetchEveryShiftPChartTable(input);
      })
      .then((res) => {
        console.log("fetchEveryShiftPChartTable success");
      });
  }, [
    input.line_name,
    input.month,
    input.part_no,
    input.process,
    input.shift,
    input.sub_line,
    isModalVisible,
  ]);

  useEffect(() => {
    tableSourceDataRef.current =
      tableSourceData || pChartRecordTableResultDefault;
  }, [tableSourceData]);
  console.log("filteredData:", filteredData);
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f0f2f5",
        borderRadius: "7px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "left",
          alignItems: "center",
          alignContent: "center",
          marginBottom: "10px",
        }}
      >
        <h1 style={{ textAlign: "left", fontSize: "18px" }}>
          Defect Record Table
        </h1>
        <div
          style={{
            marginLeft: "30px",
            display: "flex" /*, alignItems: "center" */,
            flexDirection: "row",
            alignItems: "center",
            alignContent: "center",
          }}
        >
          {/* <div style={{ display: "flex", alignItems: "center" }}> */}
          <h3
            style={{
              // marginTop: "0px",
              fontSize: "16px",
            }}
          >
            Search Defect
          </h3>
          {/* </div> */}
          <div>
            <Input
              placeholder="Search defect"
              value={filterDefectKeys}
              onChange={(e) => {
                setFilterDefectKeys(e.target.value);
              }}
              // onChange={handleChange}
              allowClear
              style={{
                marginLeft: "10px",
                width: 188 /*, marginBottom: 8 , display: "block"*/,
              }}
            />
          </div>
        </div>
      </div>
      <Table
        expandable={expandableTableConf}
        // rowkey={(record) => record.key}
        loading={isFetchingTableShiftData}
        rowKey={"key"}
        columns={tableColumn}
        // dataSource={tableData.filter((item) => item.isShow !== false)}
        dataSource={filteredData.filter((item) => item.isShow !== false)}
        bordered
        pagination={false}
        scroll={{ x: "max-content", y: 500 }}
        style={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          overflow: "hidden",
          // height: "40px",
        }}
        rowClassName={(record, index) => {
          if (record.isChild) {
            return "row-default";
          }

          const keyAsInt = parseInt(record.key, 10);

          return keyAsInt % 2 === 0 ? "row-white" : "row-grey";
        }}
      />

      {/* Modal */}
      <AddNewRecord
        isModalVisible={isModalVisible}
        handleModalOk={handleModalOk}
        handleModalCancel={handleModalCancel}
        input={input}
        pChartPageSelectedDayNum={selectDayNum}
        pChartPageSelectedDate={selectDate}
        pChartPageSelectedDefectType={selectDefectType}
        username={username}
        pChartPageSelectedDefectQty={selectDefectQty}
        // pChartRecordTableSelectedDefectType={selectDefectType}
        pChartRecordTableSelectedDefectMode={selectDefectMode}
        pChartRecordTableSelectedShift={input.shift}
        // pChartRecordTableEveryShiftData={everyShiftTableData}
        pChartRecordTableShiftABData={shiftABTableData}
        triggerLazyFetchShiftABData={async () => {
          return lazyFetchShiftABPChartTable(input);
        }}
        ref={addNewRecordRef}
      />

      <LoadingModal visible={isLazyFetchingShiftAB} />
    </div>
  );
};

export default PChartRecordTable;
