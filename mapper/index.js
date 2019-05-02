const express = require('express')
const app = express()
const cors = require('cors')
var path = require('path');
const port = 3000;

app.use(cors());

//static for now, will eventually update to dynamically have coordinate passing
const WebPage = path.join(__dirname, '/Web');
app.use("/", express.static(WebPage));

module.exports = app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})