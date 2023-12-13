export const getAnsweredQuestions = questions => questions.filter(q => q.status === "answered");
export const getUnansweredQuestions = questions => questions.filter(q => q.status === "unanswered");
export const getSubQuestions = questions => questions.filter(q => q.type === "subquestion");
export const getHopQuestions = questions => questions.filter(q => q.type === "hop");
export const getLastQuestionId = questions => Math.max(...questions.map(q => q.id));

export function markAnswered(questions, id) {
    questions.forEach(q => {
        if (q.id === id) {
            q.status = "answered";
        }
    });
}

export function getQuestionById(questions, id) {
    const filteredQuestions = questions.filter(q => q.id === id);
    return filteredQuestions.length > 0 ? filteredQuestions[0] : null;
}
