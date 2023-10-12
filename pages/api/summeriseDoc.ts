import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import AmplifyLoader from '../../utils/AmplifyLoader'
import { loadSummarizationChain } from "langchain/chains";
import { TextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatAnthropic } from "langchain/chat_models/anthropic";

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
        modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
      });

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('docs', docs);
    

    //only accept post requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    if (!docs) {
        return res.status(400).json({ message: 'No docs in the request' });
    }

    try {
        //create chain
        const chain = loadSummarizationChain(model, { type: "stuff" });
        const response = await chain.call({
            input_documents: docs,
        });

        console.log('response', response);
        res.status(200).json(response);
    } catch (error: any) {
        console.log('error', error);
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }
}
