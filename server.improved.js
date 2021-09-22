const express = require("express")
const bodyParser = require("body-parser")
const mongodb = require( 'mongodb' )
const cookie = require( 'cookie-session' )
var ObjectId = require('mongodb').ObjectId
const app = express();

const uri = 'mongodb+srv://19kmunz:S0nOzOXBAuYOcDxl@cluster0.xpfgv.mongodb.net'

const client = new mongodb.MongoClient( uri, { useNewUrlParser: true, useUnifiedTopology:true })
let collection = null

client.connect()
  .then( () => {
    // will only create collection if it doesn't exist
    return client.db( 'a3' ).collection( 'pets' )
  })
  .then( __collection => {
    // store reference to collection
    collection = __collection
  })

app.use(express.static("public"))
app.use(express.static("views"))

// use express.urlencoded to get data sent by defaut form actions
// or GET requests
app.use( express.urlencoded({ extended:true }) )

// cookie middleware! The keys are used for encryption and should be
// changed
app.use( cookie({
  name: 'session',
  keys: ['4zFTJx2rVu3AkB', 'aMPnwJ9c4f4DZy']
}))

app.post( '/login', (req,res)=> async() => {
  let usersDb = null
  await client.connect()
  .then( () => {
    // will only create collection if it doesn't exist
    return client.db( 'a3' ).collection( 'users' )
  })
  .then( __collection => {
    // store reference to collection
    usersDb = __collection
  })
  // below is *just a simple authentication example* 
  // for A3, you should check username / password combos in your database
  if( req.body.password === 'test' ) {
    // define a variable that we can check in other middleware
    // the session object is added to our requests by the cookie-session middleware
    req.session.login = true
    
    res.redirect( '/' )
  }else{
    // password incorrect, redirect back to login page
    res.sendFile( __dirname + '/views/login.html' )
  }
})

// add some middleware that always sends unauthenicaetd users to the login page
app.use( function( req,res,next) {
  if( req.session.login === true )
    next()
  else
    res.sendFile( __dirname + '/views/login.html' )
})


app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/main.html')
})

app.post("/submit", bodyParser.json() , ( request, response ) => {
  console.log(request.body)
  let obj = request.body
  if (obj.name !== '' && obj.link !== '' && obj.type !== '') {
    let flip = Math.random();
    let call;
    switch (obj.type) {
      case 'Dog':
        call = (flip > 0.5) ? "ARF" : "WOOF";
        break;
      case 'Cat':
        call = (flip > 0.5) ? "MEOW" : "PURR";
        break;
      case 'Snake':
        call = (flip > 0.5) ? "TSSS" : "SSSWEET";
        break;
      case 'Bird':
        call = (flip > 0.5) ? "TWEET" : "CHIRP";
        break;
      default:
        call = (flip > 0.5) ? "HEWWO" : "I LOVE YOU";
    }
    obj.call = call;
    if(obj.hasOwnProperty("_id")){
      collection.updateOne( 
        {_id : ObjectId(obj._id) }, 
        { $set: {
            name: obj.name,
            link: obj.link,
            type: obj.type,
            call: obj.call
          }
        }, function(err, ress) {
          if (err) throw err;
          collection.find({ }).toArray()
            .then( result => response.json( result ) )
        })
      
    } else {
      obj.user = ObjectId("6148b6813e52f8cadd08544d")
      collection.insertOne(obj, 
         function(err, ress) {
            if (err) throw err;
            collection.find({ }).toArray()
              .then( result => response.json( result ) )
          })
    }
    
  } else {
    collection.find({ }).toArray()
      .then( result => response.json( result ) )
  }
})

app.post("/delete", bodyParser.json() , ( request, response ) => {
  console.log("Delete: " + request.body)
  let idObj = request.body
  console.log(idObj)
  collection.deleteOne({ _id: ObjectId(idObj.id) }, 
     function(err, ress) {
        if (err) throw err;
        collection.find({ }).toArray()
          .then( result => response.json( result ) )
      })
  
})

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
