"use client";
import {
  Button,
  Card,
  ConfigProvider,
  Flex,
  Form,
  Input,
  Layout,
  Modal,
  Space,
  Typography,
  message,
  theme,
} from "antd";
import { NextPage } from "next";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { forgotPassword } from "@/actions";
import ForgotPasswordView from "@/components/views/forgot-password-view";
import { useRouter } from "@/navigation";
import { LayoutStore, ModeStore, UserStore } from "@/store";
import { IForgotPasswordForm, ILoginForm } from "@/types";

import { Noto_Sans_Thai } from "next/font/google";
import { loginUser } from "@/lib/api";
import { fetchLines } from "@/lib/api";
const notoTH = Noto_Sans_Thai({ subsets: ["thai", "latin", "latin-ext"] });
const { Content } = Layout;
const { Text } = Typography;
import { useAuth } from "@/context/auth-context";
const LoginPage: NextPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const { backTarget } = LayoutStore();
  const { setIsLoading, setHeaderTitle, setBackable } = LayoutStore.getState();
  const toggleMode = ModeStore((state) => state.toggleMode);
  const { setUser, loadUser, isLoggedIn } = UserStore.getState();

  const [selectForgotPasswordView, setSelectForgotPasswordView] =
    useState<boolean>(false);
  const [selectContactAdmin, setSelectContactAdmin] = useState<boolean>(false);

  const config = {
    token: {
      colorPrimary: "#0267f5",
      fontFamily: notoTH.style.fontFamily,
    },
    algorithm:
      toggleMode === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

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

    if (isLoggedIn()) {
      router.replace("/home");
      return true;
    }

    return false;
  };

  const onFinish = async (form: ILoginForm) => {
    try {
      await login(form.username, form.password);
    } catch (error) {
      console.error("Login failed:", error);
      message.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPasswordFinish = async (form: IForgotPasswordForm) => {
    forgotPassword(form)
      .then((res) => {
        message.success(res);
      })
      .catch((reason) => {
        // console.log(reason);
        message.warning(reason.response.data.detail);
      })
      .finally(() => {
        setSelectForgotPasswordView(false);
      });

    // try {
    //   const res = await forgotPassword(form);
    //   message.success(res);
    // } catch (err: any) {
    //   message.error(err);
    // }
    // setSelectForgotPasswordView(false);
  };

  const handleCancelSelectForgotPassword = () =>
    setSelectForgotPasswordView(false);

  return (
    <ConfigProvider theme={config}>
      <div
        style={{
          background: toggleMode === "light" ? "transparent" : "#141a28",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0rem 2rem",
            background: toggleMode === "light" ? "transparent" : "#0d1117",
            marginLeft: "40px",
          }}
        >
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
              fontSize: "22px",
              fontWeight: "normal",
            }}
          >
            Daily In-line defect record for result control, visualization and
            improvement
          </Typography.Title>
        </div>

        <Content
          className="container"
          style={{
            padding: "0rem 2rem 1rem 2rem",
          }}
        >
          <Card style={{ width: "25%", background: colorBgLayout }}>
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
            >
              <Space style={{ width: "100%", justifyContent: "Left" }}>
                <Typography.Title level={2}>Log in</Typography.Title>
              </Space>
              <Form.Item
                label={p("login.title.username")}
                name="username"
                layout="vertical"
                rules={[{ required: true, message: m("usernameRequired") }]}
              >
                <Input placeholder="Employee No : 100xxxx" />
              </Form.Item>
              <Form.Item
                label={p("login.title.password")}
                name="password"
                layout="vertical"
                rules={[{ required: true, message: m("passwordRequired") }]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
              <Form.Item className="login" layout="horizontal">
                <Space style={{ width: "100%", justifyContent: "center" }}>
                  <Button
                    style={{ width: "9rem" }}
                    type="primary"
                    htmlType="submit"
                  >
                    {b("login")}
                  </Button>
                  <Button
                    style={{ width: "9rem" }}
                    onClick={() => setSelectForgotPasswordView(true)}
                  >
                    {p("login.title.forgotPassword")}
                  </Button>
                </Space>
                <Space style={{ width: "100%", justifyContent: "center" }}>
                  <Button
                    type="default"
                    style={{ width: "18rem", marginTop: "0.5rem" }}
                    onClick={() => setSelectContactAdmin(true)}
                  >
                    {p("login.title.contactAdmin")}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
          <Modal
            title={p("login.title.contactAdmin")}
            open={selectContactAdmin}
            footer={null}
            onCancel={() => setSelectContactAdmin(false)}
            centered
            maskClosable={false}
            keyboard
          >
            <Text>{p("login.content.contactAdmin")}</Text>
            <br />
            <a href="mailto:arief.kaday.a5c@ap.denso.com?subject=[BPK Apps]">
              &#x2022; arief.kaday.a5c@ap.denso.com
            </a>
            <br />
            <a href="mailto:khessarin.kaeoli.a8y@ap.denso.com?subject=[BPK Apps]">
              &#x2022; khessarin.kaeoli.a8y@ap.denso.com
            </a>
            <br />
            <a href="mailto:kriangsak.panbua.a4r@ap.denso.com?subject=[BPK Apps]">
              &#x2022; kriangsak.panbua.a4r@ap.denso.com
            </a>
          </Modal>
        </Content>
        <ForgotPasswordView
          title={p("login.title.forgotPassword")}
          visible={selectForgotPasswordView}
          onFinish={onForgotPasswordFinish}
          onCancel={handleCancelSelectForgotPassword}
        />
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;
