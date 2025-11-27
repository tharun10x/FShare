const http = require('http');
const express = require('express');
const app = express();
const fs = require('fs');
app.use(express.static(__dirname));

const key = fs.readFileSync('cert.key');
const cert = fs.readFileSync('cert.crt');

const server = http.createServer({key, cert}, app);

server.listen(8182);