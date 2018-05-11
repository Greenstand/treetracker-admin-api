var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var pg = require('pg');
const { Pool, Client } = require('pg');
var path = require('path');
var app = express();
var port = process.env.NODE_PORT || 3000;
var conn = require('./config');

var async = require("async");

var moment = require("moment");


app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.set('view engine', 'html');


const noop = function () { }

const isNotEmpty = function (val) {
  return (val !== null && val !== undefined);
}

//2-15-2018 pool deprecated for this custom module, use crudpool instead
//const pool = new Pool({

//connectionString: conn.connectionString
//});

const crudpool = new Pool({

  connectionString: conn.connectionString
});


const shouldabort = (err, client) => {
  if (err) {
    console.error('Error in transaction', err.stack);
    client.query('ROLLBACK', (err2) => {
      if (err2) {
        console.error('Error rolling back client', err2.stack);
      }
    });
  }
  return !!err;
}





const connectpool = function (pool, cb) {
  pool.connect(function (err, client, done) {
    if (err) {
      console.error('Error in transaction', err.stack);
    }
    else {

      cb(client, done);
    }

  });
};


const beginquery = function (client, cb) {
  client.query('BEGIN', (err1) => {
    if (shouldabort(err1, client)) return;
    cb();
  })

};

const issuequery = function (client, querytext, queryvalues, cb) {
  client.query(querytext, queryvalues, (err2, res) => {
    if (shouldabort(err2, client)) return;
    cb(res);
  })

};


const commitquery = function (client, cb) {
  client.query('COMMIT', (err) => {
    if (err) {
      console.error('Error committing transaction', err.stack);
    }
    else {
      cb();
    }

  })

};

const getUpdateTableQueryByTableIDCols = function (table, id, cols, cbb) {
  // Setup static beginning of query with the table too
  var query = ['UPDATE ' + table];
  query.push('SET');

  // Create another new array storing each set command there
  // and then assigning a number value for parameterized query there
  var mySet = [];


  const f1 = function (itm, idx, cb) {
    mySet.push(itm + ' = ($' + (idx + 1) + ')');
    cb();
  };

  const f2 = function (err1) {
    if (err1) {
      console.error('Error async eachSeries loop 2_f2', err1.stack)
    }
    else {
      query.push(mySet.join(', '));
      query.push('WHERE id = ' + id);
      cbb(query.join(' '));
    }
  };

  async.eachOfSeries(Object.getOwnPropertyNames(cols), f1, f2);
}

const getFormattedUTCTimeNow = function () {

  return moment.utc().format("YYYY-MM-DD HH:mm:ss+00");

}





//start with connectpool to get a client only once.
// Keep this client open and reuse for atomicity
//done releases the client. don't call done(); Keep reusing the same client instead
//pg isolates transaction by client. Calling new client defeats the atomicity
//and the purpose of BEGIN and COMMIT
//So reuse same client -> crudclient

///////////////////

var crudclient = null;
var crud_done = null;

connectpool(crudpool, function (client, done) {
  crudclient = client;
  crud_done = done;
});

//////////////////

//////////////////


/*
app.post('/trees/create', function(req, res){
  var user_id = req.body["user_id"];
  var lat = req.body["lat"];
  var lon = req.body["lon"];
  var gps_accuracy = req.body["gps_accuracy"];
  var note = req.body["note"];
  var timestamp = req.body["timestamp"];
  var base_64_image = req.body["base_64_queryimage"];

//console.log("timestamp"); 
//console.log(timestamp);
//console.log(req.body);
//console.log(req.body["timestamp"]);

        const insertTreeText= 'INSERT INTO trees(user_id, lat, lon, gps_accuracy, note, timestamp, base_64_image) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const insertTreeValues = [user_id, lat, lon, gps_accuracy, note, timestamp, base_64_image];


        beginquery(crudclient, function(){
           issuequery(crudclient,insertTreeText,insertTreeValues,function(res1){
              commitquery(crudclient,function(){

              });
           });
        });


});
*/

app.delete('/trees', function (req, res) {
  var id = req.body["id"];
  const deleteTreeText = "DELETE FROM trees WHERE id = $1";
  const deleteTreeValues = [id];

  beginquery(crudclient, function () {
    issuequery(crudclient, deleteTreeText, deleteTreeValues, function (res1) {
      commitquery(crudclient, function () {
        res.status(200).json({
          data: res1
        });
      });
    });
  });


});


