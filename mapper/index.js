const express = require('express')
const app = express()
const cors = require('cors')
var path = require('path');
const vars = require('./vars')
const port = 3000;

const cdn = "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.3.0/build/ol.js";

app.use(cors());

app.get("/", (req, res) => {
    res.send(vars.htmlPage(cdn));
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})