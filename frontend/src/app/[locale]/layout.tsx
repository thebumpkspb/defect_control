import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";

import "../globals.scss";
import getRequestConfig from "@/i18n";
import LayoutCustom from "@/components/layout/layout";
import { locales } from "@/navigation";
import StyledComponentsRegistry from "../../lib/AntdRegistry";
import { AuthProvider } from "@/context/auth-context";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "EPD Defect Control",
  description: "Powered by JI & DX",
  icons: "../favicon.ico",
};

const LocaleLayout = async ({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: (typeof locales)[number] };
}) => {
  const dict = await getRequestConfig({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={dict.messages}>
          <StyledComponentsRegistry>
            <Loading>
              <LayoutCustom>
                <AuthProvider>{children}</AuthProvider>
              </LayoutCustom>
            </Loading>
          </StyledComponentsRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};
export default LocaleLayout;
