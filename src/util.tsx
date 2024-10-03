import { useCallback } from 'react';
import MemberProfile from './components/MemberProfile';
import { Channel, GuildCache, Member, Permissions } from './store/gateway';

export function hasPermission(
  member: Member,
  guild: GuildCache,
  permission: Permissions,
  channel: Channel | undefined = undefined,
): boolean {
  const roles = member.roles.map((r) => guild.roles.get(r)).filter((r) => r !== undefined);
  let userPermission;

  if (channel === undefined) {
    userPermission = Permissions.normalisedGuild;
    for (const role of roles) {
      userPermission |= role.permission;
    }
  } else {
    userPermission = Permissions.normalisedChannel;

    for (const role of roles) {
      userPermission |= role.permission;
    }

    for (const channelPermission of channel.rolePermissions) {
      if (roles.some((r) => r.id == channelPermission.roleId)) {
        userPermission |= channelPermission.allowed;
        userPermission &= ~channelPermission.disallowed;
      }
    }
  }

  return (userPermission & permission) != 0;
}

export interface UserProfileInfo {
  node: React.ReactNode;
  id: string;
}

export function useUserProfileFunction(
  userProfile: UserProfileInfo | undefined,
  setUserProfile: (profile: undefined | UserProfileInfo) => void,
  guild: GuildCache,
  offsetLeft: number,
  offsetTop: number,
) {
  return useCallback(
    (element: HTMLElement, member: Member, id: string) => {
      if (userProfile?.id === id) {
        setUserProfile(undefined);
      } else {
        setUserProfile({
          id: id,
          node: (
            <MemberProfile
              offsetLeft={element.offsetLeft - offsetLeft}
              offsetTop={element.offsetTop - offsetTop}
              derender={() => setUserProfile(undefined)}
              member={member}
              guild={guild}
            />
          ),
        });
      }
    },
    [guild, offsetLeft, offsetTop, setUserProfile, userProfile?.id],
  );
}
