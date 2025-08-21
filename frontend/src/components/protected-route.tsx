"use client";

import type React from "react";

import { useEffect } from "react";
// import {  useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "@/navigation";
import { Spin } from "antd";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  // console.log("protect");
  // console.log("user:", user);
  // console.log("isLoading:", isLoading);
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      // redirect()
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      // <div className="flex items-center justify-center min-h-screen">
      // {/* Loading... */}

      <Spin
        spinning={isLoading}
        style={{ top: "50%", transform: "translateY(-50%)" }}
      ></Spin>
      // </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
