import { Injectable } from "@nestjs/common";
import { readFile } from 'xlsx';
import { join, resolve } from 'path';
import { BadWord, BadWordTrie } from "../untils/badword.trie";

@Injectable()
export class CensoredService {
    public badword: BadWordTrie
    constructor() {
        this.badword = this.getBadWordFromFile()
    }
    private getBadWordFromFile(): BadWordTrie {
        const sheet = readFile(resolve(join(__dirname, '../../../../resource/bad-words.xlsx'))).Sheets['bad-words']
        const badwordTrie: BadWordTrie = new BadWordTrie()
        for (let rowNum = 1; ; rowNum++) {
            const cellName = sheet['A' + rowNum]
            if (!cellName) break
            const value: string = cellName.v.toLowerCase()
            const newBadword: BadWord = {value: value }
            badwordTrie.insertElement(newBadword)
        }
        return badwordTrie
    }
    public addOneBadWord(value: string): boolean {
        try {
            this.badword.insertElement({ value })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public addManyBadWord(values: Array<string>): boolean {
        try {
            values.map((word) => {
                this.badword.insertElement({ value:word })
            })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}

