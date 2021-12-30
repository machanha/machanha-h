// const http = require('http');
const request = require('request');

request({
    url: 'http://127.0.0.1:8080/message',
    methods: 'POST',
    body: {
        content: 'test',
    },
    json: true
})