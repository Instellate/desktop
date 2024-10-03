import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { store } from '.';

interface Opcode<T> {
  op: number;
  t: string;
  d: T;
}

interface Identify {
  token: string;
}

interface ReadyEvent {
  id: string;
  username: string;
  displayName: string;
  guildCount: number;
}

export interface Guild {
  id: string;
  name: string;
  members: Member[];
  channels: Channel[];
  roles: Role[];
  categories: Category[];
}

export interface Member {
  user: User;
  roles: string[];
  joinedAt: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  createdAt: number;
}

export interface Channel {
  id: string;
  index: number;
  name: string;
  rolePermissions: {
    allowed: number;
    disallowed: number;
    roleId: string;
  }[];
  categoryName?: string;
}

export interface Role {
  id: string;
  name: string;
  permission: number;
  createdAt: number;
  color?: string;
}

export enum Permissions {
  viewChannel = 1 << 0,
  createInvites = 1 << 1,
  sendMessages = 1 << 2,
  deleteMessage = 1 << 3,
  manageChannels = 1 << 4,

  normalisedChannel = viewChannel | sendMessages,
  normalisedGuild = createInvites | sendMessages,
}

interface Category {
  name: string;
  index: number;
  createdAt: number;
}

export interface Message {
  id: string;
  content: string;
  replyingTo?: string;
  createdBy: string;
  createdAt: number;
  stream?: string;
  channelId?: string;
}

export interface Presence {
  user: User;
  status: PresenceStatus;
}

export enum PresenceStatus {
  online = 'online',
  idle = 'idle',
  offline = 'offline',
}

export interface PartialChannel {
  id: string;
  name: string;
  category?: string;
  guildId: string;
  index: number;
}

export type MessageListener =
  | ((type: string, message: Message) => void)
  | ((type: string, message: Message) => Promise<void>);

export class Gateway {
  private socket: WebSocket;
  private isReady: boolean = false;
  private remainingGuilds: number = 0;
  private currentMessageListener: MessageListener | undefined = undefined;

  constructor(url: string) {
    this.socket = new WebSocket(url);
    this.socket.addEventListener('message', this.handleMessages.bind(this));
    this.socket.addEventListener('open', () => {
      const data: Opcode<Identify> = {
        op: 0,
        t: 'IDENTIFY',
        d: {
          token: localStorage.getItem('token')!,
        },
      };
      this.socket.send(JSON.stringify(data));
    });
  }

  private handleMessages(event: MessageEvent<string>) {
    const data: Opcode<unknown> = JSON.parse(event.data);

    if (data.op === 0) {
      switch (data.t) {
        case 'READY':
          this.handleReadyEvent(data.d as ReadyEvent);
          break;
        case 'GUILD_CREATE':
          this.handleGuildCreate(data.d as Guild);
          break;
        case 'CHANNEL_CREATE':
          this.handleChannelCreate(data.d as PartialChannel);
          break;
        case 'CHANNEL_DELETE':
          this.handleChannelDelete(data.d as PartialChannel);
          break;
      }

      if (data.t.startsWith('MESSAGE_')) {
        if (this.currentMessageListener !== undefined) {
          this.currentMessageListener(data.t, data.d as Message);
        }
      }
    } else if (data.op === 1) {
      switch (data.t) {
        case 'PRESENCE_UPDATE':
          this.handlePresenceUpdate(data.d as Presence);
          break;
      }
    }
  }

  private handleGuildCreate(event: Guild) {
    if (!this.isReady) {
      this.remainingGuilds -= 1;
    }

    const guildCache: GuildCache = {
      id: event.id,
      name: event.name,
      members: new Map(),
      channels: new Map(),
      roles: new Map(),
      categories: event.categories,
    };

    for (const member of event.members) {
      guildCache.members.set(member.user.id, member);
    }

    for (const channel of event.channels) {
      guildCache.channels.set(channel.id, channel);
    }

    for (const role of event.roles) {
      guildCache.roles.set(role.id, role);
    }

    store.dispatch(guildsSlice.actions.addGuild(guildCache));
    if (this.remainingGuilds <= 0) {
      this.isReady = true;
      store.dispatch(guildsSlice.actions.setReady());
    }
  }

  private handleReadyEvent(event: ReadyEvent) {
    this.remainingGuilds = event.guildCount;
    const user: User = {
      id: event.id,
      username: event.username,
      displayName: event.displayName,
      createdAt: 0,
    };
    store.dispatch(currentUserSlice.actions.setUser(user));
  }

  private handlePresenceUpdate(event: Presence) {
    if (event.status === PresenceStatus.offline) {
      store.dispatch(presenceSlice.actions.removePresence(event.user.id));
    } else {
      store.dispatch(presenceSlice.actions.updatePresence(event));
    }
  }

  private handleChannelCreate(event: PartialChannel) {
    store.dispatch(guildsSlice.actions.addChannel(event));
  }

  private handleChannelDelete(event: PartialChannel) {
    store.dispatch(guildsSlice.actions.removeChannel(event));
  }

  addMessageListener(listener: MessageListener) {
    this.currentMessageListener = listener;
  }

  removeEventListener() {
    this.currentMessageListener = undefined;
  }
}

const userInitialState: { value?: User } = {
  value: undefined,
};

const presence: { value: Map<string, Presence> } = {
  value: new Map(),
};

export interface GuildCache {
  id: string;
  name: string;
  members: Map<string, Member>;
  channels: Map<string, Channel>;
  roles: Map<string, Role>;
  categories: Category[];
}

const guildsInitialState: { value: Map<string, GuildCache>; isReady: boolean } = {
  value: new Map(),
  isReady: false,
};

export const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState: userInitialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.value = action.payload;
    },
  },
});

export const guildsSlice = createSlice({
  name: 'guilds',
  initialState: guildsInitialState,
  reducers: {
    addGuild: (state, action: PayloadAction<GuildCache>) => {
      state.value.set(action.payload.id, action.payload);
    },
    setReady: (state) => {
      state.isReady = true;
    },
    addChannel: (state, action: PayloadAction<PartialChannel>) => {
      state.value.get(action.payload.guildId)?.channels.set(action.payload.id, {
        id: action.payload.id,
        index: action.payload.index,
        name: action.payload.name,
        rolePermissions: [],
        categoryName: action.payload.category,
      });
    },
    removeChannel: (state, action: PayloadAction<PartialChannel>) => {
      state.value.get(action.payload.guildId)?.channels.delete(action.payload.id);
    },
  },
});

export const presenceSlice = createSlice({
  name: 'presence',
  initialState: presence,
  reducers: {
    updatePresence: (state, action: PayloadAction<Presence>) => {
      state.value.set(action.payload.user.id, action.payload);
    },
    removePresence: (state, action: PayloadAction<string>) => {
      state.value.delete(action.payload);
    },
  },
});

export const defaultGateway = new Gateway('ws://localhost:4000/api/websocket?format=json');
