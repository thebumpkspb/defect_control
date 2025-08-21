import dayjs from "dayjs";

export function convertFullDateToYearMonth(fullDate:string): string {
    // convert "2024-11-01" => "November-2024" date

    return dayjs(fullDate, "YYYY-MM-DD").format("MMMM-YYYY");
}