app.put('/trees', function (req, res) {
  var id = req.body["id"];
  //var time_created = req.body["time_created"];
  //var time_updated = req.body["time_updated"];
  var missing = req.body["missing"];
  var priority = req.body["priority"];
  var cause_of_death_id = req.body["cause_of_death_id"];
  var user_id = req.body["user_id"];
  var primary_location_id = req.body["primary_location_id"];
  var settings_id = req.body["settings_id"];
  var override_settings_id = req.body["override_settings_id"];
  var dead = req.body["dead"];
  var lat = req.body["lat"];
  var lon = req.body["lon"];
  //var estimated_geometric_location = req.body["estimated_geometric_location"];
  //var gps_accuracy = req.body["gps_accuracy"];

  var time_updated = getFormattedUTCTimeNow();
  //console.log("time_updated");
  //console.log(time_updated);

  var treecols =
    {
      "time_updated": time_updated

    }

  isNotEmpty(missing) ? treecols["missing"] = missing : noop;
  isNotEmpty(priority) ? treecols["priority"] = priority : noop;
  isNotEmpty(cause_of_death_id) ? treecols["cause_of_death_id"] = cause_of_death_id : noop;
  isNotEmpty(user_id) ? treecols["user_id"] = user_id : noop;
  isNotEmpty(primary_location_id) ? treecols["primary_location_id"] = primary_location_id : noop;
  isNotEmpty(settings_id) ? treecols["settings_id"] = settings_id : noop;
  isNotEmpty(override_settings_id) ? treecols["override_settings_id"] = override_settings_id : noop;
  isNotEmpty(dead) ? treecols["dead"] = dead : noop;
  isNotEmpty(lat) ? treecols["lat"] = lat : noop;
  isNotEmpty(lon) ? treecols["lon"] = lon : noop;


  const fn5 = function (updateTreeText) {



    var updateTreeValues = [];

    //prefer Object.getOwnPropertyNames() over Object.keys() because:
    //Object.getOwnPropertyNames() is more likely to guarantee that 
    //JS-Object to ArrayofJS-Object_AllKeys conversion
    //preserves JS Object keys creation order in the returned array

    const updateTreeKeys = Object.getOwnPropertyNames(treecols);



    //used in async.eachSeries call, the following function is the callback function
    //the params are (some_custom_error) and it should usually be blank
    //it is called with signature callback() when all elements finished iterating,
    //or if "callback(some_custom_error)" was manually called 
    //from the iteratee during iteration      

    //BEGINNING of callback function
    const updateTreeValuesReady = function (err) {
      if (err) {
        console.error('Error async eachSeries loop 1', err.stack)
      }
      else {
        //console.log('updateTreeText');
        //console.log(updateTreeText);
        //console.log('updateTreeValues');
        //console.log(updateTreeValues);


        beginquery(crudclient, function () {
          issuequery(crudclient, updateTreeText, updateTreeValues, function (res1) {
            commitquery(crudclient, function () {
              res.status(200).json({
                data: res1
              });
            });
          });
        });
      }

    }

    //END of callback function



    //used in async.eachSeries call, the following function is the iteratee function
    //the iteratee function signature is (item, callback)
    //see EACHSERIES FUNCTION CALL for more details  
    //the async utility automatically populates "item" with the current item from collection
    //and also automatically populates "callback" with something that is explained more
    //in EACHSERIES FUNCTION CALL section     

    //BEGINNING of iteratee function 
    const turnTreecolsIntoArrayofValues = function (item, callback) {
      var treeValue = treecols[item];
      updateTreeValues.push(treeValue);
      callback();

    }

    //END of iteratee function



    //The following turns "treecols" JS Object into an array of values for updateTreeValues

    //EACHSERIES FUNCTION CALL
    //Using async.eachSeries loops through each array (collection) item
    //asynchronously yet sequentially.
    //the params are (collection,iteratee,callback) and all three should be included
    //collection is usually an array, iteratee and callback are usually functions
    //iteratee function signature is (item, callback)
    //callback function signature is (err) and err should be usually blank
    //in this example, calling the "callback" parameter from within the iteratee function 
    //does one of three things:
    //1. If there are any remaining elements in the passed in array (collection)
    //and callback is called like this: callback();
    //it repeats this same iteratee function again 
    //but this time, the "item" param contains the next item from the passed in array.        
    //2. if there are no more items in array (collection)
    //and callback is called like this: callback();
    //the actual callback function is called, with the error parameter empty.
    //3. Sometimes, even if there are still remaining items in the array (collection),
    //but if anytime during iteration, this iteratee function calls 
    //callback(some_custom_error) instead of just callback();
    //then async utility jumps out of the iteratee immediately in this case, 
    //and the callback is called immediately with the error parameter populated
    //with some_custom_error
    //
    async.eachSeries(updateTreeKeys, turnTreecolsIntoArrayofValues, updateTreeValuesReady);
  }

  getUpdateTableQueryByTableIDCols("trees", id, treecols, fn5);


});


app.get('/trees', function (req, res) {
  console.log(req.url);

  var sql = "SELECT 'point' AS type, trees.* FROM trees";
  var values = []
  var query = {}



  if (req.query['zoom'] < 14) {
    let zoom = req.query['zoom'];
    sql = "SELECT 'cluster' AS type, ST_AsGeoJSON(ST_Centroid(clustered_locations)) centroid, ST_AsGeoJSON(ST_MinimumBoundingCircle(clustered_locations)) circle, ST_NumGeometries(clustered_locations) count FROM ( SELECT unnest(ST_ClusterWithin(estimated_geometric_location, $1)) clustered_locations from trees ) clusters";
    values.push(zoom)

  }

  if (req.query['user_id']) {
    let user_id = req.query['user_id']
    sql = sql + " WHERE user_id = " + user_id
  }

  if (req.query['start_index']) {
    let start_index = parseInt(req.query['start_index'])
    sql = sql + " OFFSET " + (start_index - 1)
  }

  if (req.query['page_size']) {
    let page_size = req.query['page_size']
    sql = sql + " LIMIT " + page_size
  }

  query = {
    text: sql,
    values: values
  }
  //console.log()
  ///////////////////////////////////////////
  //
  ////ok for now and in this case only, 
  ////but do not use pool.query in general - 
  ////prefer to use client.query - 1-23-2018
  ////pool.query(query)
  ////.then(function(data){
  ////res.status(200).json({              
  ////data: data.rows
  ////})
  ////})
  ////.catch(e => console.error(e.stack));
  ////////////////////////////////////////////////

  //2-15-2018 using crudpool convention even for reading data

  beginquery(crudclient, function () {
    issuequery(crudclient, query.text, query.values, function (res1) {
      commitquery(crudclient, function () {
        res.status(200).json({
          data: res1.rows
        });
      });
    });
  });

});

app.listen(port, () => {
  console.log('listening on port ' + port);
});
