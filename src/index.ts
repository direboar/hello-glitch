import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import { exec } from "./createUdonariumCharacter"
import * as fs from 'fs'
import * as moment from "moment"
const cors = require('cors')({ origin: true });

admin.initializeApp({
  projectId: "friendry-chat"
});

exports.createUdonariumCharacter = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    try {
      const id = request.body.data.id
console.log("hoge")
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
      const bucket = admin.storage().bucket("dnd5e-characters")

      // const bucket = new Storage().bucket("dnd5e")    
      const file = outputFileInfo[0].replace("/tmp/", "")
      // console.log("xx")
      // console.log(`${file}`)
      // console.log(fileName)
      const uploadResponse = await bucket.upload(outputFileInfo[0], {
        destination: `dnd5e/characters/${file}`,
        metadata: {
          contentType: 'application/zip',
        }
      })

      const downloadUrl = await uploadResponse[0].getSignedUrl({
        action: 'read',
        expires: moment().utc().add(1, 'minutes').format()
      })

      const responseJson = {
        data: {
          url: downloadUrl[0]
        }
      }
      response.send(JSON.stringify(responseJson));
      deleteFile("/tmp/out",outputFileInfo)
    } catch (error) {
      console.error(error)
      // deleteFile("/tmp/out")
      response.status(500).json({
        error: {
          message : "システムエラーが発生しました",
          details: {
            id: request.body.data.id,
            message: error.toString
          }
        }
      }).end()

    } finally {
      // initOutDir("/tmp/")
    }
  })
});


function deleteFile(dir: string,files : [string,string|null]): void {
  files.forEach(file=>{
    if(file){
      fs.unlinkSync(file)
    }
  })
  // fs.readdir(dir, function (err, files) {
  //   if (err) {
  //     throw err;
  //   }
  //   files.forEach(function (file) {
  //     fs.unlink(`${dir}/${file}`, function (err) {
  //       if (err) {
  //         throw (err);
  //       }
  //       console.log(`deleted ${file}`);
  //     });
  //   });
  // });
}

function initOutDir(){
  const ret = fs.mkdirSync("/tmp/out",{ recursive: true })
  console.log(ret)
}