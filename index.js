// load packages
const express = require('express');
require('dotenv').config();

const app = express();

// load port
const PORT = process.env.PORT || 3000

// test api
app.get('/', async (req,res) => {
    res.send("welcome to E-commerce")
})

// start server
app.listen(PORT, async (req,res) => {
    console.log(`✅ API running at http://localhost:${PORT}`);
})