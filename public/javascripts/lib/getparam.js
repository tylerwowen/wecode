define(function (require, exports, module) {
    /**
     * Examines url query parameters for a specific parameter.
     * @param {!string} urlParam to search for in url parameters.
     * @return {?(string)} returns match as a string of null if no match.
     * @export
     */
    module.exports = function (urlParam) {
        var regExp = new RegExp(urlParam + '=(.*?)($|&)', 'g');
        var match = window.location.search.match(regExp);
        if (match && match.length) {
            match = match[0];
            match = match.replace(urlParam + '=', '').replace('&', '');
        } else {
            match = null;
        }
        return match;
    };
});