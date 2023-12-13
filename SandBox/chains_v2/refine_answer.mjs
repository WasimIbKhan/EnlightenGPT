
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

export class RefineAnswer extends LLMChain {
 
    constructor(llm, prompt, verbose = true) {
        super({ llm, prompt, verbose });
    }

    static fromLLM(llm, verbose = true) {
        const promptTemplate = `
            Your task is to answer the following question and an existing answer.\n
            Question: '{question}'\n
            You are provided with an existing Answer: \n---\n{answer}\n---\n\n
            You are also provided with some additional context that may be relevant to the question.\n
            New Context: \n---\n{context}\n---\n\n
            You have the opportunity to rewrite and improve upon the existing answer.
            Use only the information from the existing answer and the given context to write a better answer.
            Use a descriptive style and a business casual language.
            If the context isn't useful, return the existing answer.
        `;

        const prompt = new PromptTemplate({
            template: promptTemplate,
            inputVariables: ['question', 'answer', 'context'],
        });
        return new RefineAnswer(llm, prompt, verbose);
    }
}

// Example usage
// const refineAnswer = RefineAnswer.fromLLM(yourLLMObject, true);
// const response = await refineAnswer.run({ question, answer, context });
