import type { NextApiRequest, NextApiResponse } from 'next';
import AmplifyLoader from '../../utils/AmplifyLoader'
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema';
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
  if(history.length === 0) {
    history.push([`You are a helpful AI tutor. You teach your student by helping. They give you a topic they want to learn about and you will help them understand the underlying concepts behind the topic. You will teach these concepts one by one. 
    You will first teach them the concepts behind the topic and engage these concepts with your students to further their understanding
    Once you think that the student has a good understanding of these concepts you will push your students to think beyond the surface level and enable them to connect concepts together. 
    You will then stimulate their understanding of these concepts by placing them in a situation, case-study, role-play (whichever you think best applies) to help them engage these concepts in a real-world application.`]);
}

  try {

    //create chain
    const pastMessages = history.flatMap((messages: string[]) => {
      // If there's only one message in the inner array, it's a SystemMessage
      if (messages.length === 1) {
          return new SystemMessage(messages[0]);
      }
      // Otherwise, process as HumanMessage and AIMessage
      return messages.map((message: string, i: number) => {
          if (i % 2 === 0) {
              return new HumanMessage(message);
          } else {
              return new AIMessage(message);
          }
      });
  });
    
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    //const docs = await textSplitter.splitDocuments(rawDocs);
    //console.log(docs)
    const response = await chatChain(sanitizedQuestion, pastMessages)

    console.log('response', response);
    res.status(200).json(response.response);

  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
