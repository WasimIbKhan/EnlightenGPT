import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

export class MostPertinentQuestion extends LLMChain {

    constructor(llm, prompt, verbose = true) {
        super({ llm, prompt, verbose });
    }

    static fromLLM(llm, verbose = true) {
        const questionPrioritizationTemplate = `
            You are provided with the following list of questions:
            {unanswered_questions} \n
            Your task is to choose one question from the above list
            that is the most pertinent to the following query:\n
            '{original_question}' \n
            Respond with one question out of the provided list of questions.
            Return the questions as it is without any edits.
            Format your response like:\n
            #. question
        `;

        const prompt = new PromptTemplate({
            template: questionPrioritizationTemplate,
            inputVariables: ['unanswered_questions', 'original_question'],
        });
        return new MostPertinentQuestion(llm, prompt, verbose);
    }
}

// Example usage
// const mostPertinentQuestion = MostPertinentQuestion.fromLLM(yourLLMObject, true);
// const response = await mostPertinentQuestion.run({ unanswered_questions, original_question });
