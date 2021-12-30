const http = require('request');
const key = '68d3aa657df04bd2b102e2ca686e416e';
const getMessage = (info, cb) => {
    const url = `http://www.tuling123.com/openapi/api?key=${key}&info=${info}`;
    const req = http.get(url, (res) => {
        let body = '';
        res.on('data', (data) => {
            body += data;
        })
        .on('end', ()=> {
            cb(JSON.parse(body).text)
        })
        req.end();
    })
}

exports.http = getMessage;