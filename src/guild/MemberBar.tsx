import { useMemo, useState } from 'react';
import {
  Channel,
  GuildCache,
  Member,
  Permissions,
  Presence,
  PresenceStatus,
} from '../store/gateway';
import { useAppSelector } from '../store/hooks';
import { useUserProfileFunction, hasPermission, UserProfileInfo } from '../util';
import MemberEntry from './MemberEntry';
import React from 'react';

interface Props {
  guild: GuildCache;
  channel: Channel;
}

interface RoleInfo {
  name: string;
  id: string;
  members: MemberInfo[];
}

interface MemberInfo {
  member: Member;
  presence: Presence;
  color: string;
}

export default function MemberBar({ guild, channel }: Props) {
  const presence = useAppSelector((p) => p.presence.value);
  const [userProfile, setUserProfile] = useState<UserProfileInfo | undefined>();

  const userEntries = useMemo(() => {
    const users: { presence: Presence; member: Member }[] = [];
    for (const member of guild.members.values()) {
      if (hasPermission(member, guild, Permissions.viewChannel, channel)) {
        if (presence.has(member.user.id)) {
          const userPresence = presence.get(member.user.id)!;

          users.push({
            presence: userPresence,
            member: member,
          });
        } else {
          users.push({
            presence: {
              user: member.user,
              status: PresenceStatus.offline,
            },
            member: member,
          });
        }
      }
    }

    const sortedList: Record<string, RoleInfo> = {
      offline: {
        name: 'Offline',
        id: 'offline',
        members: [],
      },
    };

    for (const [key, role] of guild.roles) {
      sortedList[key] = {
        name: role.name == '@everyone' ? 'Online' : role.name,
        members: [],
        id: key,
      };
    }

    for (const user of users) {
      const sortedRoles = Array.from(user.member.roles)
        .sort((a, b) => guild.roles.get(a)!.createdAt - guild.roles.get(b)!.createdAt)
        .reverse();

      const firstRole = sortedRoles[0];
      let roleColor: string | undefined = undefined;
      for (const memberRole of sortedRoles) {
        const color = guild.roles.get(memberRole)?.color;
        if (color !== undefined) {
          roleColor = color;
        }
      }

      const userData = {
        member: user.member,
        presence: user.presence,
        color: roleColor ?? 'FFFFFF',
      };

      if (user.presence.status === PresenceStatus.offline) {
        sortedList['offline'].members.push(userData);
      } else {
        sortedList[firstRole].members.push(userData);
      }
    }

    return sortedList;
  }, [guild, presence, channel]);

  const createUserProfile = useUserProfileFunction(userProfile, setUserProfile, guild, 328, 2);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const nodes: React.ReactNode[] = Object.entries(userEntries).map(([_, info]) => {
    if (info.members.length <= 0) {
      return;
    }

    return (
      <React.Fragment key={info.id}>
        <strong className="ml-4 text-sm">{info.name}</strong>
        <div className="flex flex-grow">
          {info.members.map((m) => (
            <MemberEntry
              key={m.member.user.id}
              member={m.member}
              status={m.presence.status}
              onClick={createUserProfile}
            />
          ))}
        </div>
      </React.Fragment>
    );
  });

  return (
    <>
      <div className="relative hidden w-64 bg-[#1b1b1b] py-2 lg:block">
        <div className="overflow-auto">{nodes}</div>
        {userProfile?.node}
      </div>
    </>
  );
}
