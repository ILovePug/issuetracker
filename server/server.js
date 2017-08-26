
"use strict"; 
const express = require("express");

const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const Issue = require('./issue.js');

app.use(express.static('static'));
app.use(bodyParser.json());

app.get('/api/issues', (req, res) => {
    db.collection('issues').find().toArray().then(issues => {
        const metadadta = { totalCount: issues.length };
        console.log('hi');
        //res.status(200);

        res.json({ _metadata: metadadta, records: issues })
    }).catch(err => {
        console.log(err);
        res.status(500).json({ message: `Internal Server Error: ${err}` });
    })

})

app.post('/api/issues', (req, res) => {
    const newIssue = req.body;
    newIssue.created = new Date();
    if (!newIssue.status)
        newIssue.status = 'New';

    const err = Issue.validateIssue(newIssue);
    if (err) {
        res.status(422).json({ message: `Invalid request: ${err}` });
        return;

    }
    db.collection('issues').insertOne(newIssue).then(result =>
        db.collection('issues').find({ _id: result.insertedId }).limit(1).next()
    ).then(newIssue => {
        res.json(newIssue);
    }).catch(error => {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
});

let db;
MongoClient.connect('mongodb://wengqian:7336368@ds131511.mlab.com:31511/heroku_rt444k54').then(connection => {
    db = connection;
    app.listen(3000, function () {
        console.log("app started on port 3000");
    });
}).catch(err => {
    console.log(`Error:${err}`)
})
