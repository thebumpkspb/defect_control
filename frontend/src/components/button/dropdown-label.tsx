import { FC, Fragment } from "react";
import { Button, Select, Tooltip } from "antd";
import { FiPlusSquare } from "react-icons/fi";

interface IProp {
  label?: string;
  options?: object[];
  defaultValue?: any;
  onChange?: (value: any) => void;
}

export const DropDownLabel: FC<IProp> = ({
  label,
  options,
  defaultValue,
  onChange,
}) => {
  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #888888",
          borderRadius: "5px",
          overflow: "hidden",
          // width: "max-content",
          background: "#f1f1f1",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#585858",
            background: "#fff",
            height: "32px",
            padding: "4px 8px",
            borderRadius: "5px",
          }}
        >
          {label}
        </div>
        <div style={{ display: "flex", flexGrow: 1 }}>
          <Select
            defaultValue={defaultValue}
            className="custom-select"
            onChange={onChange}
            options={options}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default DropDownLabel;
