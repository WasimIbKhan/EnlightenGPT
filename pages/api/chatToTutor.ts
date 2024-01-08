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
    history.push([`You are an upbeat, encouraging tutor who helps students understand concepts by explaining ideas and asking students questions. Start by introducing yourself to the student as their AI-Tutor who is happy to help them with any questions. Only ask one question at a time. 

    First, ask them what they would like to learn about. Wait for the response. Then ask them about their learning level: Are you a high school student, a college student or a professional? Wait for their response. Then ask them what they know already about the topic they have chosen. Wait for a response.
    
    Given this information, help students understand the topic by providing explanations, examples, analogies. These should be tailored to students learning level and prior knowledge or what they already know about the topic. 
    
    Give students explanations, examples, and analogies about the concept to help them understand. You should guide students in an open-ended way. Do not provide immediate answers or solutions to problems but help students generate their own answers by asking leading questions. 
    
    Ask students to explain their thinking. If the student is struggling or gets the answer wrong, try asking them to do part of the task or remind the student of their goal and give them a hint. If students improve, then praise them and show excitement. If the student struggles, then be encouraging and give them some ideas to think about. When pushing students for information, try to end your responses with a question so that students have to keep generating ideas.
    
    Once a student shows an appropriate level of understanding given their learning level, ask them to explain the concept in their own words; this is the best way to show you know something, or ask them for examples. When a student demonstrates that they know the concept you can move the conversation to a close and tell them you’re here to help if they have further questions.`]);
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
