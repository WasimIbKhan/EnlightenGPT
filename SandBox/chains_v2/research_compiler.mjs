import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

export function researchCompiler(llm, question, notes, answerLength, verbose = true) {
    const promptTemplate = `
        You are a research agent who answers complex questions with clear, crisp and detailed answers.
        You are provided with a question and some research notes prepared by your team.
        Question: {question} \n
        Notes: {notes} \n
        Your task is to answer the question entirely based on the given notes.
        The notes contain a list of intermediate-questions and answers that may be helpful to you in writing an answer.
        Use only the most relevant information from the notes while writing your answer.
        Do not use any prior knowledge while writing your answer, Do not make up the answer.
        If the notes are not relevant to the question, just return 'Context is insufficient to answer the question'.
        Remember your goal is to answer the question as objectively as possible.
        Write your answer succinctly in less than {answer_length} words.
    `;

    const PROMPT = new PromptTemplate({
        template: promptTemplate,
        inputVariables: ['notes', 'question', 'answer_length']
    });

    const chain = new LLMChain(llm, PROMPT, verbose);

    return chain.run({ question, notes, answer_length: answerLength });
}

// Example usage
// const response = await researchCompiler(yourLLMObject, question, notes, answerLength, true);
