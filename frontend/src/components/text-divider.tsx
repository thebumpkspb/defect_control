interface TextDividerProps {
  upperText: string;
  lowerText: string;
  className?: string;
}

export default function TextDivider({
  upperText = "Upper Text",
  lowerText = "Lower Text",
  className = "",
}: TextDividerProps) {
  return (
    <div className={`flex flex-col items-center space-y-0.5 ${className}`}>
      {/* Upper Text */}
      <span className="text-sm font-medium text-gray-700">{upperText}</span>

      {/* Dividing Line */}
      <div className="w-full h-px bg-black-900"></div>

      {/* Lower Text */}
      <span className="text-sm font-medium text-gray-700">{lowerText}</span>
    </div>
  );
}
