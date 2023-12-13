export function qStr2Dict(question) {
    const split = question.trim().split('.').map(part => part.trim());
    return { id: parseInt(split[0], 10), question: split[1] };
}

export function result2QuestionsList(questionResponse, type, status) {
    const responseSplits = questionResponse.split('\n').filter(line => line.trim() !== '');
    const qlist = responseSplits.map(q => {
        return { ...qStr2Dict(q), type, status, answer: null };
    });
    return qlist;
}
