import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  InputNumber,
  Modal,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Typography,
  Radio,
  Row,
  Col,
  Flex,
  Space,
  Table,
  message,
  AutoComplete,
  Spin,
} from "antd";
import type { GetRef, InputRef, RadioChangeEvent } from "antd";
import Image from "next/image";
import { CalendarOutlined } from "@ant-design/icons";
import PreviewPopup from "./PreviewPopup";
import { PChartTableInput } from "@/types/pChart";
import dayjs, { Dayjs } from "dayjs";
import {
  addNewRecordSave,
  addNewRecordView,
  addNewRecordViewByPart,
  changeNewRecordView,
  checkOverUCLTarget,
  getAmountActionRecord,
  pChartCtlSubLinesByPartLine,
} from "@/lib/api";
import {
  AddNewRecordSaveRequest,
  AddNewRecordViewResult,
  ChangeAddNewRecordViewResult,
  DefectData,
  PChartRecordTableResult,
  PChartSubLines,
} from "@/types/pChartApi";
import { defectType } from "@/master_data/masterdata";
import plusSign from "@/assets/plus-sign.svg";
import { it } from "node:test";
import { convertFullDateToYearMonth, delay } from "@/functions";
import HistoryRecordTable from "./HistoryRecordTable";
import { LayoutStore } from "@/store";
import { pics } from "@/constants/setting";

const { Text } = Typography;
const { TextArea } = Input;

type TextAreaRef = GetRef<typeof TextArea>; // ✅ This is correct

const { Title } = Typography;
const { Option } = Select;

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
  index: [],
  prod_qty: [],
  defect_qty: [],
  defect_ratio: [],
  defect_table: [],
};

const defaultAddNewRecordViewResult = {
  date: "",
  line_name: [],
  process: [],
  sub_line: [],
  part_no: [],
  defect_type: "",
  defect_mode: [],
  defect_qty_A: 0,
  defect_qty_B: 0,
  id: 0,
  creator: "",
  comment_shift_A: "",
  comment_shift_B: "",
};
const defaultDefectData = [
  {
    date: "",
    line_name: "",
    process: "",
    sub_line: "",
    part_no: "",
    defect_type: "",
    defect_mode: "",
  },
];

const defaultAddNewRecordSave = {
  id: 0,
  date: "",
  line_name: "",
  defect_type: "",
  defective_items: "",
  process: "",
  sub_line: "",
  part_no: "",
  defect_qty_A: null,
  defect_qty_B: null,
  pic: null,
  creator: "",
  comment: "",
};

export function convertToDateString(parsedDate: Dayjs): string {
  if (!dayjs.isDayjs(parsedDate)) {
    throw new Error("Input is not a valid Dayjs object");
  }

  return parsedDate.format("YYYY-MM-DD");
}

interface AddNewRecordProps {
  isModalVisible: boolean;
  handleModalOk: () => void;
  handleModalCancel: () => void;
  input: PChartTableInput;
  pChartPageSelectedDayNum: number;
  pChartPageSelectedDate: string;

  pChartPageSelectedDefectType: string | null;
  pChartPageSelectedDefectQty: number | null;
  pChartRecordTableSelectedDefectMode: string | null;
  username: string;
  pChartRecordTableSelectedShift: string | null;
  pChartRecordTableShiftABData: PChartRecordTableResult[];
  triggerLazyFetchShiftABData: () => Promise<PChartRecordTableResult[]>;
}

export interface AddNewRecordRef {
  closeHistoryRecordTable: () => void;
}

