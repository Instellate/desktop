import { Link } from 'react-router-dom';
import { Channel } from '../../store/gateway';
import { useContextMenu } from '../../hooks';
import ChannelMenu from './ChannelMenu';

type Props = {
  channel: Channel;
  setSelected: (_: string) => void;
  selected: string | undefined;
  guildId: string;
  managesChannels: boolean;
};

export default function ChannelEntry({
  channel,
  setSelected,
  guildId,
  selected,
  managesChannels,
}: Props) {
  const contextMenu = useContextMenu(
    <ChannelMenu managesChannels={managesChannels} channel={channel} />,
  );

  return (
    <Link
      key={channel.id}
      className={`my-1 flex items-center rounded-md py-1 hover:bg-neutral-800 ${selected === channel.id ? 'bg-neutral-800' : ''}`}
      to={`/guilds/${guildId}/${channel.id}`}
      onClick={() => setSelected(channel.id)}
      {...contextMenu}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#e8eaed"
        className="h-6 w-6 rotate-180"
      >
        <path d="m240-160 40-160H120l20-80h160l40-160H180l20-80h160l40-160h80l-40 160h160l40-160h80l-40 160h160l-20 80H660l-40 160h160l-20 80H600l-40 160h-80l40-160H360l-40 160h-80Zm140-240h160l40-160H420l-40 160Z" />
      </svg>
      <span className="text-sm">{channel.name}</span>
    </Link>
  );
}
