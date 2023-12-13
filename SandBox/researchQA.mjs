import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import Agent from './Agent.mjs';
import { PineconeClient } from '@pinecone-database/pinecone';

const pinecone = new PineconeClient();

await pinecone.init({
  environment: "us-west4-gcp-free", //this is in the dashboard
  apiKey: ""
});

const index = pinecone.Index(
  "chat-document"
);

const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: "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"
    }),
    {
      pineconeIndex: index,
      textKey: 'text',
      namespace: "Max Weber"
    },
  );

const scratchpad = {
    questions: [],  // Array of type Question
    answerpad: [],
};

const agentSettings = {
    maxIterations: 3,
    numAtomisticQuestions: 2,
    numQuestionsPerIteration: 4,
    questionAtomizerTemperature: 0,
    questionCreationTemperature: 0.4,
    questionPrioritisationTemperature: 0,
    refineAnswerTemperature: 0,
    qaTemperature: 0,
    analyserTemperature: 0,
    intermediateAnswersLength: 200,
    answerLength: 500,
};

const agent = new Agent(agentSettings, scratchpad, vectorStore, true);
agent.run('what is leadership?');



  
    


