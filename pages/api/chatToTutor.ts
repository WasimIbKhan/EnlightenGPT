import type { NextApiRequest, NextApiResponse } from 'next';
import AmplifyLoader from '../../utils/AmplifyLoader'
import { AIMessage, HumanMessage } from 'langchain/schema';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { chatChain } from '@/utils/makechain';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;
  /*
  const rawDocs = [];

  // Assuming you're inside an async function
  for (const location of files) {
      const loader = new AmplifyLoader(location);
      const loadedDocs = await loader.load();
      rawDocs.push(...loadedDocs);
  }
  */
  console.log('question', question);
  console.log('history', history);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {

    //create chain
    const pastMessages = history.flatMap((messages: string[]) => 
      messages.map((message: string, i: number) => {
        if (i % 2 === 0) {
          return new HumanMessage(message);
        } else {
          return new AIMessage(message);
        }
      })
    );

    
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    //const docs = await textSplitter.splitDocuments(rawDocs);
    //console.log(docs)
    const response = await chatChain(question, pastMessages)

    console.log('response', response);
    res.status(200).json(response.response);

  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
