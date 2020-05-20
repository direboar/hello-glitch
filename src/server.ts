// server.js
// where your node app starts

const express = require("express");
const bodyParser = require('body-parser');
const app = express();
import * as fs from 'fs'
import { exec } from "./createUdonariumCharacter"

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// send the default array of dreams to the webpage
app.post("/udonarium/createCharacter", async (request: any, response: any) => {
  try {
    console.log(request.body)
    const id = request.body.data.id
    initOutDir()
    const outputFileInfo = await exec(id)
    if (!outputFileInfo) {
      //CORSモジュールを使用しない場合、functionsが返すBodyの形式をエミュレートしないとうまく返却されない。
      //@see https://firebase.google.com/docs/functions/callable-reference?hl=ja#failure_response_to_encode
      response.status(404).json({
        error: {
          details: {
            id: id,
            message: "指定されたIDが誤っています。"
          }
        }
      }).end()
      return
      //CORSモジュールを使用した場合、HttpsErrorをスローするとCORSモジュールによる解決が行われなくなる。
      // throw new functions.https.HttpsError("not-found", "指定されたIDが誤っています。", {
      //   id: id,
      //   detail : ""
      // });      
    }
    // const bucket = admin.storage().bucket("dnd5e-characters")

    // // const bucket = new Storage().bucket("dnd5e")    
    // const file = fileName.replace("/tmp/", "")
    // // console.log("xx")
    // // console.log(`${file}`)
    // // console.log(fileName)
    // const uploadResponse = await bucket.upload(fileName, {
    //   destination: `dnd5e/characters/${file}`,
    //   metadata: {
    //     contentType: 'application/zip',
    //   }
    // })

    // const downloadUrl = await uploadResponse[0].getSignedUrl({
    //   action: 'read',
    //   expires: moment().utc().add(1, 'minutes').format()
    // })

    // const responseJson = {
    //   data: {
    //     url: downloadUrl[0]
    //   }
    // }
    // response.send(JSON.stringify(responseJson));
    response.json({ id: id, file: outputFileInfo[0] });
    deleteFile("/tmp/", outputFileInfo)
  } catch (error) {
    console.error(error)
    //initOutDir("/tmp/")
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
    // initOutDir("/tmp/")
  }
});

// // listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

function deleteFile(dir: string, files: [string, string | null]): void {
  fs.unlinkSync(files[0])
  console.log(files[0])
  const xml = files[0].replace(/\.zip$/,".xml")  
  console.log(xml)
  fs.unlinkSync(xml)
  if(files[1]){
    fs.unlinkSync(files[1])
  }
}

function initOutDir() {
  const ret = fs.mkdirSync("/tmp/out", { recursive: true })
  console.log(ret)
}