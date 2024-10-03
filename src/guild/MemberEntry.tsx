import { useRef } from 'react';
import { Member, PresenceStatus } from '../store/gateway';

interface Props {
  member: Member;
  status: PresenceStatus;
  color?: string;
  statusMessage?: string;
  onClick?: (div: HTMLElement, member: Member, id: string) => void;
}

export default function MemberEntry({ member, status, statusMessage, onClick, color }: Props) {
  const rootDiv = useRef<HTMLButtonElement>(null);

  if (status === PresenceStatus.offline) {
    return (
      <>
        <button
          ref={rootDiv}
          className="m-1 flex flex-grow gap-2 overflow-hidden rounded-sm p-1 brightness-50 hover:bg-neutral-700 hover:brightness-100 [&_.hover-color]:hover:bg-neutral-700"
          onClick={() => {
            setTimeout(() => onClick?.call(undefined, rootDiv.current!, member, member.user.id), 0);
          }}
        >
          <div className="relative min-h-10 min-w-10">
            <img
              src={`https://identicon.02420.dev/${member.user.username}/40?format=png`}
              className="w-10 rounded-full"
            />
          </div>
          <div className="flex w-min flex-col justify-center overflow-hidden">
            <p className="truncate" style={{ color }}>
              {member.user.displayName}
            </p>
          </div>
        </button>
      </>
    );
  }

  let presence: React.ReactNode | undefined = undefined;

  if (statusMessage !== undefined) {
    presence = <span className="text-xs">{status}</span>;
  }

  let statusColor;
  switch (status) {
    case PresenceStatus.online:
      statusColor = 'bg-green-500';
      break;
    case PresenceStatus.idle:
      statusColor = 'bg-yellow-300';
      break;
  }

  return (
    <>
      <button
        ref={rootDiv}
        className="m-1 flex flex-grow gap-2 overflow-hidden rounded-sm p-1 hover:bg-neutral-700 [&_.hover-color]:hover:bg-neutral-700"
        onClick={() => {
          setTimeout(() => onClick?.call(undefined, rootDiv.current!, member, member.user.id), 0);
        }}
      >
        <div className="relative min-h-10 min-w-10">
          <img
            src={`https://identicon.02420.dev/${member.user.username}/40?format=png`}
            className="w-10 rounded-full"
          />
          <div className="hover-color absolute -bottom-0.5 left-6 flex h-4 w-4 items-center justify-center rounded-full bg-[#1b1b1b] p-1">
            <div className={`rounded-full ${statusColor} h-full w-full rounded-full`} />
          </div>
        </div>
        <div className="flex w-min flex-col justify-center overflow-hidden">
          <p className="truncate" style={{ color }}>
            {member.user.displayName}
          </p>
          {presence}
        </div>
      </button>
    </>
  );
}
