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

describe('firebase-cronjobs', function () {
    this.timeout(4000);
    it('should have a working showJobCounter function', async function () {
        const res = await axios.get('http://localhost:5000/showJobCounter');
        // fresh run: jobConfig/counter does not exist yet
        assert.equal(res.data, "EXCEPTION: TypeError: Cannot read property 'value' of undefined");
    });
    it('should have a working incrementJobCounter function', async function () {
        let res = await axios.get('http://localhost:5000/incrementJobCounter');
        // Since this is the first time, it will be 0
        assert.equal(res.data, 'Counter is now 0');
        res = await axios.get('http://localhost:5000/showJobCounter');
        assert.equal(res.data, 'Counter is 0');
    });
});

describe('firebase-cronjobs', function () {
    this.timeout(6000);
    it('should schedule periodic job counter increment', async function () {
        let res = await axios.get('http://localhost:5000/triggerScheduledIncrementJobCounter');
        assert.equal(res.data, 'triggered');
        await new Promise((r) => setTimeout(r, 2000));
        res = await axios.get('http://localhost:5000/showJobCounter');
        assert.equal(res.data, 'Counter is 1');
    });
});

describe('firebase-cronjobs', function () {
    it('should have a working addJobConfig function for a sample job config', async function () {
        const res = await axios.get('http://localhost:5000/addJobConfig');
        assert.equal(res.data, 'added: {"task":"ConvertCase","period":30,"input":"Hello, world!"}');
    });
    it('should have a working addJobConfig function for a custom job config', async function () {
        const res = await axios.get('http://localhost:5000/addJobConfig?period=10&task=DoNothing');
        assert.equal(res.data, 'added: {"period":"10","task":"DoNothing"}');
    });
});

describe('firebase-cronjobs', function () {
    this.timeout(6000);
    it('should queue a job', async function () {
        axios.get('http://localhost:5000/addJobConfig?period=2&task=DoNothing');
        axios.get('http://localhost:5000/incrementJobCounter');
        await new Promise((r) => setTimeout(r, 500));
        axios.get('http://localhost:5000/incrementJobCounter');
        await new Promise((r) => setTimeout(r, 500));
        const res = await axios.get('http://localhost:5000/showQueueLength');
        assert.equal(res.data, 'Queue length is 1');
    });
});
