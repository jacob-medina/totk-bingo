const express = require('express');
const path = require('path');

const entries = require('./lib/entries');

const app = express();
const PORT = process.env.PORT || 3000;

// static public folder
app.use(express.static('public'));

// api entries
app.get('/api/entries', (req, res) => {
    res.json(entries);
});

app.listen(PORT, () => {
    console.log(`Serving static assets on http://localhost:${PORT}`);
});