const AddNewRecord = forwardRef<AddNewRecordRef, AddNewRecordProps>(
  (
    {
      isModalVisible,
      handleModalOk,
      handleModalCancel,
      input,
      pChartPageSelectedDayNum,
      pChartPageSelectedDate,
      pChartPageSelectedDefectType,
      username,

      pChartRecordTableSelectedDefectMode,
      pChartRecordTableSelectedShift,
      pChartRecordTableShiftABData,
      triggerLazyFetchShiftABData,
    },

    ref
  ) => {
    const closeHistoryRecordTable = () => {
      closeHistoryRecordTableVisible();
    };

    useImperativeHandle(ref, () => ({
      closeHistoryRecordTable,
    }));
    // const { isLoading, setIsLoading } = LayoutStore.getState();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const commentInputRef = useRef<TextAreaRef>(null);

    // const dateInputRef = useRef<HTMLDivElement>(null);
    // const defectTypeInputRef = useRef<HTMLDivElement>(null);
    // const defectModeInputRef = useRef<HTMLDivElement>(null);
    // const partNoInputRef = useRef<HTMLDivElement>(null);
    // const subLineInputRef = useRef<HTMLDivElement>(null);
    // const historyTableRef = useRef<TableRef>(null);
    const historyTableRef = useRef<HTMLDivElement>(null);

    const isModalVisibleRef = useRef<boolean>(false);

    const [defectQty, setDefectQty] = useState<number>(0);
    // const [defectQtyTobeAddedShiftA, setDefectQtyToBeAddedShiftA] = useState<number>(0);
    // const [defectQtyTobeAddedShiftB, setDefectQtyToBeAddedShiftB] = useState<number>(0);

    const [shift, setShift] = useState<string>("B");
    const shiftRef = useRef<string>("");
    const [isVisibleOverUCL, setIsVisibleOverUCL] = useState<boolean>(false);
    // const [comment, setComment] = useState<string>("");
    const [commentShiftA, setCommentShiftA] = useState<string>("");
    const [commentShiftB, setCommentShiftB] = useState<string>("");
    const [subLines, setSubLines] = useState<PChartSubLines[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    // console.log("isFocused:", isFocused);
    // const [selectedSubLine, setSelectedSubLine] = useState<string | null>(
    //   input.sub_line
    // );
    const fetchSubLines = async () => {
      // if (selectedLineId === null && selectedPartNo === null) {
      //   return;
      // }
      setIsLoading(true);
      try {
        const response = await pChartCtlSubLinesByPartLine(
          input.line_code_rx,
          createForm.part_no
        );
        // console.log("Parts:", response.parts);
        setSubLines(response.sub_lines);
        if (response.sub_lines.length == 1) {
          // setSelectedSubLine(response.sub_lines[0].rxno_part);
          setCreateForm((prev) => ({
            ...prev,
            sub_line: response.sub_lines[0].rxno_part,
          }));
        }
      } catch (error) {
        setSubLines([]);
        // setSelectedSubLine(null);
        setCreateForm((prev) => ({
          ...prev,
          sub_line: null,
        }));
        // handleResetPChart();
        console.error("Error fetching line settings:", error);
      }
      setIsLoading(false);
    };
    const handleSelectShift = (e: RadioChangeEvent) => {
      const selectedShift = e.target.value;
      setShift(selectedShift);

      setDefectQty(0); // reset defect qty if shift changes

      closeHistoryRecordTableVisible();

      // const runAfterShiftSelected = async (
      //   shiftABData: PChartRecordTableResult[],
      //   selectedShift: string,
      //   selectedDefectMode: string,
      //   selectedDefectType: string,
      //   selectedDayNum: number
      // ) => {
      //   const selectedTableData =
      //     shiftABData.find((item) => item.shift === selectedShift) ||
      //     pChartRecordTableResultDefault;

      //   const selectedQtyListByShiftDefect =
      //     selectedTableData.defect_table.find(
      //       (item) =>
      //         item.defect_item === selectedDefectMode &&
      //         item.defect_type === selectedDefectType
      //     ) || defaultDefectTable;

      //   const selectedQty =
      //     selectedQtyListByShiftDefect.value[selectedDayNum - 1] || 0;

      //   setDefectQty(selectedQty);
      //   closeHistoryRecordTableVisible();
      // };

      // if (
      //   isNeededToFetchShiftABData(pChartRecordTableShiftABData, selectedShift)
      // ) {
      //   (async () => {
      //     console.log("handleSelectShift() isNeededToFetchShiftABData: start");
      //     const shiftABData = await triggerLazyFetchShiftABData();

      //     console.log(
      //       "handleSelectShift() isNeededToFetchShiftABData: trigger end"
      //     );
      //     await runAfterShiftSelected(
      //       shiftABData,
      //       selectedShift,
      //       pChartRecordTableSelectedDefectMode || "",
      //       pChartPageSelectedDefectType || "",
      //       pChartPageSelectedDayNum
      //     );

      //     console.log("handleSelectShift() isNeededToFetchShiftABData: end");
      //   })();
      //   return; // guard: exit early
      // }

      // runAfterShiftSelected(
      //   pChartRecordTableShiftABData,
      //   selectedShift,
      //   pChartRecordTableSelectedDefectMode || "",
      //   pChartPageSelectedDefectType || "",
      //   pChartPageSelectedDayNum
      // ); // fallback if no fetch needed
    };

    const handleKeypadClick = (value: string | number) => {
      if (value === "delete") {
        setDefectQty((prev) => Math.floor(prev / 10));
        // shift === 'A' ? setDefectQtyToBeAddedShiftA(prev => Math.floor(prev / 10)) : setDefectQtyToBeAddedShiftB(prev => Math.floor(prev / 10));
      } else if (value === "clear") {
        setDefectQty(0);
        // shift === 'A' ? setDefectQtyToBeAddedShiftA(0) : setDefectQtyToBeAddedShiftB(0);
      } else {
        setDefectQty((prev) => parseInt(`${prev}${value}`, 10));
        // shift === 'A' ? setDefectQtyToBeAddedShiftA(prev => parseInt(`${prev}${value}`, 10)) : setDefectQtyToBeAddedShiftB(prev => parseInt(`${prev}${value}`, 10));
      }
    };

    const isNeededToFetchShiftABData = (
      pChartRecordTableShiftABData: PChartRecordTableResult[],
      selectedShift: string
    ) => {
      return (
        pChartRecordTableShiftABData.find(
          (item) => item.shift === selectedShift
        ) === undefined
      );
    };

    const mapToCreateFormBeforeSubmit = (
      shift: string,
      qty: number,
      commentShiftA: string,
      commentShiftB: string,
      // subLine:string,
      req: AddNewRecordSaveRequest
    ): AddNewRecordSaveRequest => {
      return {
        ...req,
        defect_qty_A: shift === "A" ? qty : null,
        defect_qty_B: shift === "B" ? qty : null,
        comment: shift === "A" ? commentShiftA : commentShiftB,
        // sub_line:subLine
        // comment: comment,
      };
    };
    const mapToCheckBeforeSubmit = (
      shift: string,
      qty: number,
      commentShiftA: string,
      commentShiftB: string,
      req: AddNewRecordSaveRequest
    ): AddNewRecordSaveRequest => {
      return {
        ...req,
        defect_qty_A: shift === "A" ? qty : null,
        defect_qty_B: shift === "B" ? qty : null,
        comment: shift === "A" ? commentShiftA : commentShiftB,
        // comment: comment,
      };
    };
    const handleOnClickOk = async () => {
      if (!createForm.sub_line) {
        message.warning("โปรดเลือก Sub Line ก่อนบันทึกข้อมูล");
        return;
      }
      // setIsLoading(true);
      // console.log("add new record handleOnClickOk create form:", createForm);
      // const resCheck = await checkOverUCLTarget({
      //   month: input.month,
      //   line_name: input.line_name,
      //   part_no: input.part_no,
      //   shift: shift || input.shift,
      //   process: input.process,
      //   sub_line: input.sub_line,
      //   date: selectedDate?.format("YYYY-MM-DD"),
      //   defect_qty: defectQty,
      //   defect_type: createForm.defect_type,
      // }); // subtract the date by 1 day
      // const resAmountActionRecord = await getAmountActionRecord({
      //   month: input.month,
      //   line_name: input.line_name,
      //   part_no: input.part_no,
      //   shift: shift || input.shift,
      //   process: input.process,
      //   sub_line: input.sub_line,
      //   date: selectedDate?.format("YYYY-MM-DD"),
      // });
      // const is_over = resCheck.check_over_ucl_target.is_over;
      // const amount_action_record =
      //   resAmountActionRecord.get_amount_action_record.amount_action_record;
      // console.log("resCheck:", resCheck.check_over_ucl_target.is_over);
      // console.log(
      //   "resAmountActionRecord:",
      //   resAmountActionRecord.get_amount_action_record.amount_action_record
      // );
      // if (is_over == true) {
      //   console.log("over");
      //   if (amount_action_record != null) {
      //     console.log("have amount_action_record");
      //     if (amount_action_record <= 0) {
      //       console.log("amount_action_record<=0");
      //       handleOverUCLTarget();
      //       setIsLoading(false);
      //     } else {
      //       console.log("amount_action_record>0");
      //       await addNewRecordSave(
      //         mapToCreateFormBeforeSubmit(
      //           shift,
      //           defectQty, // addedDefectQty,
      //           commentShiftA,
      //           commentShiftB,
      //           createForm
      //         )
      //       );
      //       handleModalOk();
      //       closeHistoryRecordTableVisible();
      //       setIsLoading(false);
      //     }
      //   } else {
      //     setIsLoading(false);
      //     // console.log("amount_action_record:", amount_action_record);
      //   }
      // } else {
      //   console.log("not over");
      if (defectQty > 0) {
        setIsLoading(true);
        const res = await addNewRecordSave(
          mapToCreateFormBeforeSubmit(
            shift,
            defectQty, // addedDefectQty,
            commentShiftA,
            commentShiftB,
            // selectedSubLine,
            createForm
          )
        );
        if (res) {
          message.success("เพิ่มข้อมูลงานเสียสำเร็จ");
        }

        // handleModalOk();
        // closeHistoryRecordTableVisible();
        setDefectQty(0);
        setIsLoading(false);
      } else {
        message.info("โปรดกรอกยอดของเสียให้มากกว่า 0");
      }

      // setIsLoading(false);
      // }
      // setIsLoading(false);
      // disable this logic for now
      // if (createForm.date) {
      //   const previousDate = dayjs(createForm.date, "YYYY-MM-DD").subtract(
      //     1,
      //     "day"
      //   );
      //   createForm.date = convertToDateString(previousDate);
      // } else {
      //   console.error("createForm.date is not defined or invalid");
      // }

      // const addedDefectQty = shift === "A" ? defectQtyTobeAddedShiftA + defectQty : defectQtyTobeAddedShiftB + defectQty;
      // //!!!!!
      // handleOverUCLTarget();
      // //!!!!!!!
      // await addNewRecordSave(
      //   mapToCreateFormBeforeSubmit(
      //     shift,
      //     defectQty, // addedDefectQty,
      //     commentShiftA,
      //     commentShiftB,
      //     createForm
      //   )
      // );
      // handleModalOk();

      // closeHistoryRecordTableVisible();
    };
    const handleOverUCLTarget = () => {
      setIsVisibleOverUCL(true);
      // message.warning("Over UCL Target Please Input Action record");
      message.warning(
        "กรุณาใส่รายละเอียด Action Record เนื่องจากจำนวน Defect เยอะเกินกว่าเป้า"
      );
    };
    const [previewModalVisible, setpreviewModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [addNewRecordViewResult, setAddNewRecordViewResult] =
      useState<AddNewRecordViewResult>(defaultAddNewRecordViewResult);
    const [defectData, setDefectData] =
      useState<DefectData[]>(defaultDefectData);
    const [defectModeOptions, setDefectModeOptions] = useState<any>([]);
    const [defectTypeOptions, setDefectTypeOptions] = useState<any>([]);

    const [changeNewRecordViewData, setChangeNewRecordViewData] =
      useState<ChangeAddNewRecordViewResult>(defaultAddNewRecordViewResult);
    const [createForm, setCreateForm] = useState<AddNewRecordSaveRequest>(
      defaultAddNewRecordSave
    );

    const dateFormat = "D-MMMM-YYYY";
    // console.log("addNewRecordViewResult:", addNewRecordViewResult);
    // Set the default date only when the modal is opened
    // console.log("DefectData:", defectData);
    console.log("createForm:", createForm);
    useEffect(() => {
      const runAfterShiftSelected = async (
        shiftABData: PChartRecordTableResult[],
        selectedShift: string,
        selectedDefectMode: string,
        selectedDefectType: string,
        selectedDayNum: number
      ) => {
        // const selectedTableData =
        //   shiftABData.find((item) => item.shift === selectedShift) ||
        //   pChartRecordTableResultDefault;

        // console.log(
        //   "handleSelectShift() selectedTableData:",
        //   selectedTableData
        // );
        // const selectedQtyListByShiftDefect =
        //   selectedTableData.defect_table.find(
        //     (item) =>
        //       item.defect_item === selectedDefectMode &&
        //       item.defect_type === selectedDefectType
        //   ) || defaultDefectTable;

        // console.log(
        //   "handleSelectShift() selectedQtyListByShiftDefect:",
        //   selectedQtyListByShiftDefect
        // );
        // const selectedQty =
        //   selectedQtyListByShiftDefect.value[selectedDayNum - 1] || 0;

        // default shift to A
        setShift(selectedShift);
        // setDefectQty(selectedQty || 0);
        setDefectQty(0);

        // setDefectQtyToBeAddedShiftA(0);
        // setDefectQtyToBeAddedShiftB(0);

        setCommentShiftA("");
        setCommentShiftB("");
      };

      if (isModalVisible === false) {
        return;
      }

      // guard: exit early if no date is selected
      if (!pChartPageSelectedDate) {
        return;
      }

      const parsedDate = dayjs(pChartPageSelectedDate, dateFormat);
      addNewRecordViewByPart({
        date: convertToDateString(parsedDate),
        line_name: input.line_name || "",
        defect_type: pChartPageSelectedDefectType || "",
        process: input.process || "",
        sub_line: input.sub_line,
        part_no: input.part_no,
      }).then((res: any) => {
        // const resData = res.add_new_record_view_result[0];
        setDefectData(res.add_new_record_view_defect_by_part_result);
      });

      if (parsedDate.isValid()) {
        setSelectedDate(parsedDate); // Parse the default date using the custom format
      } else {
        console.error(
          "Invalid date format for pChartPageSelectedDate:",
          pChartPageSelectedDate
        );
      }

      console.log("on open add new record view:");

      addNewRecordView({
        date: convertToDateString(parsedDate),
        line_name: input.line_name || "",
        defect_type: pChartPageSelectedDefectType || "",
        process: input.process || "",
        sub_line: input.sub_line,
        part_no: input.part_no,
      }).then((res) => {
        // const resData = res.add_new_record_view_result[0];
        setAddNewRecordViewResult(res.add_new_record_view_result[0]);

        // set item id to from
        setCreateForm((prev) => ({
          ...prev,
          id: res.add_new_record_view_result[0].id,
        }));
      });
      // console.log("x:::");

      if (input.line_name) {
        changeNewRecordView({
          date: convertToDateString(parsedDate),
          line_name: input.line_name || "",
          defect_type: pChartPageSelectedDefectType || "",
          process: input.process || "",
          sub_line: input.sub_line || "",
          part_no: input.part_no || "",
          defect_mode: pChartRecordTableSelectedDefectMode || "",
        }).then((res) => {
          setChangeNewRecordViewData(res.add_new_record_view_result[0]);

          console.log(
            "on open add new record view (chane view api):",
            res.add_new_record_view_result[0]
          );

          // set item id to from
          setCreateForm((prev) => ({
            ...prev,
            id: res.add_new_record_view_result[0].id,
          }));

          setCommentShiftA(res.add_new_record_view_result[0].comment_shift_A);
          setCommentShiftB(res.add_new_record_view_result[0].comment_shift_B);
        });
      }

      // set initial dropdown value and create form
      setCreateForm((prev) => ({
        id: prev.id,
        date: convertToDateString(parsedDate),
        line_name: input.line_name || "",
        defect_type: pChartPageSelectedDefectType || "",
        defective_items: pChartRecordTableSelectedDefectMode || "", // defective mode
        comment: "", // comment
        process: input.process || "",
        sub_line: input.sub_line,
        part_no: input.part_no,
        defect_qty_A: null,
        defect_qty_B: null,
        pic: null,
        creator: username,
      }));

      const selectedShift = pChartRecordTableSelectedShift === "B" ? "B" : "A";

      // default shift to A
      // setShift(selectedShift);

      // setCommentShiftA("");
      // setCommentShiftB("");

      // if (
      //   isNeededToFetchShiftABData(pChartRecordTableShiftABData, selectedShift)
      // ) {
      //   (async () => {
      //     console.log("handleSelectShift() isNeededToFetchShiftABData: start");
      //     const shiftABData = await triggerLazyFetchShiftABData();

      //     console.log(
      //       "handleSelectShift() isNeededToFetchShiftABData: trigger end"
      //     );
      //     await runAfterShiftSelected(
      //       shiftABData,
      //       selectedShift,
      //       pChartRecordTableSelectedDefectMode || "",
      //       pChartPageSelectedDefectType || "",
      //       pChartPageSelectedDayNum
      //     );

      //     console.log("handleSelectShift() isNeededToFetchShiftABData: end");
      //   })();
      //   return; // guard: exit early
      // }

      runAfterShiftSelected(
        pChartRecordTableShiftABData,
        selectedShift,
        pChartRecordTableSelectedDefectMode || "",
        pChartPageSelectedDefectType || "",
        pChartPageSelectedDayNum
      ); // fallback if no fetch needed
    }, [isModalVisible, pChartPageSelectedDate]);
    // useEffect(() => {
    //   const parsedDate = dayjs(pChartPageSelectedDate, dateFormat);
    //   addNewRecordView({
    //     date: convertToDateString(parsedDate),
    //     line_name: createForm.line_name || "",
    //     defect_type: "",
    //     process: createForm.process || "",
    //     sub_line: "",
    //     part_no: "",
    //   }).then((res) => {
    //     // const resData = res.add_new_record_view_result[0];
    //     setAddNewRecordViewResult(res.add_new_record_view_result[0]);
    //   });
    // }, [createForm.process]);

    const showModal = () => {
      // message.error("Over UCL Target Please Input Action record");
      setpreviewModalVisible(true);
    };

    const handleCancel = () => {
      setpreviewModalVisible(false);
    };

    const handleSetDate = (date: Dayjs) => {
      createForm.date = convertToDateString(date);
      setSelectedDate(date);
      closeHistoryRecordTableVisible();
    };

    const handleSetDefectType = (value: string) => {
      // fetch by defective_items comment
      changeNewRecordView({
        date: convertToDateString(selectedDate!!),
        line_name: input.line_name || "",
        defect_type: value || "",
        defect_mode: pChartRecordTableSelectedDefectMode || "",
        process: input.process || "",
        sub_line: input.sub_line || "",
        part_no: input.part_no || "",
      }).then((res) => {
        setChangeNewRecordViewData(res.add_new_record_view_result[0]);

        console.log(
          "on open add new record view (chane view api):",
          res.add_new_record_view_result[0]
        );

        // set item id to from
        setCreateForm((prev) => ({
          ...prev,
          id: res.add_new_record_view_result[0].id,
        }));

        setCommentShiftA(res.add_new_record_view_result[0].comment_shift_A);
        setCommentShiftB(res.add_new_record_view_result[0].comment_shift_B);

        closeHistoryRecordTableVisible();
      });

      setCreateForm((prev) => ({
        ...prev,
        defect_type: value,
      }));
    };
    const handleSetDefectMode = (value: string) => {
      // fetch by defective_items comment
      changeNewRecordView({
        date: convertToDateString(selectedDate!!),
        line_name: input.line_name || "",
        defect_type: pChartPageSelectedDefectType || "",
        defect_mode: value,
        process: input.process || "",
        sub_line: input.sub_line || "",
        part_no: input.part_no || "",
      }).then((res) => {
        setChangeNewRecordViewData(res.add_new_record_view_result[0]);

        console.log(
          "on open add new record view (chane view api):",
          res.add_new_record_view_result[0]
        );

        // set item id to from
        setCreateForm((prev) => ({
          ...prev,
          id: res.add_new_record_view_result[0].id,
        }));

        setCommentShiftA(res.add_new_record_view_result[0].comment_shift_A);
        setCommentShiftB(res.add_new_record_view_result[0].comment_shift_B);

        closeHistoryRecordTableVisible();
      });

      setCreateForm((prev) => ({
        ...prev,
        defective_items: value,
      }));
    };
    // const handleSetDefectType = (value: string) => {
    //   // fetch by defective_items comment
    //   changeNewRecordView({
    //     date: convertToDateString(selectedDate!!),
    //     line_name: input.line_name || "",
    //     defect_type: value || "",
    //     defect_mode: createForm.defective_items,
    //     process: input.process || "",
    //     sub_line: input.sub_line || "",
    //     part_no: input.part_no || "",
    //   }).then((res) => {
    //     setChangeNewRecordViewData(res.add_new_record_view_result[0]);

    //     console.log(
    //       "on open add new record view (chane view api):",
    //       res.add_new_record_view_result[0]
    //     );

    //     // set item id to from
    //     setCreateForm((prev) => ({
    //       ...prev,
    //       id: res.add_new_record_view_result[0].id,
    //     }));

    //     setCommentShiftA(res.add_new_record_view_result[0].comment_shift_A);
    //     setCommentShiftB(res.add_new_record_view_result[0].comment_shift_B);

    //     closeHistoryRecordTableVisible();
    //   });

    //   setCreateForm((prev) => ({
    //     ...prev,
    //     defect_type: value,
    //   }));
    // };

    const handleSetComment = (
      value: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      if (shift === "A") {
        setCommentShiftA(value.target.value);
      } else {
        setCommentShiftB(value.target.value);
      }
    };

    const [historyRecordTableVisible, setHistoryRecordTableVisible] =
      useState<boolean>(false);
    const toggleHistoryRecordTableVisible = () => {
      setHistoryRecordTableVisible(!historyRecordTableVisible);
    };
    const closeHistoryRecordTableVisible = () => {
      setHistoryRecordTableVisible(false);
      setIsVisibleOverUCL(false);
    };

    // user can use key pad to edit defect qty
    useEffect(() => {
      const handleKeyDown = (event: { key: string }) => {
        console.log(
          "handleKeyDown():",
          event.key,
          "isModalVisible:",
          isModalVisible
        );

        console.log(
          "handleKeyDown(): ",
          "commentShiftARef.current?.resizableTextArea?.textArea:",
          commentInputRef.current?.resizableTextArea?.textArea
        );

        // Check if the modal is visible before processing the key event.
        if (!isModalVisibleRef.current) {
          return;
        }

        // chekc if comment ref is active element
        // console.log("dateInputRef.current:", dateInputRef.current);
        const textareaDom =
          commentInputRef.current?.resizableTextArea?.textArea;
        // const datePickerDom = dateInputRef.current?.querySelector("input");
        // const defectTypeInputDom =
        //   defectTypeInputRef.current?.querySelector("input");
        // const defectModeInputDom =
        //   defectModeInputRef.current?.querySelector("input");
        // const partNoInputDom = partNoInputRef.current?.querySelector("input");
        // const subLineInputDom = subLineInputRef.current?.querySelector("input");
        const tableDom = historyTableRef.current;

        if (textareaDom && document.activeElement === textareaDom) {
          // It's focused, skip
          return;
        }
        if (isFocused) {
          return;
        }
        console.log("AA2");
        // If focus is inside the Table (including its inputs, selects, etc.)
        if (tableDom && tableDom.contains(document.activeElement)) return;
        if (
          document.activeElement?.closest(".ant-dropdown") ||
          document.activeElement?.closest(".ant-table-filter-dropdown")
        )
          return;

        if (event.key.match(/[0-9]/)) {
          setDefectQty((prev) => parseInt(`${prev}${event.key}`, 10));

          console.log("handleKeyDown() shift:", shift);

          // if (shiftRef.current === "A") {
          //   setDefectQtyToBeAddedShiftA((prev) => parseInt(`${prev}${event.key}`, 10))
          // } else {
          //   setDefectQtyToBeAddedShiftB((prev) => parseInt(`${prev}${event.key}`, 10));
          // }
        } else if (event.key === "Backspace") {
          setDefectQty((prev) => Math.floor(prev / 10)); // Remove last digit

          // if (shiftRef.current === "A") {
          //   setDefectQtyToBeAddedShiftA((prev) => Math.floor(prev / 10))
          // } else {
          //   setDefectQtyToBeAddedShiftB((prev) => Math.floor(prev / 10));
          // }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFocused]);

    useEffect(() => {
      isModalVisibleRef.current = isModalVisible;
    }, [isModalVisible]);

    // console.log("createForm:", createForm);
    useEffect(() => {
      shiftRef.current = shift;
    }, [shift]);

    // useEffect(() => {
    //   // setSelectedSubLine(null);
    //   setCreateForm((prev) => ({
    //     ...prev,
    //     sub_line: null,
    //   }));
    //   fetchSubLines();
    // }, [createForm.part_no]);

    useEffect(() => {
      // console.log("[createForm.part_no]");
      if (defectData.length > 1) {
        if (isModalVisible === false) {
          return;
        }

        // guard: exit early if no date is selected
        if (!pChartPageSelectedDate) {
          return;
        }
        setCreateForm((prev) => ({
          ...prev,
          sub_line: null,
        }));
        fetchSubLines();

        const defect_type = [
          ...new Set(
            defectData
              .filter((item) => {
                return (
                  item.part_no === createForm.part_no || item.part_no == null
                );
              })
              .map((item: any) => item.defect_type)
          ),
        ];
        const defect_mode: any = [
          ...new Set(
            defectData
              .filter(
                (item) =>
                  (item.part_no === createForm.part_no ||
                    item.part_no == null) &&
                  item.defect_type === createForm.defect_type
              )
              .map((item: any) => item.defect_mode)
          ),
        ];

        setDefectTypeOptions(defect_type);
        // console.log("defect_type:", defect_type);
        // console.log("createForm.defect_type:", createForm.defect_type);
        if (!defect_type.includes(createForm.defect_type)) {
          setCreateForm((prev) => ({
            ...prev,
            defect_type: "",
          }));
        }
        if (!defect_mode.includes(createForm.defective_items)) {
          setCreateForm((prev) => ({
            ...prev,
            defective_items: "",
          }));
        }
        if (createForm.process == "Outline") {
          setCreateForm((prev) => ({
            ...prev,
            sub_line: "Outline",
          }));
        } else {
          const sub_line: any = [
            ...new Set(
              subLines
                .filter((item) => item.rxno_part === createForm.sub_line)
                .map((item: any) => item.rxno_part)
            ),
          ];
          if (!sub_line.includes(createForm.sub_line)) {
            setCreateForm((prev) => ({
              ...prev,
              sub_line: null,
            }));
          }
        }
      }
    }, [createForm.part_no, defectData]);
    // useEffect(() => {
    //   console.log("firstdd");
    // }, []);
    useEffect(() => {
      // console.log("[createForm.part_no, defectTypeOptions]");
      if (defectData.length > 1) {
        if (isModalVisible === false) {
          return;
        }

        // guard: exit early if no date is selected
        if (!pChartPageSelectedDate) {
          return;
        }
        const defect_mode: any = [
          ...new Set(
            defectData
              .filter(
                (item) =>
                  (item.part_no === createForm.part_no ||
                    item.part_no == null) &&
                  item.defect_type === createForm.defect_type
              )
              .map((item: any) => item.defect_mode)
          ),
        ];

        setDefectModeOptions(defect_mode);
        if (!defect_mode.includes(createForm.defective_items)) {
          setCreateForm((prev) => ({
            ...prev,
            defective_items: "",
          }));
        }
      }
    }, [createForm.part_no, createForm.defect_type, defectData]);

    // console.log("defectTypeOptions:", defectTypeOptions);
    // console.log("defectModeOptions:", defectModeOptions);
    return (
      <Modal
        title={
          <Flex gap="small" justify="flex-start" align="center">
            <Image src={plusSign} alt="plus-sign" priority width={40} />
            <Flex vertical justify="flex-start" align="flex-start">
              <Title
                style={{ marginTop: "0px", marginBottom: "0px" }}
                level={4}
              >
                Add New Record Data Form
              </Title>
              <Title
                style={{ marginTop: "0px", marginBottom: "0px" }}
                level={5}
              >
                แบบฟอร์มการลงบันทึกข้อมูล Defect ประจำวัน
              </Title>
            </Flex>
          </Flex>
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
        // confirmLoading={isLoading}
        footer={null}
        // width={1300}
        width="90%"
      >
        <Spin spinning={isLoading}>
          {/* General Information */}
          <div style={{ display: "flex" }}>
            <Title level={5}>General Information</Title>
            <div
              style={{ color: "red", paddingLeft: "20px", fontWeight: "bold" }}
            >
              ***หากต้องการเปลี่ยน Line Name หรือ Process
              โปรดกลับไปที่หน้าหลัก***
            </div>
          </div>
          <Row gutter={[16, 16]}>
            <Col span={4}>
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                  // width: "200px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <Text style={{ color: "gray" }}>Date</Text>
                </div>
                <DatePicker
                  picker="date"
                  value={selectedDate}
                  format={dateFormat} // Display the custom format
                  onChange={handleSetDate}
                  allowClear={false}
                  placeholder="Select Date"
                  style={{
                    border: "none",
                    flex: 1,
                    textAlign: "center",
                    height: "32px",
                    color: "black",
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  suffixIcon={<CalendarOutlined />}
                />
              </Input.Group>
            </Col>

            <Col span={8}>
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <Text style={{ color: "gray" }}>Line Name</Text>
                </div>
                <Select
                  disabled
                  value={createForm.line_name}
                  placeholder="Select Line"
                  style={{
                    border: "none",
                    flex: 1,
                    height: "32px",
                    color: "black",
                  }}
                  showSearch
                  filterOption={(input, option) => {
                    const optionLabel = (option?.label || "").toLowerCase();
                    return optionLabel.includes(input.toLowerCase());
                  }}
                  options={addNewRecordViewResult.line_name.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                  onChange={(value) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      line_name: value,
                    }));
                    closeHistoryRecordTableVisible();
                  }}
                />
              </Input.Group>
            </Col>
            <Col span={3}>
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <Text style={{ color: "gray" }}>Process</Text>
                </div>
                <Select
                  disabled
                  placeholder=""
                  style={{
                    border: "none",
                    flex: 1,
                    height: "32px",
                    color: "black",
                  }}
                  value={createForm.process}
                  // todo: use changeNewRecordViewData
                  // if needed to use change add api
                  options={addNewRecordViewResult.process.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                  onChange={(value) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      process: value,
                    }));
                    closeHistoryRecordTableVisible();
                  }}
                />
              </Input.Group>
            </Col>
            <Col span={3}>
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <Text style={{ color: "gray" }}>Defect Type</Text>
                </div>
                <Select
                  // disabled
                  value={createForm.defect_type}
                  placeholder=""
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  // disabled={
                  //   // disable if defect type has no defect mode
                  //   defectType.find(
                  //     (item) => item.value === createForm.defect_type
                  //   )?.hasDefectMode === false
                  // }
                  style={{
                    border: "none",
                    flex: 1,
                    height: "32px",
                    color: "black",
                  }}
                  // todo: use changeNewRecordViewData
                  // if needed to use change add api
                  showSearch
                  filterOption={(input, option: any) => {
                    const optionLabel = (option?.label || "").toLowerCase();
                    return optionLabel.includes(input.toLowerCase());
                  }}
                  // options={addNewRecordViewResult.defect_type.map((item) => ({
                  //   value: item,
                  //   label: item,
                  // }))}
                  // options={[
                  //   ...new Set(
                  //     defectTypeOptions.map((item: any) => item.defect_type)
                  //   ),
                  // ].map((item) => ({
                  //   value: item,
                  //   label: item,
                  // }))}
                  options={defectTypeOptions.map((item: any) => ({
                    value: item,
                    label: item,
                  }))}
                  // onChange={handleSetDefectType}
                  onChange={(value) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      defect_type: value,
                    }));
                    closeHistoryRecordTableVisible();
                  }}
                  // onChange={(value) => {
                  //   setCreateForm((prev) => ({
                  //     ...prev,
                  //     defective_type: value,
                  //   }));
                  // }}
                />
              </Input.Group>
            </Col>

            <Col span={5}>
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <Text style={{ color: "gray" }}>Defect Mode</Text>
                </div>
                <Select
                  // disabled
                  value={createForm.defective_items}
                  placeholder=""
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  // disabled={
                  //   // disable if defect type has no defect mode
                  //   defectType.find(
                  //     (item) => item.value === createForm.defect_type
                  //   )?.hasDefectMode === false
                  // }
                  style={{
                    border: "none",
                    flex: 1,
                    height: "32px",
                    color: "black",
                  }}
                  // todo: use changeNewRecordViewData
                  // if needed to use change add api
                  showSearch
                  filterOption={(input, option: any) => {
                    const optionLabel = (option?.label || "").toLowerCase();
                    return optionLabel.includes(input.toLowerCase());
                  }}
                  // options={addNewRecordViewResult.defect_mode.map((item) => ({
                  //   value: item,
                  //   label: item,
                  // }))}
                  options={defectModeOptions.map((item: any) => ({
                    value: item,
                    label: item,
                  }))}
                  // options={[
                  //   ...new Set(
                  //     defectModeOptions.map((item: any) => item.defect_mode)
                  //   ),
                  // ].map((item) => ({
                  //   value: item,
                  //   label: item,
                  // }))}
                  // onChange={handleSetDefectMode}
                  onChange={(value) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      defective_items: value,
                    }));
                    closeHistoryRecordTableVisible();
                  }}
                />
              </Input.Group>
            </Col>
          </Row>

          {/* Input Information */}
          <Title level={5} style={{ marginTop: "10px" }}>
            Input Information
          </Title>
          <Row gutter={16}>
            <Col span={5}>
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <Text style={{ color: "gray" }}>Part No.</Text>
                </div>
                <Select
                  // disabled
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Select Part No"
                  style={{
                    border: "none",
                    flex: 1,
                    height: "32px",
                    color: "black",
                  }}
                  showSearch
                  filterOption={(input, option) => {
                    const optionLabel = (option?.label || "").toLowerCase();
                    return optionLabel.includes(input.toLowerCase());
                  }}
                  options={addNewRecordViewResult.part_no.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                  value={createForm.part_no}
                  onChange={(value) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      part_no: value,
                    }));
                    closeHistoryRecordTableVisible();
                  }}
                />
              </Input.Group>
            </Col>
            <Col span={4}>
              {/* Sub Line */}
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                  flex: 1.5,
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <Text style={{ color: "gray" }}>Sub Line</Text>
                </div>
                <Select
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Select Sub Line"
                  style={{
                    border: "none",
                    flex: 1,
                    height: "32px",
                    color: "black",
                  }}
                  value={createForm.sub_line}
                  // onChange={(value) => setSelectedSubLine(value)}
                  onChange={(value) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      sub_line: value,
                    }));
                  }}
                  showSearch
                  filterOption={(input, option) => {
                    const optionLabel =
                      (option?.children as unknown as string) || "";
                    return optionLabel
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {subLines.map((subLine) => (
                    <Select.Option
                      key={subLine.rxno_part}
                      value={subLine.rxno_part}
                      // label={subLine.process}
                    >
                      {subLine.process || " "}
                    </Select.Option>
                  ))}
                </Select>
              </Input.Group>
            </Col>
            <Col span={5}>
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                  // width: "200px",
                  flex: 2,
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "32px",
                    flex: 0.8,
                  }}
                >
                  <Text style={{ color: "gray", textAlign: "center" }}>
                    Shift
                  </Text>
                </div>
                <Radio.Group
                  buttonStyle="solid"
                  value={shift}
                  style={{
                    flex: 3,
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                  onChange={handleSelectShift}
                >
                  <Radio.Button
                    value="A"
                    style={{
                      borderRadius: 0,
                      color: "black",
                      textAlign: "center",
                      flex: 1,
                    }}
                  >
                    A
                  </Radio.Button>
                  <Radio.Button
                    value="B"
                    style={{
                      borderRadius: 0,
                      color: "black",
                      textAlign: "center",
                      flex: 1,
                    }}
                  >
                    B
                  </Radio.Button>
                </Radio.Group>
              </Input.Group>
            </Col>
            <Col span={5}>
              <Input.Group
                compact
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d9d9d9",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <Text style={{ color: "gray" }}>หน่วยงานที่รับผิดชอบ</Text>
                </div>
                {/* <Select
                // mode="tags"
                allowClear
                placeholder=""
                maxTagCount={1}
                style={{
                  border: "none",
                  flex: 1,
                  height: "32px",
                  color: "black",
                  // width: "100%",
                }}
                value={createForm.pic}
                // todo: use changeNewRecordViewData
                // if needed to use change add api
                options={pics.map((item) => ({
                  value: item,
                  label: item,
                }))}
                onChange={(value) => {
                  setCreateForm((prev) => ({
                    ...prev,
                    pic: value,
                  }));
                  closeHistoryRecordTableVisible();
                }}
                  
              /> */}
                <AutoComplete
                  // style={{ width: 200 }}
                  allowClear
                  options={pics.map((item) => ({
                    value: item,
                  }))}
                  value={createForm.pic}
                  placeholder=""
                  filterOption={(inputValue, option) =>
                    option!.value
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                  style={{
                    border: "none",
                    flex: 1,
                    height: "32px",
                    color: "black",
                    // width: "100%",
                  }}
                  onChange={(value) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      pic: value,
                    }));
                    closeHistoryRecordTableVisible();
                  }}
                />
              </Input.Group>
            </Col>
            <Col span={4}>
              <div style={{ display: "flex" }}>
                <Form.Item>
                  <Button
                    type="primary"
                    danger={isVisibleOverUCL}
                    onClick={showModal}
                  >
                    Action Record
                  </Button>
                  <PreviewPopup
                    visible={previewModalVisible}
                    onClose={handleCancel}
                    input={input}
                    shift={shift}
                    username={username}
                    date={selectedDate}
                  />
                </Form.Item>
                <div
                  style={{
                    display: isVisibleOverUCL ? "block" : "none",
                    color: "red",
                    fontWeight: "bold",
                  }}
                >
                  ** กรุณาใส่รายละเอียด Action Record เนื่องจากจำนวน Defect
                  เยอะเกินกว่าเป้า
                </div>
              </div>
            </Col>
          </Row>

          {/* Defect Qty */}
          <Title level={5}>Defect Q'ty (จำนวนของเสีย)</Title>
          <Row style={{ marginBottom: "15px" }}>
            <Col span={11}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: "#fafafa",
                  marginRight: "7px",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Title level={1} style={{ margin: 0, fontSize: "150px" }}>
                  {/* {shift === "A" ? defectQtyTobeAddedShiftA : defectQtyTobeAddedShiftB } */}
                  {defectQty}
                </Title>
                <p
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    margin: 0,
                  }}
                >
                  PC(S).
                </p>
              </div>
            </Col>

            {/* +/- Buttons */}
            <Col span={2}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "15px",
                  height: "100%",
                }}
              >
                <Button
                  style={{
                    height: "70px", // เพิ่มขนาดปุ่ม
                    width: "70px", // เพิ่มขนาดปุ่ม
                    fontSize: "50px", // ขนาดตัวอักษร
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center", // จัดให้อยู่ตรงกลาง
                  }}
                  onClick={() => {
                    setDefectQty((prev) => prev + 1);
                    // shift === 'A' ? setDefectQtyToBeAddedShiftA(prev => prev + 1) : setDefectQtyToBeAddedShiftB(prev => prev + 1);
                  }}
                >
                  +
                </Button>
                <Button
                  style={{
                    height: "70px", // เพิ่มขนาดปุ่ม
                    width: "70px", // เพิ่มขนาดปุ่ม
                    fontSize: "50px", // ขนาดตัวอักษร
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center", // จัดให้อยู่ตรงกลาง
                  }}
                  onClick={() => {
                    setDefectQty((prev) => (prev > 0 ? prev - 1 : 0));
                    // shift === 'A' ? setDefectQtyToBeAddedShiftA(prev => prev - 1) : setDefectQtyToBeAddedShiftB(prev => prev - 1);
                  }}
                >
                  −
                </Button>
              </div>
            </Col>
            <Col span={11}>
              <div
                style={{
                  marginLeft: "7px",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "15px",
                }}
              >
                {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                  <Button
                    style={{ height: "50px", fontSize: "50px" }}
                    key={num}
                    block
                    onClick={() => handleKeypadClick(num)}
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  style={{ height: "50px", fontSize: "50px" }}
                  block
                  onClick={() => handleKeypadClick("delete")}
                >
                  <img
                    src="/assets/images/⌫.png"
                    alt="Delete"
                    style={{
                      height: "55px",
                      width: "55px",
                      objectFit: "contain",
                    }}
                  />
                </Button>

                <Button
                  style={{ height: "50px", fontSize: "50px" }}
                  block
                  onClick={() => handleKeypadClick(0)}
                >
                  0
                </Button>
                <Button
                  style={{ height: "50px", fontSize: "50px" }}
                  block
                  onClick={() => handleKeypadClick("clear")}
                >
                  C
                </Button>
              </div>
            </Col>
          </Row>

          {/* Comment */}
          <Title level={5}>Comment</Title>
          <TextArea
            disabled
            value={shift === "A" ? commentShiftA : commentShiftB}
            onChange={handleSetComment}
            placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
            rows={3}
            ref={commentInputRef}
          />

          {/* Footer */}
          <Row
            justify="space-between"
            align="middle"
            gutter={16}
            style={{ marginTop: "15px", marginBottom: "15px" }}
          >
            <Col>
              <Row>
                <Button
                  type="link"
                  onClick={() => toggleHistoryRecordTableVisible()}
                >
                  <span style={{ textDecoration: "underline" }}>
                    History Record
                  </span>{" "}
                  (ประวัติการบันทึกข้อมูล){" "}
                  {historyRecordTableVisible ? "↑" : "↓"}
                </Button>
              </Row>
              <Row>
                <span style={{ color: "red", paddingLeft: "15px" }}>
                  (ตรวจสอบ แก้ไข และ ลบข้อมูลย้อนหลัง)
                </span>
              </Row>
            </Col>
            <Col>
              <Row gutter={16}>
                <Col>
                  <Button onClick={handleModalCancel} danger>
                    Cancel
                  </Button>
                </Col>
                <Col>
                  <Button
                    disabled={isLoading}
                    type="primary"
                    onClick={handleOnClickOk}
                  >
                    Save
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>

          <div ref={historyTableRef}>
            <HistoryRecordTable
              visible={historyRecordTableVisible}
              input={{
                month: convertFullDateToYearMonth(createForm.date),
                line_name: createForm.line_name,
                part_no: createForm.part_no,
                shift: shift,
                process: createForm.process,
                sub_line: createForm.sub_line,
                line_code_rx: input.line_code_rx,
              }}
              username={username}
            />
          </div>
        </Spin>
      </Modal>
    );
  }
);

AddNewRecord.displayName = "AddNewRecord";

export default AddNewRecord;
