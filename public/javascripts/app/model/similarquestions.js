define(function (require) {
    "use strict";

    var $ = require('jquery');
    var _ = require('lodash');
    require('lib/stemmer');

    function SimilarQuestions() {}

    (function () {

        this.constructor = SimilarQuestions;
        var that = this;

        this.getSimilarQuestions = function(currentquestion, queue, callback) {
            var question = currentquestion;
            var queueTemp = _.map(queue, function(questionObject) { return questionObject.question});

            var len = queueTemp.length;
            var array = this.getStringArray(question);
            var counter = 0;
            var queueQuestion;
            var rankQuestionsArray = [];
            for (var k = 0; k < len; k++) {
                rankQuestionsArray[k] = [];
                queueQuestion = this.getStringArray(queueTemp[k]);
                counter = 0;

                array.forEach(function(arrayWordTemp){
                    if(!that.isStopWord(arrayWordTemp)){
                        arrayWordTemp = stemmer(arrayWordTemp);
                        queueQuestion.forEach(function(queueWordTemp){
                            if(!that.isStopWord(queueWordTemp)){
                                queueWordTemp = stemmer(queueWordTemp);
                                var result = arrayWordTemp.localeCompare(queueWordTemp);
                                if(result == 0){
                                    counter++;
                                }
                            }
                        });
                    }
                });

                rankQuestionsArray[k][0] = k;
                rankQuestionsArray[k][1] = counter;
            }

            rankQuestionsArray = rankQuestionsArray.sort(this.sortByCounter);
            var similarQuestionsArray = [];
            var coef = 0;
            if(len > 10) coef = 10;
            else coef = 1;

            for (k = 0; k < len / coef; k++) {
                if(rankQuestionsArray[k][1]!=0) {
                    similarQuestionsArray.push(queue[rankQuestionsArray[k][0]]);
                }
            }
            if (callback) callback(similarQuestionsArray);
        };

        this.isStopWord = function(word) {
            return stopwords.includes(word);
        };

        this.stemWord = function(word){
            return stemmer(word);
        };

        this.sortByCounter = function(a, b){
            return (a[1] > b[1] ? -1 : (a[1] < b[1] ? 1 : 0));
        };

        this.getStringArray = function(string) {
            var array;
            string = string.replace(/['`]/g,"");
            string = string.replace(/[^A-Za-z]/g," ");
            string = string.trim();
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