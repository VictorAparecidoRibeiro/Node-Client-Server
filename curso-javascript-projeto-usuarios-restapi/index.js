const express = require('express');
const consign = require('consign');

//Para receber facilmente os dados via post
const bodyParser = require('body-parser');

//Para validar os dados via post
const expressValidator = require('express-validator');

let app = express();

app.use(bodyParser.urlencoded({extended: false, limit: '60mb'}));
app.use(bodyParser.json({limit: '60mb'}))
app.use(expressValidator());

//Inclui todas as todas na pasta routes no app
consign().include('routes').include('utils').into(app);



app.listen(4000, '127.0.0.1', ()=>{
    console.log('Servidor rodando!');
});