import { ChatOpenAI } from 'langchain/chat_models/openai';
import chalk from 'chalk';

import { QuestionCreationChain } from './chains_v2/create_questions.mjs';
import { QuestionAtomizer } from './chains_v2/question_atomizer.mjs';
import { MostPertinentQuestion } from './chains_v2/most_pertinent_question.mjs';
import { RefineAnswer } from './chains_v2/refine_answer.mjs';
import { retrievalQA } from './chains_v2/retrieval_qa.mjs';
import { researchCompiler } from './chains_v2/research_compiler.mjs';
import { getAnsweredQuestions, getUnansweredQuestions, getSubQuestions, getHopQuestions, getLastQuestionId, markAnswered, getQuestionById } from './helpers/questions_helper.mjs';
import { qStr2Dict, result2QuestionsList } from './helpers/response_helpers.mjs';

const gpt3t = "gpt-3.5-turbo";

function languageModel(modelName = gpt3t, temperature = 0, verbose = false) {
  return new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: temperature,
    verbose: verbose,
    openAIApiKey: "", // In Node.js defaults to process.env.OPENAI_API_KEY
  });
}

function printIteration(currentIteration) {
    console.log(chalk.bgYellowBright.black.bold(`\n   Iteration - ${currentIteration}  ▷▶  \n`));
  }

function printUnansweredQuestions(unanswered) {
    console.log(chalk.cyanBright("** Unanswered Questions **"));
    unanswered.forEach(q => {
      console.log(chalk.cyan(`\n'${q.id}. ${q.question}'`));
    });
  }

  function printNextQuestion(currentQuestionId, currentQuestion) {
    console.log(chalk.magenta.bold("** 🤔 Next Questions I must ask: **\n"));
    console.log(chalk.magenta(`${currentQuestionId}. ${currentQuestion.question}`));
  }

  function printAnswer(currentQuestion) {
    console.log(chalk.yellowBright.bold("** Answer **\n"));
    console.log(chalk.yellowBright(currentQuestion.answer));
  }

  function printFinalAnswer(answerpad) {
    console.log(chalk.white("** Refined Answer **\n"));
    console.log(chalk.white(answerpad[answerpad.length - 1]));
  }
  
  function printMaxIterations() {
    console.log(chalk.bgYellowBright.black.bold("\n ✔✔  Max Iterations Reached. Compiling the results ...\n"));
  }

  function printResult(result) {
    console.log(chalk.italic.whiteBright(result.text));
  }
  
  function printSubQuestion(q) {
    console.log(chalk.magenta.bold(`** Sub Question **\n${q.question}\n${q.answer}\n`));
  }


export default class Agent {
    constructor(agentSettings, scratchpad, store, verbose) {
        this.store = store;
        this.scratchpad = scratchpad;
        this.agentSettings = agentSettings;
        this.verbose = verbose;
        // Assuming corresponding JavaScript classes for these chains
        this.questionCreationChain = new QuestionCreationChain(languageModel(this.agentSettings.questionCreationTemperature), this.verbose);
        this.questionAtomizer = new QuestionAtomizer(languageModel(this.agentSettings.questionAtomizerTemperature), this.verbose);
        this.mostPertinentQuestion = new MostPertinentQuestion(languageModel(this.agentSettings.questionCreationTemperature), this.verbose);
        this.refineAnswer = new RefineAnswer(languageModel(this.agentSettings.refineAnswerTemperature), this.verbose);
    }

    async run(question) {
        const atomizedQuestionsResponse = await this.questionAtomizer.run(question, this.agentSettings.numAtomisticQuestions);
        this.scratchpad.questions.push(...result2QuestionsList(atomizedQuestionsResponse, 'subquestion', 'unanswered'));

        for (let q of this.scratchpad.questions) {
            let { answer, documents } = await retrievalQA(
                languageModel(this.agentSettings.qaTemperature, this.verbose),
                this.store.asRetriever({ type: 'mmr', search_kwargs: { k: 5, fetch_k: 10 } }),
                q.question,
                this.agentSettings.intermediateAnswersLength
            );
            q.answer = answer;
            q.documents = documents;
            q.status = 'answered';
            printSubQuestion(q);
        }

        let currentContext = this.scratchpad.questions.map(q => `\n${q.id}. ${q.question}\n${q.answer}`).join('');
        this.scratchpad.answerpad.push(currentContext);

        let currentIteration = 0;
        while (true) {
            currentIteration++;
            printIteration(currentIteration);

            let startId = getLastQuestionId(this.scratchpad.questions) + 1;
            let questionsResponse = await this.questionCreationChain.run(question, currentContext, this.scratchpad.questions.map(q => `\n${q.question}`), this.agentSettings.numQuestionsPerIteration, startId);
            this.scratchpad.questions.push(...result2QuestionsList(questionsResponse, 'hop', 'unanswered'));

            let unanswered = getUnansweredQuestions(this.scratchpad.questions);
            let unansweredQuestionsPrompt = this.unansweredQuestionsPrompt(unanswered);
            printUnansweredQuestions(unanswered);
            let response = await this.mostPertinentQuestion.run(question, unansweredQuestionsPrompt);
            let currentQuestionDict = qStr2Dict(response);
            let currentQuestionId = currentQuestionDict.id;
            let currentQuestion = getQuestionById(this.scratchpad.questions, currentQuestionId);
            printNextQuestion(currentQuestionId, currentQuestion);

            let { answer, documents } = await retrievalQA(
                languageModel(this.agentSettings.qaTemperature, this.verbose),
                this.store.asRetriever({ type: 'mmr', search_kwargs: { k: 5, fetch_k: 10 } }),
                currentQuestion.question,
                this.agentSettings.intermediateAnswersLength
            );
            currentQuestion.answer = answer;
            currentQuestion.documents = documents;
            markAnswered(this.scratchpad.questions, currentQuestionId);
            printAnswer(currentQuestion);
            currentContext = currentQuestion.answer;

            let refinementContext = `${currentQuestion.question}\n${currentContext}`;
            let refinedAnswer = await this.refineAnswer.run(question, refinementContext, this.getLatestAnswer());
            this.scratchpad.answerpad.push(refinedAnswer);
            printFinalAnswer(this.scratchpad.answerpad);

            if (currentIteration > this.agentSettings.maxIterations) {
                printMaxIterations();
                break;
            }
        }
    }

    unansweredQuestionsPrompt(unanswered) {
        return '[' + unanswered.map(q => `\n${q.id}. ${q.question}`).join('') + ']';
    }

    notesPrompt(answeredQuestions) {
        return answeredQuestions.map(q => `{ Question: ${q.question}, Answer: ${q.answer} }`).join('');
    }

    getLatestAnswer() {
        return this.scratchpad.answerpad[this.scratchpad.answerpad.length - 1] || '';
    }
}

