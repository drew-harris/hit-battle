interface ButtonProps {
  label: string;
  onClick?: () => void;
}
export default function Button({ label, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="ml-2 rounded bg-tan-500 p-1 px-2 font-semibold text-white transition-transform hover:scale-105 hover:shadow-md"
    >
      {label}
    </button>
  );
}
