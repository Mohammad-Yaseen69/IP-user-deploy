import compression from 'compression'
import express from 'express'
import http from 'http'
import https from 'https'
import path from 'path'
import fs from 'fs'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const compression = require('compression')
// const express = require('express');
// const http = require('http');
// const https = require('https');
// const path = require('path');
// const fs = require("fs");

const app = express()
app.use(compression())

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/build'));
// app.use(express.static(__dirname + '/build/sm-web-booking'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

const port = process.env.PORT || '3000';
app.set('port', port);

const privateKey = fs.readFileSync('/etc/letsencrypt/live/my.insta-pay.ch/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/my.insta-pay.ch/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/my.insta-pay.ch/fullchain.pem', 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

https.createServer(credentials, app).listen(443, () => {
  // console.log('HTTPS Server running on port 443');
});

http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80);


// const server = http.createServer(app)
// // Start the app by listening on the default Heroku port
// server.listen(port, () => "a") // console.log('Running...'));