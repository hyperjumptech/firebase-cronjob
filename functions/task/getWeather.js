const https = require('https');

async function download(url) {
    return new Promise((resolve, reject) => {
        https
            .get(url, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    resolve(data);
                });
            })
            .on('error', (err) => {
                reject(err.message);
            });
    });
}

async function getWeather(input) {
    const appid = input.appid;
    const q = input.q;
    const unit = 'metric';
    const query = `q=${q}&units=${unit}&appid=${appid}`;
    const url = `https://api.openweathermap.org/data/2.5/weather?${query}`;
    const data = JSON.parse(await download(url));
    const result = {
        name: data.name,
        weather: data.weather.shift().main,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
    };
    return result;
}

module.exports = getWeather;
