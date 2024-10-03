import { useModal } from '../hooks';
import Button from './Button';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  confirm: string;
  onClick: () => void;
};

export default function ConfirmModal({ children, confirm, onClick }: Props) {
  const setModal = useModal();

  return (
    <>
      <div className="flex w-96 flex-col gap-2 rounded-md bg-zinc-800 p-4">
        <strong className="text-lg">{children}</strong>
        <div className="flex flex-row-reverse gap-4">
          <Button type="caution" onClick={() => {
            onClick();
            setModal(undefined);
          }}>
            {confirm}
          </Button>
          <button className="hover:underline" onClick={() => setModal(undefined)}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
