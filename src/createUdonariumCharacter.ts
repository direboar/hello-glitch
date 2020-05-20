// import * as fs from 'fs'

const axios = require('axios').create({
  'responseType': 'arraybuffer'
})
const iconv = require('iconv-lite')
const {
  JSDOM
} = require('jsdom')


import { UdonariumCharacter, Common, Detail, NormalResource, NumberResource, ContainerItem, ChatPallette, NoteResource } from "./utils/UdonariumCharacter"
import { CharacterZipFlieCreator } from "./utils/CharacterZipFlieCreator"

// (async () => {
//   try {
//     const ret = await exec("9342")
//     console.log(ret)
//   } catch (error) {
//     console.log(error)
//   }
// })()

//read file in memory

export async function exec(id: string): Promise<string | null> {
  const siteUrl = `http://dndjp.sakura.ne.jp/OUTPUT.php?ID=${id}`

  let response = null;
  try {
    response = await axios.get(
      siteUrl,
      {
        responseType: 'arraybuffer',
        timeout: 5000,
      },
    )
  } catch (error) {
    //FIXME 共通化！ひどすぎる
    if (error.message.startsWith("connect ECONNREFUSED")) {
      //接続できない。
      return null
    } else {
      //ステータスコードで判定。
      if (error.response) {
        const status: string = error.response.status.toString();
        if (status.startsWith("4")) {
          return null
        } else {
          console.log(error)
          throw error;
        }
      } else {
        console.log(error)
        throw error;
      }
    }
  }

  try {
    const body = iconv.decode(response.data, "Shift-JIS")
    const dom = new JSDOM(body, { contentType: "text/html" })
    const name = dom.window.document.querySelector('title').textContent.trim()

    //キャラクターの存在判定
    if (!name) {
      return null
    }

    const imageurl = dom.window.document.querySelector('img').src.trim()
    const attribute = dom.window.document.querySelector('table tr:nth-of-type(2) td:nth-of-type(2)').textContent.trim()
    const playername = dom.window.document.querySelector('table tr:nth-of-type(2) td:nth-of-type(3) b').textContent.trim()
    const clazz = dom.window.document.querySelector('table tr:nth-of-type(3) td:nth-of-type(1) b').textContent.trim()
    const level = dom.window.document.querySelector('table tr:nth-of-type(3) td:nth-of-type(2) b').textContent.trim()
    const race = dom.window.document.querySelector('table tr:nth-of-type(4) td:nth-of-type(1) b').textContent.trim()
    const size = dom.window.document.querySelector('table tr:nth-of-type(4) td:nth-of-type(2) b').textContent.trim()

    const ac = dom.window.document.querySelector('table:nth-of-type(2) td:nth-of-type(2) td:nth-of-type(1) b').textContent.trim()
    //うまくtdでとれなかった。
    const inisiative = dom.window.document.querySelector('table:nth-of-type(2) td:nth-of-type(1) tr:nth-of-type(2)').childNodes[1].textContent 
    const speed = dom.window.document.querySelector('table:nth-of-type(2) td:nth-of-type(3) tr:nth-of-type(2) td:nth-of-type(2) div').textContent.trim()

    const ability = {
      str: dom.window.document.querySelector('table:nth-of-type(3) table tr:nth-of-type(2) td:nth-of-type(1) b').textContent.trim(),
      dex: dom.window.document.querySelector('table:nth-of-type(3) table tr:nth-of-type(3) td:nth-of-type(1) b').textContent.trim(),
      con: dom.window.document.querySelector('table:nth-of-type(3) table tr:nth-of-type(4) td:nth-of-type(1) b').textContent.trim(),
      int: dom.window.document.querySelector('table:nth-of-type(3) table tr:nth-of-type(5) td:nth-of-type(1) b').textContent.trim(),
      wis: dom.window.document.querySelector('table:nth-of-type(3) table tr:nth-of-type(6) td:nth-of-type(1) b').textContent.trim(),
      cha: dom.window.document.querySelector('table:nth-of-type(3) table tr:nth-of-type(7) td:nth-of-type(1) b').textContent.trim()
    }

    const expertice = dom.window.document.querySelector('table:nth-of-type(3) tr:nth-of-type(1) td:nth-of-type(4)').textContent.trim()
    const save = {
      str: dom.window.document.querySelector('table:nth-of-type(3) table:nth-of-type(2) tr:nth-of-type(2) td:nth-child(2) ').textContent.trim(),
      dex: dom.window.document.querySelector('table:nth-of-type(3) table:nth-of-type(2) tr:nth-of-type(3) td:nth-child(2) ').textContent.trim(),
      con: dom.window.document.querySelector('table:nth-of-type(3) table:nth-of-type(2) tr:nth-of-type(4) td:nth-child(2) ').textContent.trim(),
      int: dom.window.document.querySelector('table:nth-of-type(3) table:nth-of-type(2) tr:nth-of-type(5) td:nth-child(2) ').textContent.trim(),
      wis: dom.window.document.querySelector('table:nth-of-type(3) table:nth-of-type(2) tr:nth-of-type(6) td:nth-child(2) ').textContent.trim(),
      cha: dom.window.document.querySelector('table:nth-of-type(3) table:nth-of-type(2) tr:nth-of-type(7) td:nth-child(2) ').textContent.trim(),
    }
    const table3 = dom.window.document.querySelector('table:nth-of-type(3)')
    const hp = table3.childNodes[1].childNodes[0].childNodes[9].childNodes[1].childNodes[1].childNodes[8].childNodes[1].textContent.trim() //まともに解析できない
    const hitdice = table3.childNodes[1].childNodes[0].childNodes[9].childNodes[1].childNodes[1].childNodes[12].childNodes[3].textContent.trim() //まともに解析できない
    const skill = {
      INTIMIDATION: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(3) b').textContent.trim(),
      MEDICINE: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(4) b').textContent.trim(),
      ATHLETICS: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(5) b').textContent.trim(),
      STEALTH: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(6) b').textContent.trim(),
      ACROBATICS: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(7) b').textContent.trim(),
      INSIGHT: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(8) b').textContent.trim(),
      PERFORMANCE: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(9) b').textContent.trim(),
      NATURE: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(10) b').textContent.trim(),
      RELIGION: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(11) b').textContent.trim(),
      SURVIVAL: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(12) b').textContent.trim(),
      PERSUASION: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(13) b').textContent.trim(),
      INVESTIGATION: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(14) b').textContent.trim(),
      PERCEPTION: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(15) b').textContent.trim(),
      SLEIGHTOFHAND: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(16) b').textContent.trim(),
      ANIMALHANDLING: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(17) b').textContent.trim(),
      DECEPTION: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(18) b').textContent.trim(),
      ARCANA: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(19) b').textContent.trim(),
      HISTORY: dom.window.document.querySelector('table:nth-of-type(4) table tr:nth-of-type(20) b').textContent.trim(),
    }

    const spellSave = dom.window.document.querySelector('table:nth-of-type(6) tr:nth-of-type(4) td:nth-of-type(6) b').textContent.trim()
    const spellAttack = dom.window.document.querySelector('table:nth-of-type(6) tr:nth-of-type(4) td:nth-of-type(8) b').textContent.trim()

    const level0_2table = dom.window.document.querySelector('table:nth-of-type(7)').childNodes[1].childNodes[0].childNodes[1]
    const level3_5table = dom.window.document.querySelector('table:nth-of-type(7)').childNodes[1].childNodes[0].childNodes[2]
    const level6_9table = dom.window.document.querySelector('table:nth-of-type(7)').childNodes[1].childNodes[0].childNodes[3]

    const slots = {
      lv1: level0_2table.querySelector('tr:nth-child(16) td:nth-of-type(3)').textContent.trim(),
      lv2: level0_2table.querySelector('tr:nth-of-type(33) td:nth-of-type(3)').textContent.trim(),
      lv3: level3_5table.querySelector('tr:nth-child(2) td:nth-of-type(3)').textContent.trim(),
      lv4: level3_5table.querySelector('tr:nth-child(19) td:nth-of-type(3)').textContent.trim(),
      lv5: level3_5table.querySelector('tr:nth-child(35) td:nth-of-type(3)').textContent.trim(),
      lv6: level6_9table.querySelector('tr:nth-child(2) td:nth-of-type(3)').textContent.trim(),
      lv7: level6_9table.querySelector('tr:nth-child(16) td:nth-of-type(3)').textContent.trim(),
      lv8: level6_9table.querySelector('tr:nth-child(28) td:nth-of-type(3)').textContent.trim(),
      lv9: level6_9table.querySelector('tr:nth-child(39) td:nth-of-type(3)').textContent.trim(),
    }

    const spells = {
      lv0: [] as Array<string>,
      lv1: [] as Array<string>,
      lv2: [] as Array<string>,
      lv3: [] as Array<string>,
      lv4: [] as Array<string>,
      lv5: [] as Array<string>,
      lv6: [] as Array<string>,
      lv7: [] as Array<string>,
      lv8: [] as Array<string>,
      lv9: [] as Array<string>,
    }
    for (let i = 0; i < 10; i++) {
      spells.lv0.push(level0_2table.querySelector(`tr:nth-child(${4 + i}) td`).textContent.trim())
    }
    for (let i = 0; i < 13; i++) {
      spells.lv1.push(level0_2table.querySelector(`tr:nth-child(${18 + i}) td:nth-child(2)`).textContent.trim())
    }
    for (let i = 0; i < 13; i++) {
      spells.lv2.push(level0_2table.querySelector(`tr:nth-child(${35 + i}) td:nth-child(2)`).textContent.trim())
    }
    for (let i = 0; i < 13; i++) {
      spells.lv3.push(level3_5table.querySelector(`tr:nth-child(${4 + i}) td:nth-child(2)`).textContent.trim())
    }
    for (let i = 0; i < 11; i++) {
      spells.lv4.push(level3_5table.querySelector(`tr:nth-child(${21 + i}) td:nth-child(2)`).textContent.trim())
    }
    for (let i = 0; i < 10; i++) {
      spells.lv5.push(level3_5table.querySelector(`tr:nth-child(${37 + i}) td:nth-child(2)`).textContent.trim())
    }
    for (let i = 0; i < 10; i++) {
      spells.lv6.push(level6_9table.querySelector(`tr:nth-child(${4 + i}) td:nth-child(2)`).textContent.trim())
    }
    for (let i = 0; i < 8; i++) {
      spells.lv7.push(level6_9table.querySelector(`tr:nth-child(${18 + i}) td:nth-child(2)`).textContent.trim())
    }
    for (let i = 0; i < 7; i++) {
      spells.lv8.push(level6_9table.querySelector(`tr:nth-child(${30 + i}) td:nth-child(2)`).textContent.trim())
    }
    for (let i = 0; i < 6; i++) {
      spells.lv9.push(level6_9table.querySelector(`tr:nth-child(${41 + i}) td:nth-child(2)`).textContent.trim())
    }

    //まともに解析できない
    const backgroundTable = dom.window.document.querySelector('table:nth-of-type(4)').childNodes[1].childNodes[0].childNodes[9]
    // 背景
    const background = backgroundTable.querySelector('TR:nth-of-type(3)').textContent.trim()
    // 人格的特徴
    const traits = backgroundTable.querySelector('TR:nth-of-type(7)').textContent.trim()
    // 尊ぶもの
    const ideals = backgroundTable.querySelector('TR:nth-of-type(11)').textContent.trim()
    // 関わり深いもの
    const bonds = backgroundTable.querySelector('TR:nth-of-type(15)').textContent.trim()
    // 弱味
    const flows = backgroundTable.querySelector('TR:nth-of-type(19)').textContent.trim()
    // その他設定など
    const characterDesign = backgroundTable.querySelector('TR:nth-of-type(23)').textContent.trim()
    // その他の習熟と言語
    const etc = dom.window.document.querySelector('table:nth-of-type(5) table tr:nth-of-type(2)').textContent.trim()
    // 特徴・特性    
    //まともに解析できない
    const featsTable = dom.window.document.querySelector('table:nth-of-type(5)').childNodes[1].childNodes[0].childNodes[5]
    const feats = featsTable.querySelector('table tr:nth-of-type(3)').textContent.trim()

    const character = new UdonariumCharacter()
    character.common = new Common(name, 1)
    const basicSection = new Detail("基本")
    basicSection.addDetailItem(new NormalResource("種族", race))
    basicSection.addDetailItem(new NormalResource("クラス", clazz))
    basicSection.addDetailItem(new NormalResource("属性", attribute))
    basicSection.addDetailItem(new NormalResource("プレイヤー", playername))
    basicSection.addDetailItem(new NormalResource("レベル", level))
    character.addDetail(basicSection)

    const abilitySection = new Detail("能力値")　//fixme 修正値を足す
    abilitySection.addDetailItem(new NormalResource("【筋力】", ability.str))
    abilitySection.addDetailItem(new NormalResource("【敏捷力】", ability.dex))
    abilitySection.addDetailItem(new NormalResource("【耐久力】", ability.con))
    abilitySection.addDetailItem(new NormalResource("【知力】", ability.int))
    abilitySection.addDetailItem(new NormalResource("【判断力】", ability.wis))
    abilitySection.addDetailItem(new NormalResource("【魅力】", ability.cha))
    character.addDetail(abilitySection)

    const dataSection = new Detail("行動データ")　//fixme 修正値を足す
    dataSection.addDetailItem(new NormalResource("AC", ac))
    dataSection.addDetailItem(new NumberResource("ヒット・ポイント", hp, hp))
    dataSection.addDetailItem(new NormalResource("ヒット・ダイス", hitdice))
    dataSection.addDetailItem(new NumberResource("インスピレーション", 0, 1))
    dataSection.addDetailItem(new NormalResource("習熟ボーナス", expertice))
    dataSection.addDetailItem(new NormalResource("呪文攻撃ロール", spellAttack))
    dataSection.addDetailItem(new NormalResource("呪文セーブ", spellSave))
    dataSection.addDetailItem(new NormalResource("サイズ", size))
    dataSection.addDetailItem(new NormalResource("移動速度", speed))
    dataSection.addDetailItem(new NormalResource("イニシアチブ", inisiative)) 
    dataSection.addDetailItem(new NormalResource("状態異常", "-"))
    character.addDetail(dataSection)

    const skillSection = new Detail("技能")
    skillSection.addDetailItem(new NormalResource("〈威圧〉", skill.INTIMIDATION));//INTIMIDATION
    skillSection.addDetailItem(new NormalResource("〈医術〉", skill.MEDICINE));//MEDICINE
    skillSection.addDetailItem(new NormalResource("〈運動〉", skill.ATHLETICS));//ATHLETICS
    skillSection.addDetailItem(new NormalResource("〈隠密〉", skill.STEALTH));//STEALTH
    skillSection.addDetailItem(new NormalResource("〈軽業〉", skill.ACROBATICS));//ACROBATICS
    skillSection.addDetailItem(new NormalResource("〈看破〉", skill.INSIGHT));//INSIGHT
    skillSection.addDetailItem(new NormalResource("〈芸能〉", skill.PERFORMANCE));//PERFORMANCE
    skillSection.addDetailItem(new NormalResource("〈自然〉", skill.NATURE));//NATURE
    skillSection.addDetailItem(new NormalResource("〈宗教〉", skill.RELIGION));//RELIGION
    skillSection.addDetailItem(new NormalResource("〈生存〉", skill.SURVIVAL));//SURVIVAL
    skillSection.addDetailItem(new NormalResource("〈説得〉", skill.PERSUASION));//PERSUASION
    skillSection.addDetailItem(new NormalResource("〈捜査〉", skill.INVESTIGATION));//INVESTIGATION
    skillSection.addDetailItem(new NormalResource("〈知覚〉", skill.PERCEPTION));//PERCEPTION
    skillSection.addDetailItem(new NormalResource("〈手先の早業〉", skill.SLEIGHTOFHAND));//Sleight
    skillSection.addDetailItem(new NormalResource("〈動物使い〉", skill.ANIMALHANDLING));//ANIMAL HANDLING	
    skillSection.addDetailItem(new NormalResource("〈ペテン〉", skill.DECEPTION));//DECEPTION
    skillSection.addDetailItem(new NormalResource("〈魔法学〉", skill.ARCANA));//ARCANA
    skillSection.addDetailItem(new NormalResource("〈歴史〉", skill.HISTORY));//HISTORY
    character.addDetail(skillSection)

    const saveSection = new Detail("セーヴィングスロー")
    saveSection.addDetailItem(new NormalResource("【筋力】", save.str))
    saveSection.addDetailItem(new NormalResource("【敏捷力】", save.dex))
    saveSection.addDetailItem(new NormalResource("【耐久力】", save.con))
    saveSection.addDetailItem(new NormalResource("【知力】", save.int))
    saveSection.addDetailItem(new NormalResource("【判断力】", save.wis))
    saveSection.addDetailItem(new NormalResource("【魅力】", save.cha))
    character.addDetail(saveSection)

    const etcSection = new Detail("特徴等")
    etcSection.addDetailItem(new NoteResource("背景", background))
    etcSection.addDetailItem(new NoteResource("人格的特徴", traits))
    etcSection.addDetailItem(new NoteResource("尊ぶもの", ideals))
    etcSection.addDetailItem(new NoteResource("関わり深いもの", bonds))
    etcSection.addDetailItem(new NoteResource("弱味", flows))
    etcSection.addDetailItem(new NoteResource("その他設定など", characterDesign))
    etcSection.addDetailItem(new NoteResource("その他の習熟と言語", etc))
    etcSection.addDetailItem(new NoteResource("特徴・特性", feats))
    character.addDetail(etcSection)

    const spellSection = new Detail("呪文")
    spellSection.addDetailItem(createSpellDetailItem("初級呪文", spells.lv0))
    spellSection.addDetailItem(createSpellDetailItem("LV1", spells.lv1, slots.lv1))
    spellSection.addDetailItem(createSpellDetailItem("LV2", spells.lv2, slots.lv2))
    spellSection.addDetailItem(createSpellDetailItem("LV3", spells.lv3, slots.lv3))
    spellSection.addDetailItem(createSpellDetailItem("LV4", spells.lv4, slots.lv4))
    spellSection.addDetailItem(createSpellDetailItem("LV5", spells.lv5, slots.lv5))
    spellSection.addDetailItem(createSpellDetailItem("LV6", spells.lv6, slots.lv6))
    spellSection.addDetailItem(createSpellDetailItem("LV7", spells.lv7, slots.lv7))
    spellSection.addDetailItem(createSpellDetailItem("LV8", spells.lv8, slots.lv8))
    spellSection.addDetailItem(createSpellDetailItem("LV9", spells.lv9, slots.lv9))
    //todo
    character.addDetail(spellSection);

    character.chatpallette = new ChatPallette("DungeonsAndDoragons", await getChatPallette(`http://dndjp.sakura.ne.jp/CREATECP.php?ID=${id}`));
    const creator = new CharacterZipFlieCreator(character, imageurl, "/tmp/")
    const fileName = await creator.createZipFile()
    return fileName

  } catch (e) {
    console.error(e)
    throw e
  } finally {
  }
}

function createSpellDetailItem(label: string, spells: Array<string>, slot: number | null = null): ContainerItem {
  const retVal = new ContainerItem(label)
  slot = slot ? slot : 0
  retVal.addDetailItem(new NumberResource("スロット", slot, slot));

  spells
    .filter(spell => { return spell.trim() !== "" })
    .map(spell => {
      return new NormalResource("", spell)
    }).forEach(item => {
      if (item) {
        retVal.addDetailItem(item)
      }
    })
  return retVal
}

async function getChatPallette(url: string) {
  const response = await axios.get(url, { responseType: 'arraybuffer' })
  const body = iconv.decode(response.data, "Shift-JIS")
  const dom = new JSDOM(body, { contentType: "text/html" })
  const retVal = dom.window.document.querySelector('textarea').textContent.trim()
  return retVal
}