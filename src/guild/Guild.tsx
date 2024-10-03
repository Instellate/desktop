import InfoBar from './InfoBar';
import MemberBar from './MemberBar';
import Chat from './messages/Chat';
import { useAppSelector } from '../store/hooks';
import { useNavigate, useParams } from 'react-router-dom';

export default function Guild() {
  const { guildId, channelId } = useParams();
  const isReady = useAppSelector((s) => s.guilds.isReady);
  const guild = useAppSelector((s) => s.guilds.value.get(guildId!));
  const channel = guild?.channels.get(channelId!);
  const navigator = useNavigate();

  if (!isReady) {
    return <span>Is loading...</span>;
  }

  if (guild === undefined) {
    navigator('/@me');
    return <></>;
  }

  if (channel === undefined) {
    navigator(`/guilds/${guildId}/${guild.channels.keys().next().value}`);
    return <></>;
  }

  return (
    <>
      <InfoBar>
        <Chat guild={guild} channel={channel} />
        <MemberBar guild={guild} channel={channel} />
      </InfoBar>
    </>
  );
}
