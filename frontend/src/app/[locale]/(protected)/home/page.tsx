"use client";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Flex,
  Form,
  Grid,
  Input,
  Layout,
  Modal,
  Row,
  Space,
  Typography,
  message,
  theme,
} from "antd";
import Image from "next/image";
import { NextPage } from "next";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { login, forgotPassword } from "@/actions";
import ForgotPasswordView from "@/components/views/forgot-password-view";
import { Link, useRouter } from "@/navigation";
import { LayoutStore, ModeStore, UserStore } from "@/store";
import { IForgotPasswordForm, ILoginForm } from "@/types";

import { Noto_Sans_Thai } from "next/font/google";
import { CardIconButton, CardIconButtonType } from "@/components/button";
const notoTH = Noto_Sans_Thai({ subsets: ["thai", "latin", "latin-ext"] });
const { Content } = Layout;
const { Text } = Typography;

const HomePage: NextPage = () => {
  const router = useRouter();

  const { backTarget } = LayoutStore();
  const { setIsLoading, setHeaderTitle, setBackable } = LayoutStore.getState();
  const toggleMode = ModeStore((state) => state.toggleMode);
  const { loadUser, isLoggedIn } = UserStore.getState();

  const config = {
    token: {
      colorPrimary: "#0267f5",
      fontFamily: notoTH.style.fontFamily,
    },
    algorithm:
      toggleMode === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
  };

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const b = useTranslations("button");
  const l = useTranslations("layout");
  const m = useTranslations("message");
  const p = useTranslations("page");

  useEffect(() => {
    checkAuth();
    setHeaderTitle(l("header.login"));
    setBackable(true);
  }, [setHeaderTitle, setBackable, l]);

  const checkAuth = () => {
    setIsLoading(true);
    loadUser();
    setIsLoading(false);

    if (!isLoggedIn()) {
      // router.replace("/login");
      return false;
    }

    return true;
  };

  return (
    <ConfigProvider theme={config}>
      <Content
        className=""
        style={{
          padding: "0rem 2rem 1rem 2rem",
          minHeight: "80dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "4rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Red vertical line */}
          <div
            style={{
              width: "5px",
              height: "200px",
              backgroundColor: "red",
            }}
          />
          <div>
            <Typography.Title
              level={1}
              style={{ margin: 0, color: "#C9184A", fontSize: "60px" }}
            >
              EPD Defect Control
            </Typography.Title>
            <Typography.Title
              level={5}
              style={{
                margin: 0,
                color: "#6E6E6F",
                width: "30%",
                fontSize: "22px",
                fontWeight: "normal",
              }}
            >
              Record control, visualize daily In-line defects to find root cause
              and improve quality problem. And drive activity to success ‘Zero
              defect’ policy.
            </Typography.Title>
          </div>
        </div>
        <Row gutter={8}>
          <Col xs={6}>
            <CardIconButton
              style={{ textAlign: "center" }}
              type={CardIconButtonType.SUMMARY}
              title="Defect Summary"
              description="สรุปปัญหาชิ้นงานบกพร่อง (defect) ที่เกิดจากการผลิต"
              href="/Inline-and-Outline-Defect"
            />
          </Col>
          <Col xs={6}>
            <CardIconButton
              style={{ textAlign: "center" }}
              type={CardIconButtonType.PCHART_RECORD}
              title="Defect Record"
              description="บันทึกข้อมูล Defect ประจำวัน และกราฟสรุปผลการลงข้อมูล"
              href="/DefectRecord"
            />
          </Col>
          <Col xs={6}>
            <CardIconButton
              style={{ textAlign: "center" }}
              type={CardIconButtonType.EXPORT_PDF}
              title="Export Defect to PDF"
              description="ดาวน์โหลดข้อมูล Defect ในรูปแบบ PDF Form"
              href="/Export-Defect-To-PDF"
            />
          </Col>
          <Col xs={6}>
            <CardIconButton
              style={{ textAlign: "center" }}
              type={CardIconButtonType.SETTING}
              title="Master Data Setting"
              description="จัดการข้อมูลพื้นฐาน เช่น line, Part No, defect mode, Target หรืออื่นๆ"
              href="/settings/master-data"
            />
          </Col>
        </Row>
      </Content>
    </ConfigProvider>
  );
};

export default HomePage;
