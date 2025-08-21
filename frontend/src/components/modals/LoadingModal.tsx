import React, { useEffect, useState } from "react";
import { Modal, Spin } from "antd";

interface LoadingModalProps {
  visible: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Prevent SSR mismatch

  return (
    <Modal
      open={visible}
      closable={false}
      footer={null}
      centered
      maskClosable={false}
      maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      style={{ zIndex: 9999 }}
      width={300}
    >
      <div
        style={{
          textAlign: "center",
          height: "200px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: 10, fontSize: 20 }}>Loading...</div>
      </div>
    </Modal>
  );
};

export default LoadingModal;
