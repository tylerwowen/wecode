/**
 * Created by tyler on 10/22/15.
 */

var expect = require('chai').expect;


suite('Array', function() {
    setup(function() {
        // ...
    });

    suite('#indexOf()', function() {
        test('should return -1 when not present', function() {
            assert.equal(-1, [1,2,3].indexOf(4));
        });
    });
});