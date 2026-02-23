import React from "react";

export interface DatePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  className,
  ...props
}) => {
  return (
    <input
      type="date"
      className={className}
      value={selected ? selected.toISOString().split("T")[0] : ""}
      onChange={(e) => {
        const date = e.target.value ? new Date(e.target.value) : null;
        onChange(date);
      }}
      {...props}
    />
  );
};

export default DatePicker;
