import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';

export class QuestionCreationChain extends LLMChain {
    constructor(llm, prompt, verbose = true) {
        super({ llm, prompt, verbose });
    }

    static fromLLM(llm, verbose = true) {
        const questionsCreationTemplate = `
            You are a part of a team. The ultimate goal of your team is to
            answer the following Question: '{question}'.\n
            Your team has discovered some new text (delimited by \`\`\`) that may be relevant to your ultimate goal.
            text: \n \`\`\` {context} \`\`\` \n
            Your task is to ask new questions that may help your team achieve the ultimate goal...
            Start the list with number {start_id}
        `;

        const prompt = new PromptTemplate({
            template: questionsCreationTemplate,
            inputVariables: ['question', 'context', 'previous_questions', 'num_questions', 'start_id'],
        });

        return new QuestionCreationChain(llm, prompt, verbose);
    }
}