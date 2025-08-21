import { FC } from "react";
import { useTranslations } from "next-intl";
import { Avatar, Button, Dropdown, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  CaretDownOutlined,
  HomeOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";
import { UserStore } from "@/store";
import { useRouter } from "@/navigation";

export const UserMenu: FC = () => {
  const router = useRouter();
  const c = useTranslations("component");
  const { user, username_header, shortname, isAdmin, isLoggedIn, loadUser } =
    UserStore();
  const clearUser = UserStore((state) => state.clearUser);

  const handleLogOut = () => {
    clearUser();
    router.push("/login");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/home");
  };
  const pathname = usePathname();
  // console.log("Current Pathname:", pathname);
  const items: MenuProps["items"] = [
    {
      label: <a href="http://dummy/profile">{c("userMenu.profile")}</a>,
      key: 0,
    },
    {
      type: "divider",
    },
    {
      label: <a onClick={handleLogOut}>{c("userMenu.logOut")}</a>,
      key: 3,
    },
  ];

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  if (!isLoggedIn()) {
    return <></>;
  }

  return (
    <div
      className="user-menu-dropdown"
      style={{ padding: "0.5rem", borderRadius: "0.5rem" }}
    >
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Avatar
          style={{
            backgroundColor: "#FF8888",
            color: "#fafafa",
            borderWidth: "0px",
            borderColor: "#2f54eb",
          }}
          alt={shortname()}
          size="large"
          gap={2}
        >
          <strong>{shortname()}</strong>
        </Avatar>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div>{username_header()}</div>
        </div>

        <Button
          style={{
            width: "5rem",
            background: "#cccccc",
            border: "0 none",
            alignItems: "center",
          }}
          type="default"
          htmlType="submit"
          onClick={handleLogOut}
        >
          Logout
        </Button>

        {pathname.includes("/home") ? null : (
          <>
            <Button
              style={{
                background: "#cccccc",
                border: "0 none",
              }}
              icon={
                <img
                  src="/assets/images/back.png"
                  alt="Go Back"
                  style={{
                    width: "20px",
                    height: "20px",
                  }}
                />
              }
              onClick={handleGoBack}
            />
            <Button
              style={{
                background: "#cccccc",
                border: "0 none",
              }}
              icon={
                <img
                  src="/assets/images/home.png"
                  alt="Go Home"
                  style={{
                    width: "20px",
                    height: "20px",
                  }}
                />
              }
              onClick={handleGoHome}
            />
          </>
        )}
      </div>

      {!pathname.includes("/home") && (
        <div
          style={{
            marginTop: "1rem",
            alignSelf: "flex-end",
            fontSize: "18px",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          {getFormattedDate()}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
