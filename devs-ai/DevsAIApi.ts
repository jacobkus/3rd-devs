import type { DevsAIApiProps } from './DevsAIApiProps';
import type { DevsAIApiResponseData } from './DevsAIApiResponseData';

export class DevsAIApi {
  private readonly AI_DEVS_API_KEY = process.env.AI_DEVS_API_KEY;
  private readonly AI_DEVS_API_DOMAIN = process.env.AI_DEVS_API_DOMAIN;
  private readonly task: string;

  constructor(private readonly props: DevsAIApiProps) {
    this.task = props.task;
    this.AI_DEVS_API_DOMAIN = props.api_url || this.AI_DEVS_API_DOMAIN;
  }

  public async verify<T>(answer: T): Promise<void> {
    const response = await fetch(`${this.AI_DEVS_API_DOMAIN}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: this.task,
        apikey: this.AI_DEVS_API_KEY,
        answer,
      }),
    });

    const data: DevsAIApiResponseData = await response.json();

    if (data.code !== 0) {
      throw new Error(data.message);
    }

    console.log('--- VERIFY ---');
    console.log(data.message);
  }

  public async raw_verify<T, U>(data: T): Promise<U> {
    const response = await fetch(`${this.AI_DEVS_API_DOMAIN}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData: U = await response.json();

    console.log('--- RAW VERIFY ---');
    console.log(responseData);

    return responseData;
  }
}
