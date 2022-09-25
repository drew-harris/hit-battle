interface ButtonProps {
  label: string;
  onClick?: (arg0: any) => void;
  className?: string;
  disabled?: boolean;
}
export default function Button({
  label,
  onClick,
  className,
  disabled,
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={
        "rounded bg-tan-400 p-1 px-2 font-semibold text-white transition-transform hover:scale-105 hover:shadow-md " +
        className +
        (disabled ? " cursor-not-allowed opacity-50" : "")
      }
    >
      {label}
    </button>
  );
}
