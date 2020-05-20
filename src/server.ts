// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// // our default array of dreams
// const dreams = [
//   "Find and count some sheep",
//   "Climb a really tall mountain",
//   "Wash the dishes"
// ];

// // make all the files in 'public' available
// // https://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));

// // https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request : any, response : any) => {
//   response.sendFile(__dirname + "/views/index.html");
// });

// send the default array of dreams to the webpage
app.post("/udonarium/createCharacter", (request : any, response : any) => {
console.log(request.body)  
  const id = request.body.data.id
  response.json({id : id});
  // express helps us take JS objects and send them as JSON
  // return res.status(200).send(<Bufferデータ>);  
  // response.json(dreams);
});

// // listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
