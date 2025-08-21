import { FC, Fragment } from "react";
import Image from "next/image";
import { Button, Card, Tooltip, Typography } from "antd";
import { FiPlusCircle } from "react-icons/fi";
import { Link } from "@/navigation";

export enum CardIconButtonType {
  SUMMARY = "/assets/images/icon_pie-chart.png",
  PCHART_RECORD = "/assets/images/icon_plus-line.png",
  EXPORT_PDF = "/assets/images/icon_file.png",
  SETTING = "/assets/images/icon_setting.png",
}

interface IProp {
  style?: React.CSSProperties;
  type: CardIconButtonType;
  title: string;
  description?: string;
  href?: string;
}

export const CardIconButton: FC<IProp> = ({
  style,
  type,
  title,
  description,
  href = "",
}) => {
  return (
    <Fragment>
      <Card className="home-card" style={style}>
        <Link href={href}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Image
              src={type}
              alt="denso"
              priority
              width={100}
              height={100}
              style={{ marginBottom: "16px" }}
            />
            <Typography.Title
              level={5}
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              {title}
            </Typography.Title>
            <Typography.Title
              level={5}
              style={{
                margin: 0,
                color: "#6E6E6F",
                fontSize: "16px",
                fontWeight: "normal",
              }}
            >
              {description}
            </Typography.Title>
          </div>
        </Link>
      </Card>
    </Fragment>
  );
};

export default CardIconButton;
