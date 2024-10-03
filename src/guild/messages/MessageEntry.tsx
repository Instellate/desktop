import { useEffect, useRef } from 'react';
import { Member } from '../../store/gateway';
import { useContextMenu, useMarkdownRules } from '../../hooks';
import MessageMenu from './MessageMenu';
import Http from '../../http';
import './Chat.css';
import { useAppSelector } from '../../store/hooks';
import SimpleMarkdown, { ParserRules } from '@khanacademy/simple-markdown';

export interface MessageType {
  createdBy: string;
  replyingTo?: string;
  content: MessageContent[];
}

interface MessageContent {
  id: string;
  content: string;
  createdAt: number;
  pending: boolean;
}

type Props = {
  messages: MessageType;
  author: Member;
  onClick?: (div: HTMLElement, member: Member, id: string) => void;
  channelId: string;
  edit: string | undefined;
  setEdit: (_: string | undefined) => void;
  canDelete: boolean;
};

function formatDate(date: Date) {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const inputDate = new Date(date);
  const inputDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

  const time = inputDate.toLocaleTimeString('se-sv', { hour: '2-digit', minute: '2-digit' });

  if (inputDay.getTime() === today.getTime()) {
    return `Today at ${time}`;
  } else if (inputDay.getTime() === yesterday.getTime()) {
    return `Yesterday at ${time}`;
  } else if (inputDay.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${time}`;
  } else {
    const formattedDate = inputDate.toLocaleDateString(undefined, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    return `${formattedDate} ${time}`;
  }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('se-sv', { hour: '2-digit', minute: '2-digit' });
}

function MessageContent({
  children,
  editMode,
  setEdit,
  channelId,
  messageId,
}: {
  children: string;
  editMode: boolean;
  setEdit: (_: string | undefined) => void;
  messageId: string;
  channelId: string;
}) {
  const input = useRef<HTMLTextAreaElement>(null);
  const rules = useMarkdownRules();
  const parser = SimpleMarkdown.parserFor(rules as unknown as ParserRules);
  const output = SimpleMarkdown.outputFor(rules, 'react');

  const ast = parser(children.replace('\n', '\n\n'));
  const md = output(ast);

  useEffect(() => {
    if (input.current !== null) {
      input.current.focus();
      input.current.setSelectionRange(children.length, children.length, 'forward');
    }
  }, [children, children.length, editMode]);

  if (editMode) {
    async function save() {
      if (input!.current?.value.trim() === children) {
        setEdit(undefined);
        return;
      }
      const http = new Http();
      await http.editMessage(channelId, messageId, { content: input.current!.value.trim() });
      setEdit(undefined);
    }

    async function onInput(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Enter' && !e.shiftKey) {
        await save();
        e.preventDefault();
        document.getElementById('messageInput')?.focus();
      } else if (e.key === 'Escape') {
        setEdit(undefined);
        document.getElementById('messageInput')?.focus();
      }
    }

    return (
      <>
        <div className="mr-4 mt-2 flex flex-grow">
          <div className="grow-wrap w-full rounded-md bg-neutral-600 p-1">
            <textarea
              placeholder="Message..."
              defaultValue={children}
              ref={input}
              className="h-auto w-full resize-none overflow-y-auto rounded-md bg-inherit outline-none"
              onKeyDown={onInput}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const parentNode = target.parentNode as HTMLDivElement;
                parentNode.dataset.replicatedValue = target.value;
              }}
              rows={1}
            />
          </div>
        </div>
        <span>
          Enter to{' '}
          <button className="text-blue-400" onClick={save}>
            save
          </button>{' '}
          &#8226; Escape to{' '}
          <button className="text-blue-400" onClick={() => setEdit(undefined)}>
            cancel
          </button>
        </span>
      </>
    );
  } else {
    return <div className="w-fit break-words">{md}</div>;
  }
}

function PartialMessage({
  message,
  isAuthor,
  channelId,
  edit,
  setEdit,
  canDelete,
}: {
  message: MessageContent;
  isAuthor: boolean;
  channelId: string;
  edit: string | undefined;
  setEdit: (_: string | undefined) => void;
  canDelete: boolean;
}) {
  const contextMenu = useContextMenu(
    <MessageMenu
      key={message.id}
      channelId={channelId}
      isAuthor={isAuthor}
      messageId={message.id}
      setEditMode={() => setEdit(message.id)}
      canDelete={canDelete}
    />,
  );

  return (
    <>
      <div
        className="flex items-center rounded-sm pl-2 hover:bg-neutral-700 [&_.show-time]:hover:visible"
        {...contextMenu}
      >
        <div className="show-time invisible absolute text-xs font-light">
          {formatTime(new Date(message.createdAt * 1000))}
        </div>
        <span className={`ml-12 flex flex-grow flex-col ${message.pending ? 'text-gray-500' : ''}`}>
          <MessageContent
            setEdit={setEdit}
            channelId={channelId}
            messageId={message.id}
            editMode={edit === message.id}
          >
            {message.content}
          </MessageContent>
        </span>
      </div>
    </>
  );
}

export default function MessageEntry({
  messages,
  author,
  onClick,
  channelId,
  edit,
  setEdit,
  canDelete,
}: Props) {
  const rootDiv = useRef<HTMLDivElement>(null);
  const username = useRef<HTMLButtonElement>(null);
  const [firstMessage, ...otherMessages] = messages.content;
  const isAuthor: boolean = useAppSelector((s) => s.currentUser.value?.id === author.user.id);

  const contextMenu = useContextMenu(
    <MessageMenu
      isAuthor={isAuthor}
      messageId={firstMessage.id}
      channelId={channelId}
      setEditMode={() => setEdit(firstMessage.id)}
      canDelete={canDelete}
    />,
  );

  const formattedMessage = otherMessages.map((m) => (
    <PartialMessage
      isAuthor={isAuthor}
      key={m.id}
      message={m}
      channelId={channelId}
      edit={edit}
      setEdit={setEdit}
      canDelete={canDelete}
    />
  ));

  return (
    <>
      {formattedMessage.reverse()}
      <div className="flex gap-2 rounded-sm hover:bg-neutral-700" ref={rootDiv} {...contextMenu}>
        <button className="h-fit">
          <img
            src={`https://identicon.02420.dev/${author.user.username}/48?format=png`}
            className="min-w-12 rounded-full"
            onClick={() => {
              setTimeout(
                // Weird way to prevent the onClick to get triggered.
                () => onClick?.call(undefined, rootDiv.current!, author, firstMessage.id),
                0,
              );
            }}
          />
        </button>
        <div className="flex flex-grow flex-col">
          <div>
            <button
              onClick={() => {
                setTimeout(
                  () => onClick?.call(undefined, username.current!, author, firstMessage.id),
                  0,
                );
              }}
              ref={username}
            >
              <strong>{author.user.displayName}</strong>
            </button>
            <span className="ml-2 text-xs text-gray-300">
              {formatDate(new Date(firstMessage.createdAt * 1000))}
            </span>
          </div>
          <div className={`${firstMessage.pending ? 'text-gray-500' : ''} flex flex-grow flex-col`}>
            <MessageContent
              channelId={channelId}
              messageId={firstMessage.id}
              editMode={edit === firstMessage.id}
              setEdit={setEdit}
            >
              {firstMessage.content}
            </MessageContent>
          </div>
        </div>
      </div>
    </>
  );
}
