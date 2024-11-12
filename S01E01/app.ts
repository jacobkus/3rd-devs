import { JSDOM } from 'jsdom';
import { OpenAIService } from '../services/OpenAIService';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const XYZ_DOMAIN = process.env.XYZ_DOMAIN ?? '';
const XYZ_USERNAME = process.env.XYZ_USERNAME ?? '';
const XYZ_PASSWORD = process.env.XYZ_PASSWORD ?? '';

const openaiService = new OpenAIService();

const getQuestion = async (): Promise<string> => {
  try {
    const response = await fetch(XYZ_DOMAIN);
    const data = await response.text();

    const dom = new JSDOM(data);
    const doc = dom.window.document;

    const text = doc.querySelector('#human-question')?.textContent;
    const question = text?.split(':')[1]?.trim() ?? '';

    console.log('--- QUESTION ---');
    console.log(question);

    return question;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

const answerQuestion = async (question: string): Promise<string> => {
  const messages: ChatCompletionMessageParam[] = [
    {
      content: `
        As event date expert answer question using ultra-concise answer.

        <rules>As format return only year.</rules>
        
        <example>
        USER: When perceptron was invented?
        AI: 1958
        </example>
      `,
      role: 'system',
    },
    { content: question, role: 'user' },
  ];

  try {
    const response = await openaiService.completion(messages, 'gpt-4o-mini');

    console.log('--- ANSWER ---');
    console.log(response.choices[0].message.content);

    return response.choices[0].message.content ?? '';
  } catch (error) {
    console.error('Error answering question:', error);
    throw error;
  }
};

const getAccessToXYZPage = async (answer: string): Promise<string> => {
  const formData = new FormData();
  formData.append('username', XYZ_USERNAME);
  formData.append('password', XYZ_PASSWORD);
  formData.append('answer', answer);

  try {
    const response = await fetch(XYZ_DOMAIN, {
      method: 'POST',
      body: formData,
    });
    return response.text();
  } catch (error) {
    console.error('Error accessing XYZ page:', error);
    throw error;
  }
};

const extractFLG = (html: string): string => {
  const regex = /{{FLG:([^}]*)}}/;
  const match = html.match(regex);

  if (!match) throw new Error('\nAnty-human captcha incorrect!');

  console.log('--- FLG ---');
  console.log(match[1]);

  return match[1];
};

const main = async () => {
  const question = await getQuestion();
  if (question) {
    const answer = await answerQuestion(question);
    const docText = await getAccessToXYZPage(answer);
    extractFLG(docText);
  }
};

main();
