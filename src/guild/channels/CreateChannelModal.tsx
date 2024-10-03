import { useContext, useRef, useState } from 'react';
import { ModalContext } from '../../hooks';
import Http from '../../http';
import Button from '../../components/Button';

type Props = {
  guildId: string;
  category?: string;
};

export default function CreateChannelModal({ guildId, category }: Props) {
  const { setValue } = useContext(ModalContext)!;
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>(' ');

  async function createChannel() {
    if (input.current?.value.trim() === '') {
      setError('Channel name cannot be empty');
      return;
    }

    const http = new Http();
    await http.createChannel(guildId, {
      category,
      name: input.current!.value,
    });
    setValue(undefined);
  }

  return (
    <>
      <div className="flex w-96 flex-col gap-2 rounded-md bg-zinc-800 p-4">
        <strong>Create a channel!</strong>
        <div className="overflow-hidden rounded-md bg-neutral-700 px-1 py-2">
          <input
            ref={input}
            type="text"
            className="w-full bg-inherit outline-none"
            placeholder="Name..."
          />
        </div>
        <span className="text-xs text-red-500">{error}&#8203;</span>
        <div className="flex flex-row-reverse gap-4">
          <Button onClick={createChannel}>Create channel</Button>
          <button className="hover:underline" onClick={() => setValue(undefined)}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
