import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

export class QuestionAtomizer extends LLMChain {
    constructor(llm, prompt, verbose = true) {
        super({ llm, prompt, verbose });
    }

    static fromLLM(llm, verbose = true) {
        const questionAtomizerTemplate = `
            You are provided with the following question:
            '{question}' \n
            Your task is to split the given question into at most {num_questions} very
            simple, basic and atomistic sub-questions (only if needed) using only the
            information given in the question and no other prior knowledge.
            The sub-questions should be directly related to the intent of the original question.
            Consider the primary subject and the predicate of the question (if any) when creating sub-questions.
            Consider also the Characters, Ideas, Concepts, Entities, Actions, Or Events mentioned
            in the question (if any) when creating the sub-questions.
            The sub-questions should have no semantic overlap with each other.
            Format your response like: \n
            n. question
        `;

        const prompt = new PromptTemplate({
            template: questionAtomizerTemplate,
            inputVariables: ['question', 'num_questions'],
        });
        return new QuestionAtomizer(llm, prompt, verbose);
    }
}
