export function MenuButton({
  children,
  onClick,
  textColor: text,
}: {
  children?: React.ReactNode | React.ReactNode[];
  onClick?: () => void;
  textColor?: string;
}) {
  return (
    <>
      <button
        onClick={onClick}
        className={'flex w-full items-center gap-2 p-2 hover:bg-zinc-600 ' + text}
      >
        {children}
      </button>
    </>
  );
}
