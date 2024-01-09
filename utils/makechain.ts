import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { LLMChain } from "langchain/chains";
import { PromptTemplate, ChatMessagePromptTemplate } from "langchain/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory, ChatMessageHistory  } from "langchain/memory";
import { OpenAIAssistantRunnable } from "langchain/experimental/openai_assistant";
import {TUTOR_PROMPT} from '../prompts'

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

const CONVERSATION_TEMPLATE = PromptTemplate.fromTemplate(`You are a helpful ai tutor
here is the user's message: {input}`)

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new ChatOpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_TEMPLATE,
      questionGeneratorTemplate: CONDENSE_TEMPLATE,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};

export const chatChain = async(question: string, pastMessages:any, currentAssisstanceId: string, currentRunId:string, currentThreadId: string) => {
  let assistant;
  if(currentAssisstanceId) {
      assistant = new OpenAIAssistantRunnable({
        assistantId: currentAssisstanceId,
        // Additional configuration if necessary
      });
  } else {
      assistant = await OpenAIAssistantRunnable.createAssistant({
        model: "gpt-3.5-turbo-1106",
        instructions: "You are a helpful assistant that provides answers to math problems.",
        name: "Math Assistant",
        tools: [{ type: "code_interpreter" }],
      });
  }

  const response = await assistant.invoke({
      content: question,
  });
  response[0].content.map(content => {
    console.log(content.text)
  })
  return response;
};