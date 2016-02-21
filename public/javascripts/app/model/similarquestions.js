define(function (require) {
    "use strict";

    var $ = require('jquery');

    function SimilarQuestions() {}

    (function () {

        this.constructor = SimilarQuestions;
        var that = this;

        this.init = function() {

        };

        this.connectToView = function() {
            var that = this;
        };

        this.getSimilarQuestions = function(currentquestion, queue) {
            this.ques = currentquestion.question.toLowerCase();
            this.topic = currentquestion.topic;
            this.queueTemp = queueTemp;

            var array = this.ques.split(" ");
            var counter = 0;
            var queueQues;
            var countQuestArray = [];
            for (var k = 0; k < this.queueTemp.length; k++) {
                queueQues = (this.queueTemp[k].question.toLowerCase()).split("\\s+");
                counter = 0;
                for (var i = 0; i < array.length; i++) {
                    for (var j = 0; j <queueQues.length; j++) {
                        if(array[i].localeCompare(queueQues[j]) == 0 ){
                            counter++;
                        }
                    }
                }
                countQuestArray.push(counter);
            }
            var max = countQuestArray[0];
            var maxIndex = 0;

            for (var i = 1; i < countQuestArray.length; i++) {
                if (countQuestArray[i] > max) {
                    maxIndex = i;
                    max = countQuestArray[i];
                }
            }

            return this.queueTemp[maxIndex].question;
        };

        this.getSimilarQuestionsWOTopics = function(currentquestion, queue) {
            var question = currentquestion.toLowerCase();
            var queueTemp = queue;

            var array = this.getStringArray(question);
            var counter = 0;
            var queueQuestion;
            var countQuestArray = [];
            for (var k = 0; k < queueTemp.length; k++) {
                queueQuestion = this.getStringArray(queueTemp[k]);
                counter = 0;
                for (var i = 0; i < array.length; i++) {
                    for (var j = 0; j < queueQuestion.length; j++) {
                        if(!this.isStopWord(array[i]) && !this.isStopWord(queueQuestion[j])) {
                            var res = array[i].localeCompare(queueQuestion[j]);
                            if(res == 0 ){
                                counter++;
                            }
                        }
                    }
                }
                countQuestArray.push(counter);
            }



            var max = countQuestArray[0];
            var maxTwo = countQuestArray[0];
            var maxIndex = 0;
            var secondMaxIndex = 0;

            for (var i = 0; i < countQuestArray.length; i++) {
                console.log(i, countQuestArray[i]);
                if (countQuestArray[i] > max) {
                    secondMaxIndex = maxIndex;
                    maxIndex = i;
                    max = countQuestArray[i];
                } else if(countQuestArray[i] > maxTwo){
                    maxTwo = countQuestArray[i];
                    secondMaxIndex = i;
                }
            }
            var arr = [queueTemp[maxIndex], queueTemp[secondMaxIndex]];
            return arr;
        };

        this.isStopWord = function(word) {
            return stopwords.includes(word);
        };

        this.getStringArray = function(string) {
            var array;
            string = string.replace(/['`]/g,"");
            string = string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ");
            array = (string.toLowerCase()).split(/\s+/);
            return array;
        };

        var stopwords = ["a", "about", "above", "above", "across", "after", "against",
            "almost", "alone", "along", "already", "also","although","am","among", "amongst",
            "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone", "anything",
            "anyway", "anywhere", "are", "around", "as",  "at", "back", "be", "because",
            "been", "beforehand", "behind", "being", "below", "between", "beyond", "bill",
            "by", "can", "could",  "down", "due", "during", "each", "eg", "either","else",
            "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone",
            "everything", "everywhere", "few", "fill", "find", "fire", "for", "former",
            "formerly", "found", "from", "front", "full","further", "he", "hence", "her",
            "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him",
            "himself", "his", "how", "however", "ie", "if", "in", "inc", "indeed", "interest",
            "into", "is",  "it", "its", "itself", "last", "latter", "latterly", "least", "ltd",
            "many", "may", "me", "meanwhile", "might", "mill", "mine", "moreover", "my",
            "myself", "next", "now", "of", "off", "often", "on", "once", "onto", "or", "other",
            "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part",
            "per", "perhaps", "please", "rather", "re", "same", "seem", "seemed", "seeming",
            "seems", "serious", "she", "side", "since", "sincere", "so", "some", "somehow",
            "someone", "something", "sometime", "sometimes", "somewhere", "still", "such",
            "than", "that", "the", "their", "them", "themselves", "then", "thence", "there",
            "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they",
            "this", "those", "though", "through", "throughout", "thru", "thus", "to", "too",
            "toward", "towards", "un", "under", "up", "upon", "us", "very", "via", "was", "way",
            "we", "well", "were", "what", "whatever", "whence", "whenever", "where",
            "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever",
            "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose",
            "why", "will", "with", "would", "yet", "you", "your", "yours", "yourself",
            "yourselves", "the", "youre", "hes", "ive", "theyll", "whos", "wheres", "whens",
            "whys", "hows", "whats", "were", "shes", "im", "thats"
        ];

    }).call(SimilarQuestions.prototype);

    return SimilarQuestions;
});