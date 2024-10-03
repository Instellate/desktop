import { MaterialSymbol } from 'react-material-symbols';
import ConfirmModal from '../../components/ConfirmModal';
import { MenuButton } from '../../components/MenuButton';
import { useModal } from '../../hooks';
import Http from '../../http';

type Props = {
  messageId: string;
  channelId: string;
  isAuthor: boolean;
  setEditMode: () => void;
  canDelete: boolean;
};

export default function MessageMenu({
  messageId,
  channelId,
  isAuthor,
  setEditMode,
  canDelete,
}: Props) {
  const setModal = useModal();

  const nodes = [];

  if (isAuthor) {
    nodes.push(
      <MenuButton onClick={() => setEditMode()} key="edit">
        <MaterialSymbol icon="edit" size={22} />
        <span>Edit</span>
      </MenuButton>,
    );
  }

  nodes.push(
    <MenuButton key="reply">
      <MaterialSymbol icon="reply" size={22} />
      <span>Reply</span>
    </MenuButton>,
    <MenuButton key="copy">
      <MaterialSymbol icon="content_copy" size={22} />
      <span>Copy Content</span>
    </MenuButton>,
  );

  if (isAuthor || canDelete) {
    function openDeleteModal() {
      setModal(
        <ConfirmModal confirm="Delete message" onClick={deleteMessage}>
          Are you sure you want to delete this message?
        </ConfirmModal>,
      );
    }

    async function deleteMessage() {
      const http = new Http();
      await http.deleteMessage(channelId, messageId);
    }

    nodes.push(
      <MenuButton onClick={openDeleteModal} key={'delete'} textColor='text-red-500'>
        <MaterialSymbol icon="delete" size={22} />
        <span>Delete message</span>
      </MenuButton>,
    );
  }

  return (
    <>
      <div className="flex flex-col items-start rounded-md bg-zinc-800">{nodes}</div>
    </>
  );
}
