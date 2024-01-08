import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import AmplifyLoader from '../../utils/AmplifyLoader'
import { loadSummarizationChain } from "langchain/chains";
import { TextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatAnthropic } from "langchain/chat_models/anthropic";
import { PromptTemplate } from 'langchain';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { fileLocations } = req.body;

    console.log(fileLocations)
    const rawDocs = [];

    // Assuming you're inside an async function
    for (const location of fileLocations) {
        const loader = new AmplifyLoader(location);
        const loadedDocs = await loader.load();
        rawDocs.push(...loadedDocs);
    }

    const model = new ChatOpenAI({
        temperature: 0, // increase temepreature to get more creative answers
        modelName: 'gpt-3.5-turbo', 
        streaming: true,
      });

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    
    //only accept post requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    if (!docs) {
        return res.status(400).json({ message: 'No docs in the request' });
    }

    const map_prompt = `
        Write a concise summary of the following:
        {text}
        CONCISE SUMMARY:
        `
        const mapPromptTemplate = new PromptTemplate({template: map_prompt, inputVariables: ['text']});

    const combinePrompt = `Write a concise summary of the following text delimited by triple backquotes.
        Return your response in bullet points which covers the key points of the text.
        {text}
        BULLET POINT SUMMARY:`
    const combinePromptTemplate = new PromptTemplate({template: combinePrompt, inputVariables: ['text']});
    let shouldStream = false;
    try {
        //create chain
        let finalToken = "";
        const chain = loadSummarizationChain(model, { type: "map_reduce", combineMapPrompt: mapPromptTemplate, combinePrompt: combinePromptTemplate});
        const response = await chain.call({
            input_documents: docs,
        }, {
            callbacks: [
              {
                handleLLMNewToken(token: string) {
                    if(token === "-") {
                        shouldStream = true;
                    }
                    if(shouldStream) {
                        res.write(token);
                    }
                    
                },
              },
            ],
          });
        console.log('finalToken', finalToken);
        res.status(200).json(response);
    } catch (error: any) {
        console.log('error', error);
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }
}
