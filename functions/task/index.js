const convertCase = require('./convertCase');

async function execute(task, input) {
    let result;
    switch (task) {
        case 'ConvertCase':
            result = await convertCase(input);
            break;
        default:
            throw new Error(`Unknown task ${task}`);
    }
    return result;
}

exports.execute = execute;
