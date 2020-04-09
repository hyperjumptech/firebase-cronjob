const convertCase = require('./convertCase');
const getWeather = require('./getWeather');

async function execute(task, input) {
    let result;
    switch (task) {
        case 'ConvertCase':
            result = await convertCase(input);
            break;
        case 'GetWeather':
            result = await getWeather(input);
            break;
        default:
            throw new Error(`Unknown task ${task}`);
    }
    return result;
}

exports.execute = execute;
