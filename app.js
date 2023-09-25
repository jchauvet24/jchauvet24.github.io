
let answers = []
let WORDS = []
let currentIndex = 0
let practiseMode = true; 

loadWords()
switchContent("home")


function startquiz(){
    practiseMode = false; 
    switchContent("quiz")
    quiz(true)
}

function quiz(shuffle){
    switchContent("quiz")
    currentIndex = 0
    answers = []
    loadWords(shuffle)
    incQuestionNum()
    repeatWord()   
}

function startpractise(){
    practiseMode = true; 
    quiz(false)
}

function loadWords(shuffle){
    let words = localStorage.getItem("quizwords")?.split(',') || []
    document.querySelector("#wordsetup .words").value = words.join('\n')
    WORDS = shuffle ? shuffleArray(words) : words
    updateWordCount()
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

function updateWordCount(){
    document.querySelectorAll('.wordcount').forEach(e => e.innerHTML = WORDS.length)
}

function savewords(){
    let words = document.querySelector("#wordsetup .words")
     .value.split('\n').map(w => w.trim().toLowerCase())
     .filter(w => w != "")
    localStorage.setItem("quizwords", words)
    loadWords()
    switchContent('home')
}

let errorindex = 0
let errorhints = [
    [".*", "Not quite! Try again"],
    [/[aeiou]/gi, "_"],
    [/[aeou]/gi, "_"],
    [/[aeu]/gi, "_"],
    [/[ae]/gi, "_"],
    [/[e]/gi, "_"],
    [/[]/gi, "_"],
]

function submitAnswer() {
    const answerInput = document.querySelector('#answer')
    if (answerInput.value == null || answerInput.value == ""){
        return;
    }
    answers[currentIndex] = answerInput.value
    
    if (practiseMode && answerIsWrong(answerInput.value)){
        const hints = errorhints[errorindex++]
        let hint = WORDS[currentIndex].replace(new RegExp(hints[0]), hints[1])
        alert("Hint: " + hint)
        repeatWord()
        return;
    }
    errorindex=0
    answerInput.value = ""
    currentIndex++
    if (currentIndex < WORDS.length){
        incQuestionNum()
        repeatWord()
    } else {
        complete()
    }
}

function answerIsWrong(ans){
    return WORDS[currentIndex] != ans.trim().toLowerCase()
}

function complete(){
    calcResult()
    switchContent("quizresult")
}

function answerFocus(){
    document.querySelector('#answer').focus()
}

function calcResult(){
    let result = WORDS.map((w, i) => {
        return answers[i++]?.toLowerCase()?.trim() == w.toLowerCase().trim()
    })
    let correct = result.filter(d => d == true).length
    document.querySelector('#correctno').innerHTML = correct
    updateWordCount()
    printResult(result)
}

function printResult(result){
    let table = "<table border='1'><tr><th>Word</th><th>Your Answer</th><th>Result</th></tr>";
    WORDS.forEach((word, i) => {
        let isCorrect = result[i]
        let color = isCorrect ? 'white' : 'red'
        table += "<tr style='background-color:"+color+"'>"
        table += "<td>"+word+"</td>"
        table += "<td>"+(answers[i]||'No Answer')+"</td>"
        table += "<td>"+(isCorrect ? "CORRECT" : "WRONG") +"</td>"
        table += "</tr>"
    })
    
    table += "</table>"
    
    document.querySelector('#answers').innerHTML = table;
}

function retake(){
    startquiz()
}

function incQuestionNum(){
    document.querySelector('#qno').innerHTML =currentIndex + 1
}

function repeatWord(){
    readWord()
    answerFocus()
}

function exit(){
    if (confirm("Are you sure you want to exit?")){
        complete()
    }
}

function getCurrentWord(){
    return WORDS[currentIndex]
}


function readWord(){
  let text = getCurrentWord();
  let utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  utterance.rate = 0.7;

  utterance.voice = window.speechSynthesis.getVoices()[0];
  window.speechSynthesis.speak(utterance);
}

window.onbeforeunload = function(event){
    if (answers.length > 0){
        return confirm("Page refresh will lose your answers. Are you sure?");
    }
};

function switchContent(name){
    document.querySelectorAll('.content').forEach(c => c.style.display = 'none')
    document.querySelector('#'+name).style.display = ''
}