import { PromptTemplate } from 'langchain/prompts';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory } from "langchain/memory";

export function retrievalQA(llm, retriever, question, answerLength = 250, verbose = true) {
    const promptAnswerLength = ` Answer as succinctly as possible in less than ${answerLength} words.\n`;

    const promptTemplate = 
        `You are provided with a question and some helpful context to answer the question \n` +
        ` Question: {question}\n` +
        ` Context: {context}\n` +
        `Your task is to answer the question based on the information given in the context. ` +
        `Answer the question entirely based on the context and no other previous knowledge. ` +
        `If the context provided is empty or irrelevant, just return 'Context not sufficient'` +
        promptAnswerLength;

    const memory = new BufferMemory();

    const PROMPT = new PromptTemplate({
        template: promptTemplate, 
        inputVariables: ['context', 'question']
    });

    const chain = ConversationalRetrievalQAChain.fromLLM(
        llm,
        retriever,
        memory,
        {
        qaTemplate: PROMPT,
        returnSourceDocuments: true, 
        verbose: verbose
        },
      );

    return chain.call({ question: question }).then(result => {
        return { result: result.result, sourceDocuments: result.sourceDocuments };
    });
}

// Example usage
// const result = await retrievalQA(yourLLMObject, yourRetriever, question, answerLength, true);
