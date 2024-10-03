import { GuildCache } from '../store/gateway';
import { useAppSelector } from '../store/hooks';

type Props = {
  id: string;
};

export function Mention({ id }: Props) {
  const guild: GuildCache = useAppSelector((s) => s.guilds.value.values().next().value);
  const member = guild.members.get(id);

  return (
    <button>
      <strong className="bg-[#23c6e71a] px-0.5 text-[#52c9e0ff]">
        @{member?.user.displayName}
      </strong>
    </button>
  );
}
