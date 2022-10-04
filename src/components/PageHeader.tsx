export default function PageHeader({
  children,
  text,
}: {
  children?: React.ReactNode;
  text: string;
}) {
  return (
    <div className="align-center mb-3 flex justify-between">
      <div className="mb-3 text-2xl font-bold">{text}</div>
      {children}
    </div>
  );
}
