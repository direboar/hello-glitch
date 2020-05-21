// server.js
// where your node app starts

import express from 'express'
const bodyParser = require('body-parser');
const cors = require('cors')
import * as fs from 'fs'
import { exec, CreateResult } from "./createUdonariumCharacter"

const app = express();

// app.use(cors);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Expose-Headers", "Content-Disposition")
  next();
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// send the default array of dreams to the webpage
app.get("/activate", (request, response) => {
  response.send("activate");
})

app.post("/cleanDir", (request, response) => {
  clearDir("/tmp/out")
  response.send("ok");
})

app.post("/udonarium/createCharacter", async (request, response) => {
  try {
    console.log(request.body)
    const id = request.body.data.id
    initOutDir()
    const result = await exec(id)
    if (!result) {
      response.status(404).json({
        details: {
          id: id,
          message: "指定されたIDが誤っています。"
        }
      }).end()
      return
    }
    response.download(result.zipFileName, encodeURIComponent(result.characterName + ".zip"), (error) => {
      if (error) {
        console.log("error")
        console.log(error)
      }
      deleteFile("/tmp/", result)
    })
  } catch (error) {
    console.error(error)
    response.status(500).json({
      error: {
        message: "システムエラーが発生しました",
        details: {
          id: request.body.data.id,
          message: error.toString
        }
      }
    }).end()

  } finally {
    //no op.
  }
});

// const listener = app.listen(80, () => {
const listener = app.listen(process.env.PORT, () => {
  const address: any = listener.address()
  if (address) {
    console.log("Your app is listening on port " + address.port);
  }
});

function deleteFile(dir: string, result: CreateResult): void {
  fs.unlinkSync(result.zipFileName)
  fs.unlinkSync(`/tmp/out/${result.xmlFileName}`)
  if (result.imageFileName) {
    fs.unlinkSync(result.imageFileName)
  }
}

function initOutDir() {
  const ret = fs.mkdirSync("/tmp/out", { recursive: true })
  console.log(ret)
}

function clearDir(dir: string): void {
  fs.readdir(dir, function (err, files) {
    if (err) {
      throw err;
    }
    files.forEach(function (file) {
      fs.unlink(`${dir}/${file}`, function (err) {
        if (err) {
          throw (err);
        }
        console.log(`deleted ${file}`);
      });
    });
  });
}
