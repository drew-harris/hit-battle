interface ButtonProps {
  onClick?: (...args: unknown[]) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}
export default function Button({
  onClick,
  className,
  disabled,
  children,
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
      {children}
    </button>
  );
}
