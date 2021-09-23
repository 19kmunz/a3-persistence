const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const cookie = require("cookie-session");
var ObjectId = require("mongodb").ObjectId;
const app = express();

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

// DB SETUP
const uri = "mongodb+srv://19kmunz:S0nOzOXBAuYOcDxl@cluster0.xpfgv.mongodb.net";

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
        res.sendFile(__dirname + "/views/login.html");
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
        name: "Pippi",
        call: "ARF",
        link:
          "https://cdn.discordapp.com/attachments/428381972545404928/884522236025913374/image0.jpg",
        type: "dog"
      },
      {
        user: id,
        name: "Mordecai",
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
        res.sendFile(__dirname + "/views/login.html");
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
  res.redirect("/");
};

// DO NOT PUT ABOVE LOGIN INFO
// add some middleware that always sends unauthenicaetd users to the login page
app.use(function(req, res, next) {
  if (req.session.login == true) {
    next();
  } else {
    res.sendFile(__dirname + "/views/login.html");
  }
});

// Express setup
app.use(express.static("public"));
app.use(express.static("views"));

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
    getAllUserPets(request, response);
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
      if (err) throw err;
      getAllUserPets(request, response);
    }
  );
};

// create query
const createPet = function(request, response, obj) {
  obj.user = ObjectId(request.session.id);
  collection.insertOne(obj, function(err, ress) {
    if (err) throw err;
    getAllUserPets(request, response);
  });
};

// DELETE 
app.post("/delete", bodyParser.json(), (request, response) => {
  console.log("Delete: " + request.body);
  let idObj = request.body;
  console.log(idObj);
  collection.deleteOne({ _id: ObjectId(idObj.id) }, function(err, ress) {
    if (err) throw err;
    getAllUserPets(request, response);
  });
});

// Listen!!!
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
