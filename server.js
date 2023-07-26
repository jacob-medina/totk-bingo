const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// static public folder
app.use(express.static('public'));

// api


app.listen(PORT, () => {
    console.log(`Serving static assets on http://localhost:${PORT}`);
});