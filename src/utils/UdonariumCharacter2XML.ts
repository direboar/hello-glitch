
import { UdonariumCharacter, Common, Detail, ChatPallette } from "./UdonariumCharacter"
const libxml = require("libxmljs");

class UdonariumCharacter2XML {
    public buildXml(udonariumCharacter: UdonariumCharacter) : string{
        const document = this.convertToXML(udonariumCharacter)
        return document.toString()
    }

    private convertToXML(character: UdonariumCharacter): any {
        const doc = new libxml.Document();
        const characterElement = doc.node("character");
        const characterNode = characterElement
            .node("data")
            .attr({ name: "character" });
        if(!character.common){
            throw new Error("Commonが未設定");
        }else if(!character.chatpallette){
            throw new Error("Chatpalletteが未設定");
        }else{
            this.createImageNode(characterNode,character)
            this.createCommonNode(characterNode, character.common);
            this.createDetailsNode(characterNode, character.details);
            this.createChatPallette(characterElement, character.chatpallette);
            return doc;
        }
    }

    private createImageNode(parent: any, character: UdonariumCharacter): any {
        const node = parent.node("data").attr({ name: "image" });
        const imageNode = node.node("data").attr({name : "imageIdentifier", type: "image"})
        if(character.imageHashSHA256){
            imageNode.text(character.imageHashSHA256)
        }
        return node;
    }

    private createCommonNode(parent: any, common: Common): any {
        const node = parent.node("data").attr({ name: "common" });
        //キャラクター名
        const name = common.name;
        //size
        const size = common.size;

        node.node("data").attr({ name: "name" }).text(name);
        node.node("data").attr({ name: "size" }).text(size);

        return node;
    }

    private createDetailsNode(parent: any, details: Array<Detail>): any {
        const node = parent.node("data").attr({ name: "detail" });

        details.forEach(detail => {
            this.createDetailNode(node, detail)
        })
        return node;
    }

    private createDetailNode(parent: any, detail: Detail): any {
        const node = parent.node("data").attr({ name: detail.label });
        detail.detailItems.forEach(detailItem => {
            detailItem.createNode(node)
        })
        return node;
    }

    private createChatPallette(parent: any, chatPallette: ChatPallette): any {
        const node = parent.node("chat-palette")
            .attr({ dicebot: chatPallette.dicebot })
            .text(chatPallette.contents);
        return node;
    }

}


export { UdonariumCharacter2XML };
