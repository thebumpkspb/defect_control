import React, { useState, ReactNode } from "react";
import { Popover } from "antd";

interface CustomPopoverProps {
  title: string; // Title of the popover
  triggerElement: ReactNode; // Element that triggers the popover
  popoverContent: (closePopover: () => void) => ReactNode; // Function that receives a closePopover method
  trigger?: "click" | "hover" | "focus"; // Trigger action
}

const CustomPopover: React.FC<CustomPopoverProps> = ({
  title,
  triggerElement,
  popoverContent,
  trigger = "click",
}) => {
    const [clicked, setClicked] = useState(false);

    const handleOpenChange = (open: boolean) => {
      setClicked(open);
    };
  
    const closePopover = () => {
      setClicked(false);
    };
  
    return (
      <Popover
        content={popoverContent(closePopover)}
        title={title}
        trigger={trigger}
        open={clicked}
        onOpenChange={handleOpenChange}
      >
        {triggerElement}
      </Popover>
    );
  };

export default CustomPopover;
