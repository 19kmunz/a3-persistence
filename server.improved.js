const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const cookie = require("cookie-session");
var favicon = require('serve-favicon');
const mongodbSanitize = require('mongodb-sanitize');
const path = require('path')
var ObjectId = require("mongodb").ObjectId;
const app = express();


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// defaut form actions
// or GET requests
app.use(express.urlencoded({ extended: true }));

// COOKIE MIDDLEWARE
app.use(
  cookie({
    name: "session",
    keys: ["4zFTJx2rVu3AkB", "aMPnwJ9c4f4DZy"]
  })
);

app.use(mongodbSanitize());

// DB SETUP
const uri = "mongodb+srv://"+process.env.DBUSERNAME+":"+process.env.DBPASSWORD+"@cluster0.xpfgv.mongodb.net";

const client = new mongodb.MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
let collection = null;

client
  .connect()
  .then(() => {
    // will only create collection if it doesn't exist
    return client.db("a3").collection("pets");
  })
  .then(__collection => {
    // store reference to collection
    collection = __collection;
  });


// LOGIN / CREATE ACCOUNT
app.post("/login", (req, res) => {
  console.log("User activity detected!");
  client
    .connect()
    .then(() => {
      return client.db("a3").collection("users");
    })
    .then(usersDb => {
      usersDb.findOne({ username: req.body.username }, function(
        err,
        userEntry
      ) {
        if (err) throw err;
        if (userEntry === null) {
          // if login doesnt exist -> new account
          createAccount(req, res, usersDb);
        } else {
          // already exists, check login
          checkLoginPasswordAndRedirect(req, res, usersDb);
        }
      });
    });
});

const createAccount = function(req, res, usersDb) {
  console.log("Registering New User ...");
  usersDb.insertOne(
    { username: req.body.username, password: req.body.password },
    function(err, createdQuery) {
      console.log(createdQuery);
      if (err) throw err;
      if (createdQuery === null) {
        // error inserting, try logining in again
        res.sendFile(__dirname + "/public/creationFailed.html");
      } else {
        // setup new account
        insertSampleDataAndRedirect(req, res, usersDb, createdQuery.insertedId);
      }
    }
  );
};

const insertSampleDataAndRedirect = function(req, res, usersDb, id) {
  collection.insertMany(
    [
      {
        user: id,
        name: "Pippi (Default Dog)",
        call: "ARF",
        link:
          "https://cdn.discordapp.com/attachments/428381972545404928/884522236025913374/image0.jpg",
        type: "dog"
      },
      {
        user: id,
        name: "Mordecai (Default Cat)",
        call: "MEOW",
        link:
          "https://cdn.discordapp.com/attachments/428381972545404928/884522261237882910/image0.jpg",
        type: "cat"
      }
    ],
    function(err) {
      redirectAuthedUser(req, res, id);
    }
  );
};

const checkLoginPasswordAndRedirect = function(req, res, usersDb) {
  console.log("Authenticating ...");
  usersDb.findOne(
    { username: req.body.username, password: req.body.password },
    function(err, query) {
      if (err) throw err;
      if (query === null) {
        // failed auth, redirect to login
        console.log("Failed Authenticating! ");
        res.sendFile(__dirname + "/public/loginFailed.html");
      } else {
        // login successful
        redirectAuthedUser(req, res, query._id);
      }
    }
  );
};

const redirectAuthedUser = function(req, res, id) {
  req.session.login = true;
  req.session.id = id;
  console.log("Before Redirect Session Id: " + req.session.id);
  console.log("Redirecting User");
  res.redirect("/main.html");
};

// add some middleware that always sends unauthenicaetd users to the login page
app.use(function(req, res, next) {
  if (req.session.login == true || req.originalUrl === '/login.html' || req.originalUrl === '/loginFailed.html' || req.originalUrl === '/creationFailed.html' || req.originalUrl.includes('.css')) {
    next();
  } else if (req.originalUrl === '/public/sitemap.xml' || req.originalUrl === '/robots.txt' || req.originalUrl === '/public/robots.txt') {
    res.sendFile(__dirname + req.originalUrl);
  } else {
    res.sendFile(__dirname + "/public/login.html");
  }
});


// GET - get current db state of pet gallery
app.get("/get", (request, response) => {
  if (request.hasOwnProperty("session")) {
    getAllUserPets(request, response);
  }
});

const getAllUserPets = function(request, response) {
  collection
    .find({ user: ObjectId(request.session.id) })
    .toArray()
    .then(result => response.json(result));
};

const getAllUserPetsError = function(request, response, error) {
  collection
    .find({ user: ObjectId(request.session.id) })
    .toArray()
    .then(result => response.json({error: error, contents: result}));
};

// create and update calls - i should split them up but i wont <3
app.post("/createOrUpdatePet", bodyParser.json(), (request, response) => {
  console.log(request.body);
  let obj = request.body;
  if (obj.name !== "" && obj.link !== "" && obj.type !== "") {
    obj.call = decideCall(obj.type);
    if (obj.hasOwnProperty("_id")) {
      // if it has an id than it is an update request
      updatePet(request, response, obj);
    } else {
      // if no id, add to data base
      createPet(request, response, obj);
    }
  } else {
    //if invalid input, jsut return current state
    getAllUserPetsError(request, response, "Oops! One of your create or update inputs was an empty string! Please use at least one character for names and links.");
  }
});

const decideCall = function(type) {
  let flip = Math.random();
  let call;
  switch (type) {
    case "Dog":
      call = flip > 0.5 ? "ARF" : "WOOF";
      break;
    case "Cat":
      call = flip > 0.5 ? "MEOW" : "PURR";
      break;
    case "Snake":
      call = flip > 0.5 ? "TSSS" : "SSSWEET";
      break;
    case "Bird":
      call = flip > 0.5 ? "TWEET" : "CHIRP";
      break;
    default:
      call = flip > 0.5 ? "HEWWO" : "I LOVE YOU";
  }
  return call;
};

// update query
const updatePet = function(request, response, obj) {
  collection.updateOne(
    { _id: ObjectId(obj._id) },
    {
      $set: {
        name: obj.name,
        link: obj.link,
        type: obj.type,
        call: obj.call
      }
    },
    function(err, ress) {
    if (err) getAllUserPetsError(request, response, "There was an error updating your pet! Try Again later.");
      getAllUserPets(request, response);
    }
  );
};

// create query
const createPet = function(request, response, obj) {
  obj.user = ObjectId(request.session.id);
  collection.insertOne(obj, function(err, ress) {
    if (err) getAllUserPetsError(request, response, "There was an error creating your new pet! Try Again later.");
    getAllUserPets(request, response);
  });
};

// DELETE 
app.post("/delete", bodyParser.json(), (request, response) => {
  console.log("Delete: " + request.body);
  let idObj = request.body;
  console.log(idObj);
  collection.deleteOne({ _id: ObjectId(idObj.id) }, function(err, ress) {
    if (err) getAllUserPetsError(request, response, "There was an error deleting your pet! Try Again later.");
    getAllUserPets(request, response);
  });
}); 

// Express setup
app.use(express.static("./public/"));

// Listen!!!
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
