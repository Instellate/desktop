import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useMemo, useState } from 'react';
import { hasPermission } from '../util';
import { Permissions } from '../store/gateway';
import CreateChannelModal from './channels/CreateChannelModal';
import { useModal } from '../hooks';
import ChannelEntry from './channels/ChannelEntry';
import { MaterialSymbol } from 'react-material-symbols';

export default function GuildBar() {
  const { guildId, channelId } = useParams();
  const navigator = useNavigate();
  const isReady = useAppSelector((s) => s.guilds.isReady);
  const guild = useAppSelector((s) => s.guilds.value.get(guildId!));
  const userId = useAppSelector((s) => s.currentUser.value?.id);
  const member = guild?.members.get(userId ?? '');
  const [selected, setSelected] = useState(channelId);
  const setModal = useModal();

  const channelList = useMemo(() => {
    if (guild === undefined) {
      return [];
    }

    const entries: React.ReactNode[] = [];
    for (const category of guild.categories) {
      const channelEntries: React.ReactNode[] = [];

      // guild.channels.values().filter((c) => c.categoryName == category.name);
      const channels = [];
      const channelIt = guild.channels.values();
      for (const channel of channelIt) {
        if (channel.categoryName === category.name) {
          channels.push(channel);
        }
      }

      for (const channel of channels) {
        if (!hasPermission(member!, guild, Permissions.viewChannel, channel)) {
          continue;
        }

        channelEntries.push(
          <ChannelEntry
            channel={channel}
            guildId={guild.id}
            selected={selected}
            setSelected={setSelected}
            key={channel.id}
            managesChannels={hasPermission(member!, guild, Permissions.manageChannels)}
          />,
        );
      }

      let createChannel: React.ReactNode | undefined;
      if (hasPermission(member!, guild, Permissions.manageChannels)) {
        createChannel = (
          <button
            onClick={() =>
              setModal(<CreateChannelModal guildId={guildId!} category={category.name} />)
            }
          >
            <MaterialSymbol icon="add" size={20} />
          </button>
        );
      } else {
        createChannel = undefined;
      }

      entries.push(
        <details open className="[&_.collapse-icon]:open:rotate-90" key={category.name}>
          <summary className="flex list-none justify-between">
            <div className="flex list-none items-center text-sm">
              <MaterialSymbol className="collapse-icon h-5 w-5" icon="chevron_right" size={20} />
              {category.name}
            </div>
            {createChannel}
          </summary>
          {channelEntries}
        </details>,
      );
    }

    return entries;
  }, [guild, guildId, member, selected, setModal]);

  if (!isReady) {
    return (
      <>
        <span>Loading...</span>
      </>
    );
  }

  if (guild === undefined) {
    navigator('/@me');
    return <></>;
  }

  if (channelId === undefined) {
    navigator(`/guilds/${guild.id}/${guild.channels.keys().next().value}`);
    return <></>;
  }


  return (
    <>
      <div className="flex w-72 flex-col gap-2 overflow-y-auto bg-[#1b1b1b] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">{guild.name}</h3>
          <MaterialSymbol icon="chevron_right" className="rotate-90" />
        </div>
        {channelList}
      </div>
      <Outlet />
    </>
  );
}
