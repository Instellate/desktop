import { useEffect, useRef } from 'react';
import { GuildCache, Member } from '../store/gateway';
import React from 'react';

interface Prop {
  offsetLeft: number;
  offsetTop: number;
  derender: () => void;
  member: Member;
  guild: GuildCache;
}

export default function MemberProfile({ offsetLeft, offsetTop, derender, member, guild }: Prop) {
  const rootDiv = useRef<HTMLDivElement>(null);

  function onClick(e: MouseEvent) {
    const element = e.target as Element;
    if (rootDiv.current && !rootDiv.current.contains(element)) {
      derender();
    }
  }

  useEffect(() => {
    const rootBottom = rootDiv.current!.parentElement!.getBoundingClientRect().bottom;
    const absoluteBottom = rootDiv.current!.getBoundingClientRect().bottom;
    if (absoluteBottom - rootBottom >= 0) {
      const newTop =
        Math.abs(absoluteBottom - (absoluteBottom + rootBottom - rootDiv.current!.offsetHeight)) -
        56;
      rootDiv.current!.style.top = `${newTop}px`;
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  });

  const roleNodes = member.roles.map((r) => {
    const role = guild.roles.get(r)!;
    if (role.id === guild.id) {
      return;
    }
    return (
      <React.Fragment key={role.id}>
        <div className="flex w-fit items-center gap-1 rounded-md bg-neutral-900 px-1 py-0.5">
          <div className="h-2 w-2 rounded-full bg-white" />
          <strong className="text-xs">{role.name}</strong>
        </div>
      </React.Fragment>
    );
  });

  return (
    <>
      <div
        className="absolute z-30 flex h-fit w-80 overflow-hidden rounded-md bg-neutral-800"
        style={{
          top: offsetTop,
          left: offsetLeft,
        }}
        id="userProfile"
        ref={rootDiv}
      >
        <div className="relative mb-1 h-full w-full">
          <div className="h-24 bg-[#1b1b1b]" />
          <div className="absolute top-12 mx-4 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-800 p-2">
            <img
              src={`https://identicon.02420.dev/${member.user.username}/80?format=png`}
              className="h-fit w-fit rounded-full"
            />
          </div>
          <div className="mx-6 mt-12 flex flex-col">
            <strong className="text-lg">{member.user.displayName}</strong>
            <span className="text-xs">{member.user.username}</span>
            <div className="my-2 flex flex-wrap gap-1">{roleNodes}</div>
          </div>
        </div>
      </div>
    </>
  );
}
