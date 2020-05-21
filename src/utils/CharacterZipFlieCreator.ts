import * as fs from 'fs'
import * as crypto from 'crypto'
import axios from 'axios'
const { v4: uuidv4 } = require('uuid');

import { UdonariumCharacter } from "./UdonariumCharacter"
import { UdonariumCharacter2XML } from "./UdonariumCharacter2XML"
//型ファイルがおかしそう
const archiver = require("archiver");

class CharacterZipFlieCreator {

    private udonariumCharacter: UdonariumCharacter
    private imageUrl: string
    private imageBinary: Buffer | null = null
    private imageHashSHA256: string | null = null
    private outdir: string
    private random: boolean
    private zipFileName: string | null = null

    constructor(udonariumCharacter: UdonariumCharacter, imageUrl: string, outdir: string = "./out/", random: boolean = false) {
        this.udonariumCharacter = udonariumCharacter;
        this.imageUrl = imageUrl;
        this.outdir = outdir;
        this.random = random
    }

    public async createZipFile(): Promise<string> {
        //1.urlからimageファイルを作成
        const imageHashSHA256 = await this.loadImage(this.imageUrl)

        if (imageHashSHA256) {
            //2.imageHashを設定
            this.udonariumCharacter.imageHashSHA256 = imageHashSHA256
        }

        //3.xmlに変換
        const xml = new UdonariumCharacter2XML().buildXml(this.udonariumCharacter)

        //4.zip生成
        await this.saveFiles(xml);
        return await this.compress(xml);
    }

    public loadImage(imageUrl: string) {
        this.imageUrl = imageUrl
        return new Promise<string>((resolve: (value?: string) => void, reject: (reason?: any) => void) => {
            axios({
                timeout: 5000,
                method: "get",
                url: imageUrl,
                responseType: "arraybuffer", //bufferでとれる
            }).then((response) => {
                this.imageBinary = response.data
                const imageHashSHA256 = this.getImageHashSHA256();
                if (imageHashSHA256) {
                    resolve(imageHashSHA256);
                } else {
                    resolve()
                }
            }).catch((error) => {
                //1.errormessage
                if (error.message.startsWith("connect ECONNREFUSED")) {
                    //接続できない。
                    resolve()
                } else {
                    //ステータスコードで判定。
                    if (error.response) {
                        const status: string = error.response.status.toString();
                        if (status.startsWith("4")) {
                            resolve()
                        } else {
                            reject(error)
                        }
                    } else {
                        reject(error)
                    }
                }
            });
        });
    }

    public getImageHashSHA256(): string | null {
        if (this.imageHashSHA256) {
            return this.imageHashSHA256
        }
        if (this.imageBinary) {
            const shasum = crypto.createHash('sha256');
            shasum.update(this.imageBinary)
            return shasum.digest('hex');
        } else {
            return null
        }
    }

    private saveFiles(xml: string) {
        //1.xmlを出力
        fs.writeFileSync(`${this.outdir}${this.getXmlFileName()}`, xml, "utf-8");

        //2.imageを出力
        if (this.imageBinary) {
            console.log(`${this.outdir}${this.getImageFileName()}`)
            fs.writeFileSync(`${this.outdir}${this.getImageFileName()}`, this.imageBinary);
        }
    }

    private async compress(xml: string): Promise<string> {
        return new Promise<string>((resolve, reject)=>{
            try{
                var output = fs.createWriteStream(`${this.outdir}${this.getZipFileName()}`);
                const archive = archiver("zip", {
                    zlib: { level: 9 }, // Sets the compression level.
                });
                archive.pipe(output);
    
                archive.append(fs.createReadStream(`${this.outdir}${this.getXmlFileName()}`), {
                    name: this.getXmlFileName(),
                });
    
                if (this.imageBinary) {
                    archive.append(fs.createReadStream(`${this.outdir}${this.getImageFileName()}`, {}), {
                        name: this.getImageFileName(),
                    });
                }
    
                const outputFileName = `${this.outdir}${this.getZipFileName()}`
                output.on('close', function() {
                    console.log(archive.pointer() + ' total bytes');
                    console.log('archiver has been finalized and the output file descriptor has closed.');
                    resolve(outputFileName);
                });
    
                archive.finalize();
            }catch(error){
                reject(error)
            }
        });

    }

    public getZipFileName(): string {
        if (this.zipFileName) {
            return this.zipFileName;
        } else {
            const prefix = this.random ? uuidv4() : this.udonariumCharacter.common.name;
            this.zipFileName = this.formatFileName(prefix, 'zip');
            return this.zipFileName;
        }
    }
    public getXmlFileName(): string {
        return this.formatFileName(this.udonariumCharacter.common.name, 'xml');
    }
    public getImageFileName(): string | null {
        const imageHashSHA256 = this.getImageHashSHA256()
        if (imageHashSHA256) {
            return this.formatFileName(imageHashSHA256, this.getExt());
        } else {
            return null
        }
    }
    private formatFileName(org: string, ext: string): string {
        if (ext !== "") {
            return `${org.replace(/\//g, "").trim()}.${ext}`
        }
        return org
    }
    private getExt(): string {
        const exts = ['tif', 'tiff', 'jpeg', 'jpg', 'png', 'gif', 'bmp', 'pict']
        if (this.imageUrl) {
            const index = this.imageUrl.lastIndexOf(".")
            const ext = this.imageUrl.substr(index + 1)
            if (exts.indexOf(ext.toLowerCase()) !== -1) {
                return ext;
            }
            const find = exts.find(elem => {
                return this.imageUrl.indexOf(elem) !== -1 || this.imageUrl.indexOf(elem.toUpperCase()) !== -1
            })
            if (find) {
                return find
            }
            //推測不可の場合は、jpgに決め打ちする
            return "jpg"
        } else {
            return ""
        }
    }

}

export { CharacterZipFlieCreator }