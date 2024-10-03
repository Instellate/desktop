import { useEffect, useMemo, useRef, useState } from 'react';
import { Channel, GuildCache, Message, Permissions } from '../../store/gateway';
import MessageEntry, { MessageType } from './MessageEntry';
import { useGateway } from '../../hooks';
import { useUserProfileFunction, UserProfileInfo, hasPermission } from '../../util';
import Http, { HttpError } from '../../http';
import { useAppSelector } from '../../store/hooks';
import './Chat.css';
import MessageInput from '../../components/MessageInput';

interface MessageData extends Message {
  pending?: boolean;
}

function isMoreThanAMinute(time1: number, time2: number) {
  return Math.abs(time1 - time2) > 60;
}

function makeStreamId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function sortMessages(messages: MessageData[]): MessageType[] {
  let lastTime: number | undefined = undefined;
  let lastMessage: MessageType | undefined = undefined;

  const sortedMessages: MessageType[] = [];
  for (const message of messages) {
    if (message.replyingTo !== undefined) {
      const newMessage: MessageType = {
        createdBy: message.createdBy,
        replyingTo: message.replyingTo,
        content: [
          {
            content: message.content,
            createdAt: message.createdAt,
            id: message.id,
            pending: message.pending ?? false,
          },
        ],
      };
      lastMessage = newMessage;
      lastTime = message.createdAt;
    }

    if (lastMessage?.createdBy === message.createdBy) {
      if (!isMoreThanAMinute(lastTime!, message.createdAt)) {
        lastMessage.content.unshift({
          content: message.content,
          createdAt: message.createdAt,
          id: message.id,
          pending: message.pending ?? false,
        });
        lastTime = message.createdAt;
      } else {
        const newMessage: MessageType = {
          createdBy: message.createdBy,
          replyingTo: message.replyingTo,
          content: [
            {
              id: message.id,
              content: message.content,
              createdAt: message.createdAt,
              pending: message.pending ?? false,
            },
          ],
        };
        lastMessage = newMessage;
        lastTime = message.createdAt;
        sortedMessages.push(newMessage);
      }
    } else {
      const newMessage: MessageType = {
        createdBy: message.createdBy,
        replyingTo: message.replyingTo,
        content: [
          {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            pending: message.pending ?? false,
          },
        ],
      };
      lastMessage = newMessage;
      lastTime = message.createdAt;
      sortedMessages.push(newMessage);
    }
  }

  return sortedMessages;
}

interface Error {
  message: string;
  statusCode: number;
}

interface Props {
  guild: GuildCache;
  channel: Channel;
}

export default function Chat({ guild, channel }: Props) {
  const userId = useAppSelector((s) => s.currentUser.value?.id);
  const member = guild.members.get(userId!)!;
  const [messages, setMessages] = useState<MessageData[] | undefined>(undefined);
  const [userProfile, setUserProfile] = useState<UserProfileInfo | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>();
  const sortedMessages = useMemo(() => sortMessages(messages ?? []), [messages]);
  const [edit, setEdit] = useState<string | undefined>(undefined);
  const messageInput = useRef<HTMLTextAreaElement>(null);

  const createUserProfile = useUserProfileFunction(userProfile, setUserProfile, guild, -48, 0);

  const messageState: React.ReactNode | React.ReactNode[] = useMemo(() => {
    if (guild === undefined) {
      return <></>;
    }

    if (messages === undefined) {
      return <span>Loading...</span>;
    } else {
      return sortedMessages.map((m) => {
        const author = guild.members.get(m.createdBy)!;
        return (
          <MessageEntry
            edit={edit}
            setEdit={setEdit}
            key={m.content[0].id}
            messages={m}
            author={author}
            onClick={createUserProfile}
            channelId={channel.id}
            canDelete={hasPermission(member, guild, Permissions.deleteMessage, channel)}
          />
        );
      });
    }
  }, [channel, createUserProfile, edit, guild, member, messages, sortedMessages]);

  useEffect(() => {
    (async () => {
      const http = new Http();
      const messages = await http.getMessages(channel!.id);
      setMessages(messages);
    })();
    messageInput.current?.focus();
  }, [channel]);

  useGateway((type, e) => {
    if (type === 'MESSAGE_CREATE') {
      const pendingMessageIndex = messages?.findIndex((m) => m.stream === e.stream) ?? -1;

      if (pendingMessageIndex >= 0) {
        const newMessages = [...messages!];
        newMessages[pendingMessageIndex].pending = false;
        setMessages(newMessages);
      } else {
        setMessages([e, ...(messages ?? [])]);
      }
    } else if (type === 'MESSAGE_DELETE') {
      setMessages(messages?.filter((m) => m.id !== e.id));
    } else if (type === 'MESSAGE_UPDATE') {
      const messageIndex = messages?.findIndex((m) => m.id === e.id) ?? -1;

      if (messageIndex >= 0) {
        const newMessages = [...messages!];
        newMessages[messageIndex] = { ...newMessages[messageIndex], ...e };
        setMessages(newMessages);
      }
    }
  }, channel.id);

  async function createMessage(content: string) {
    if (!content.replace(/\s/g, '').length) return;
    try {
      const http = new Http();
      const body: MessageData = await http.createMessage(channel.id, {
        content: content.trim(),
        stream: makeStreamId(10),
      });
      body.pending = true;
      setMessages([body, ...(messages ?? [])]);
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        const error: Error = {
          message: err.message,
          statusCode: err.error,
        };
        setError(error);
      }
    }
  }

  if (error !== undefined) {
    if (error.statusCode === 403) {
      return (
        <>
          <span>You don't have access to this channel</span>
        </>
      );
    } else {
      return (
        <>
          <span>Error message: {error.message}</span>
        </>
      );
    }
  }

  return (
    <>
      <div className="relative flex flex-grow flex-col justify-between bg-[#1f1f1f]">
        {userProfile?.node}
        <div className="h-full overflow-y-auto">
          <div className="relative flex h-full select-text flex-col-reverse gap-2 overflow-y-auto p-6">
            {messageState}
          </div>
        </div>
        <div className="m-2 flex flex-grow">
          <MessageInput channel={`#${channel.name}`} sendMessage={createMessage} />
        </div>
      </div>
    </>
  );
}
