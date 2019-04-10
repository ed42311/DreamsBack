// use the dotenv config thing to create a process.env
require('dotenv').config();

// express builds our server framework
const express = require('express');

// for reading parameters attached on the body on a web request
const bodyParser = require('body-parser');

// mongoose the ODM that connects to mongodb
const mongoose = require('mongoose');

// add cors into the app
const cors = require('cors');

// Local variables for database
// Destructure our process.env variables
const { MONGODB_URI, PORT, FRONTEND_URL } = process.env;
const port = process.env.NODE_ENV === 'travis' ? 8001 : PORT;  

// build an instance of our app:
const app = express();

// CorsOptions allows 3rd party apps to be used
// origin is where our requests begin
// allowedHeaders is what kind of meta-data we are selecting
// methods are action-types allowed on database requests
const corsOptions = {
  origin: FRONTEND_URL,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type',
  methods: 'GET, PUT, POST, DELETE',
};

// middleware to attach cors with corsOptions passed to it.
app.use(cors(corsOptions));

// connect to your database on localhost through the URI
// now we have our URI, what do we need to pass it here -->
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

// notifying us that mongoose is connected to the server
function onDBConnected(){
  console.log('we are connected to mongo db');
}

// stashing this in a variable that we can call methods on
const db = mongoose.connection;

// Attach an Error handler in case of a connection error:
db.on('error', console.error.bind(console, 'connection error:'));

// Confirm connection when connected:
db.once('open', onDBConnected);

// routeHandlers are imported and destructured from our exported routeHandlers file
const {
  createDream,
  getDreamsByUserId,
  editDream,
  deleteDream,
  editDreamCases
} = require('./routeHandlers');

// Must use body-parser middleware before routes are called
app.use(bodyParser.urlencoded({ extended: true }));
// parse the response body back into a json object
app.use(bodyParser.json());

const debug = false;
if (debug) {
  app.use((req, res, next)=>{
    if(req.body.images) {
      req.body.images.forEach(e => {
        // console.log('image obj saved to db, ', e);
      });
    };
    next();
  });
}

// ROUTES GO HERE
// Make a test route that sends back json and status 200 -->
// Test route yay!  which takes in req and res
app.get('/test', function(req, res){
  // it should respond with a status of 200
  // res is the response object
  // it has a method on it called status
  res.status(200);
  // it also has a method on it called json
  // which returns a JSON object -> {"somekey": "some value"}
  res.json({'message': 'worked!'});
  // data.message = "worked!"
});
// put dreams in the DB
app.post('/dreams', createDream );

// Get dreams by user id from the DB
app.get('/dreams', getDreamsByUserId );

// editing a dream, saving it in the DB and recieving edited dreams from the DB
app.put('/dreams', editDream);

// delete a dream
app.delete('/dreams', deleteDream);

// Tell our app to listen for calls
app.listen(PORT, function(){
  console.log('we are running on ' + PORT);
});
