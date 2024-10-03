import { MaterialSymbol } from 'react-material-symbols';
import { MenuButton } from '../../components/MenuButton';
import { useModal } from '../../hooks';
import { Channel } from '../../store/gateway';
import ConfirmModal from '../../components/ConfirmModal';
import Http from '../../http';

type Props = {
  managesChannels: boolean;
  channel: Channel;
};

export default function ChannelMenu({ managesChannels, channel }: Props) {
  const setModal = useModal();

  const manage = [];
  if (managesChannels) {
    async function deleteChannel() {
      const http = new Http();
      await http.deleteChannel(channel.id);
    }

    function openDeleteModal() {
      setModal(
        <ConfirmModal confirm="Delete channel" onClick={deleteChannel}>
          Do you want to delete '{channel.name}'?
        </ConfirmModal>,
      );
    }

    manage.push(
      <MenuButton>
        <MaterialSymbol icon="settings" size={22} />
        <span>Edit Channel</span>
      </MenuButton>,
      <MenuButton textColor="text-red-500" onClick={openDeleteModal}>
        <MaterialSymbol icon="delete" size={22} />
        <span>Delete Channel</span>
      </MenuButton>,
    );
  }

  return (
    <>
      <div className="flex flex-col items-start overflow-hidden rounded-md bg-zinc-800">
        <MenuButton>
          <MaterialSymbol icon="content_copy" size={22} />
          <span>Copy Channel ID</span>
        </MenuButton>
        {manage}
      </div>
    </>
  );
}
