import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import AmplifyLoader from '../utils/AmplifyLoader'
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

/* Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/
const filePath = 'docs';

export const run = async (docLocations: string[], namespace: string) => {
  try {
    const rawDocs = [];

    // Assuming you're inside an async function
    for (const location of docLocations) {
        const loader = new AmplifyLoader(location);
        const loadedDocs = await loader.load();
        rawDocs.push(...loadedDocs);
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: namespace,
      textKey: 'text',
    });

  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
    
  }
  
};
