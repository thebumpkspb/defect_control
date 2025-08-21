import { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.scss";
import { AuthProvider } from "@/context/auth-context";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: "EPD Defect Control",
  description: "Powered by JI & DX",
  icons: "/favicon.ico",
};

export default function RootLayout({ children }: Props) {
  return children;
}
// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     // <html lang="en">
//     // <body>
//     <AuthProvider>{children}</AuthProvider>
//     // {/* </body> */}
//     // {/* </html> */}
//   );
// }
