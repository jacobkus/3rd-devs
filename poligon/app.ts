import { DevsAIApi } from 'devs-ai-api/DevsAIApi';
const devsai = new DevsAIApi({ task: 'POLIGON' });

const response = await fetch(`${process.env.AI_DEVS_API_DOMAIN}/dane.txt`);
const data = await response.text();

const answer = data.trim().split('\n');

await devsai.verify(answer);
