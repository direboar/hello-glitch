

class UdonariumCharacter {
    public common: Common = new Common()
    public imageHashSHA256: string | null = null
    public details: Array<Detail> = []
    public chatpallette: ChatPallette | null = null

    addDetail(detail: Detail): void {
        this.details.push(detail)
    }
}

class Common {
    public name: string
    public size: Number
    constructor(name : string = "" , size : Number = 0) {
        this.name = name
        this.size = size
    }
}

class Detail {
    public label: string
    public detailItems: Array<DetailItem> = []
    constructor(label: string) {
        this.label = label
    }

    addDetailItem(item: DetailItem): void {
        this.detailItems.push(item)
    }
}

abstract class DetailItem {
    public name: string
    constructor(name: string) {
        this.name = name
    }
    abstract createNode(parent: any): any
}

class NormalResource extends DetailItem {
    public contents: string
    constructor(name: string, contents: string) {
        super(name)
        this.contents = contents
    }
    createNode(parent: any): any {
        const node = parent.node("data").attr({ name: this.name });
        node.text(this.contents)
        return node;
    }
}

class NoteResource extends DetailItem {
    public contents: string
    constructor(name: string, contents: string) {
        super(name)
        this.contents = contents
    }
    createNode(parent: any): any {
        const node = parent.node("data").attr({ name: this.name, type: "note" });
        node.text(this.contents)
        return node;
    }
}

class NumberResource extends DetailItem {
    public currentValue: Number
    public maxValue: Number
    constructor(name: string, currentValue: Number, maxValue: Number) {
        super(name)
        this.currentValue = currentValue
        this.maxValue = maxValue
    }

    createNode(parent: any): any {
        const node = parent.node("data").attr({ name: this.name, type: "numberResource", currentValue: this.currentValue });
        node.text(this.maxValue)
        return node;
    }
}

class ContainerItem extends DetailItem {
    public detailItems: Array<DetailItem> = []
    constructor(name: string) {
        super(name)
    }

    addDetailItem(item: DetailItem): void {
        this.detailItems.push(item)
    }

    createNode(parent: any): any {
        const node = parent.node("data").attr({ name: this.name });
        this.detailItems.forEach(detailItem => {
            detailItem.createNode(node)
        });
    }
}

class ChatPallette {
    public dicebot: string
    public contents: string
    constructor(dicebot: string, contents: string) {
        this.dicebot = dicebot
        this.contents = contents
    }
}

export { UdonariumCharacter, Common, Detail, DetailItem, NormalResource, NoteResource, NumberResource, ContainerItem, ChatPallette };
