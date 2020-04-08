var assert = require('assert');
var axios = require('axios');

describe('firebase-cronjobs', function () {
    it('should have a working ping function', async function () {
        const res = await axios.get('http://localhost:5000/ping');
        const status = res.data.substr(0, 2);
        const timestamp = res.data.substr(3);
        assert.equal(status, 'OK');
        assert(/[0-9]+/.test(timestamp));
    });
});
