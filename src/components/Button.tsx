import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'default' | 'caution';
};

export default function Button({ children, onClick, type = 'default' }: Props) {
  let color;
  switch (type) {
    case 'default':
      color = 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700';
      break;
    case 'caution':
      color = 'bg-red-600 hover:bg-red-500 active:bg-red-700';
      break;
  }

  return (
    <>
      <button onClick={onClick} className={`w-fit rounded-md px-2 py-2 ${color}`}>
        {children}
      </button>
    </>
  );
}
