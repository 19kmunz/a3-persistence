const express = require("express")
const bodyParser = require("body-parser")
const mongodb = require( 'mongodb' )
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

const appdata = [
  { 'id':1, 'name': 'Pippi', 'link': 'https://cdn.discordapp.com/attachments/428381972545404928/884522236025913374/image0.jpg', 'call': 'ARF', 'type': 'dog' },
  { 'id':2, 'name': 'Mordecai', 'link': 'https://cdn.discordapp.com/attachments/428381972545404928/884522261237882910/image0.jpg', 'call': 'MEOW', 'type': 'cat' },
  { 'id':3, 'name': 'Bubba', 'link': 'https://i.imgur.com/Db4cRax.png', 'call': 'I LOVE YOU', 'type':'other'}
];

let currId=4;

app.use(express.static("public"))

app.get("/", (request, response) => {
  response.sendFile(__dirname)
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
    if(obj.hasOwnProperty("id")){
      var index = appdata.findIndex(function(item){
        return item.id == obj.id // using this on purpose cause obj stores id as string
      });
      if(index < 0) {
        response.writeHead(400, "Bad Id For Update", {'Content-Type': 'text/plain'})
        response.end(JSON.stringify(appdata))
      } else {
        appdata[index] = obj;
      }
    } else {
      obj.user = {  "\$oid": "6148b6813e52f8cadd08544d" }
      collection.insertOne(obj).then(console.log)
      obj.id = currId;
      currId++;
      appdata.push(obj)
    }
    response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
    response.end(JSON.stringify(appdata))
  } else {
    response.writeHead(200, "Request Had No Valid Content to Add, sending Current Unchanged State.", {'Content-Type': 'text/plain'})
    response.end(JSON.stringify(appdata))
  }
})

app.post("/delete", bodyParser.json() , ( request, response ) => {
  console.log("Delete: " + request.body)
  let idObj = request.body
  if(idObj.id < 0 || idObj.id > currId){
    response.writeHead(400, "Bad Id For Deletion", {'Content-Type': 'text/plain'})
    response.end(JSON.stringify(appdata))
  } else {
    console.log(idObj)
    var index = appdata.findIndex(function(item){
      return item.id == idObj.id // using this on purpose cause idObj stores id as string
    });
    console.log(index)
    if(index < 0) {
      response.writeHead(400, "Bad Id For Deletion", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify(appdata))
    } else {
      appdata.splice(index, 1)
      response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify(appdata))
    }
  }
})

/*
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://19kmunz:<password>@cluster0.xpfgv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
*/

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
