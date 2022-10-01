interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "className"> {
  bg?: string;
  className?: string;
  label?: string;
}

export default function Input(props: InputProps) {
  const { bg, className, label, ...rest } = props;
  return (
    <div>
      {label && <div className="text-sm">{label}</div>}
      <input
        className={`rounded-md bg-${
          bg ? bg : "tan-200"
        } w-full border-2 border-transparent p-2 focus:border-2 focus:border-tan-500 focus:outline-none md:w-auto ${
          className || ""
        } `}
        {...rest}
      />
    </div>
  );
}
