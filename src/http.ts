import { Message, PartialChannel } from './store/gateway';

interface ErrorMessage {
  title?: string;
  message: string;
  extraData?: unknown;
}

interface CreateMessage {
  content: string;
  replyingTo?: string;
  stream?: string;
}

interface EditMessage {
  content?: string;
}

interface CreateChannel {
  name: string;
  category?: string;
}

export class HttpError {
  error: number;
  message: string;
  extraData?: unknown;

  constructor(error: number, message: string, extraData: unknown = undefined) {
    this.error = error;
    this.message = message;
    this.extraData = extraData;
  }
}

export default class Http {
  private async baseRequest(url: string, method: string): Promise<void>;

  private async baseRequest<T>(url: string, method: string, body?: unknown): Promise<T>;

  private async baseRequest<T>(url: string, method: string, body?: unknown): Promise<T | void> {
    const response = await fetch(import.meta.env.VITE_API_URL + url, {
      body: body !== undefined ? JSON.stringify(body) : undefined,
      method: method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ErrorMessage = await response.json();
      if (error.title !== undefined) {
        throw new HttpError(response.status, error.title);
      }
      throw new HttpError(response.status, error.message, error.extraData);
    }

    if (response.status !== 204) {
      return await response.json();
    } else {
      return;
    }
  }

  public async getMessages(channelId: string): Promise<Message[]> {
    return await this.baseRequest<Message[]>(`/api/channels/${channelId}/messages`, 'GET');
  }

  public async createMessage(channelId: string, body: CreateMessage): Promise<Message> {
    return await this.baseRequest<Message>(`/api/channels/${channelId}/messages`, 'POST', body);
  }

  public async deleteMessage(channelId: string, messageId: string): Promise<void> {
    return await this.baseRequest(`/api/channels/${channelId}/messages/${messageId}`, 'DELETE');
  }

  public async editMessage(channelId: string, messageId: string, body: EditMessage): Promise<void> {
    return await this.baseRequest(
      `/api/channels/${channelId}/messages/${messageId}`,
      'PATCH',
      body,
    );
  }

  public async createChannel(guildId: string, body: CreateChannel): Promise<PartialChannel> {
    return await this.baseRequest<PartialChannel>(`/api/guilds/${guildId}/channels`, 'POST', body);
  }

  public async deleteChannel(channelId: string): Promise<void> {
    return await this.baseRequest(`/api/channels/${channelId}`, 'DELETE');
  }
}
