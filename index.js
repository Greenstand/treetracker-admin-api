var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var pg = require('pg');
const { Pool, Client } = require('pg');
var path = require('path');
var app = express();
var port = process.env.PORT || 3000;
var conn = require('./config');

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.set('view engine','html');

const pool = new Pool({
    
    connectionString: conn.connectionString
  });


app.get('/trees', function(req, res){   
    
    let query = {      
        
        text: 'SELECT * FROM datapoints'
      }
      
      pool.query(query)
      .then(function(data){
          res.status(200).json({              
              data: data.rows
          })
      })
      .catch(e => console.error(e.stack));

});
  
app.get('*',function(req, res){    
    res.sendFile(path.join(__dirname,'index.html'));
});

app.listen(port,()=>{
    console.log('listening on port ' + port);
});