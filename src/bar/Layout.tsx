import { Outlet, useParams } from 'react-router-dom';
import GuildIcon from './GuildIcon';
import { useMemo, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import {
  MenuComponentContext,
  MenuComponentValue,
  MenuComponentType,
  ModalContext,
  ModalContextType,
} from '../hooks';
import ContextMenu from '../components/ContextMenu';
import Modal from '../components/Modal';
import { MaterialSymbol } from 'react-material-symbols';

export default function Layout() {
  const guilds = useAppSelector((s) => s.guilds.value);
  const { guildId } = useParams();
  const [selected, setSelected] = useState<string | undefined>(guildId);

  const [contextMenu, setContextMenu] = useState<MenuComponentValue | undefined>(undefined);
  const contextMenuObj: MenuComponentType = useMemo(() => {
    return {
      value: contextMenu,
      setValue: setContextMenu,
    };
  }, [contextMenu, setContextMenu]);

  const [modal, setModal] = useState<React.ReactNode | React.ReactNode[] | undefined>();
  const modalContext: ModalContextType = useMemo(() => {
    return {
      value: modal,
      setValue: setModal,
    };
  }, [modal, setModal]);

  const icons = useMemo(() => {
    const res = [];

    for (const guild of guilds.values()) {
      res.push(
        <div key={guild.id}>
          <GuildIcon
            url={`https://identicon.02420.dev/${guild.name}/48?format=png`}
            isSelected={selected === guild.id}
            onClick={() => setSelected(guild.id)}
          />
        </div>,
      );
    }

    return res;
  }, [guilds, selected]);

  document.addEventListener('contextmenu', (e) => e.preventDefault());

  return (
    <>
      <ModalContext.Provider value={modalContext}>
        <MenuComponentContext.Provider value={contextMenuObj}>
          <ContextMenu />
          <Modal />
          <nav className="flex w-16 min-w-16 max-w-16 flex-grow flex-col gap-2 overflow-hidden overflow-y-auto bg-[#1f1f1f]">
            <div className="rounding mx-2 mt-2 flex h-12 w-12 items-center justify-center bg-slate-600">
              <MaterialSymbol size={32} icon="home" />
            </div>
            <div className="flex justify-center">
              <div className="h-1 w-3/4 rounded-md bg-slate-500" />
            </div>
            {icons}
          </nav>
          <Outlet />
        </MenuComponentContext.Provider>
      </ModalContext.Provider>
    </>
  );
}
