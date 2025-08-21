import { FC, Fragment } from "react";
import { Button, Select, Tooltip } from "antd";
import { FiPlusSquare } from "react-icons/fi";

interface IProp {
  //   children?: React.ReactNode;
  //   disabled?: boolean;
  //   style?: React.CSSProperties;
  //   tooltip?: string;
  //   onClick?: (value: any) => void;
  defaultValue?: { value: string | number | null; label: string };
  handleChange: (value: {
    value: string | number | null;
    label: string;
  }) => void;
  options: { value: string | number | null; label: string }[];
  placeholder: string;
  value?: { value: string | number | null; label: string };
  allowClear?: boolean;
  disabled?: boolean;
}

export const DropdownEdit: FC<IProp> = ({
  defaultValue,
  handleChange,
  options,
  placeholder,
  value,
  allowClear,
  disabled,
}) => {
  return (
    <Select
      disabled={disabled}
      allowClear={allowClear}
      value={value}
      labelInValue
      showSearch
      placeholder={placeholder}
      defaultValue={defaultValue}
      style={{
        border: "none",
        width: "100%",
        height: "32px",
        color: "black",
      }}
      options={options}
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      onChange={handleChange}
    />
  );
};

export default DropdownEdit;
