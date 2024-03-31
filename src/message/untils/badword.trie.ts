import { BadWordNode, TrieNode } from "./trieNode"

export abstract class Trie<T>{
    protected root:any
    public abstract insertElement(element:T):void
    public abstract search(key:string)
}
export class BadWord{
    value:string
}
export class BadWordTrie extends Trie<BadWord>{
    private IS_END_WORD: boolean = true
    private SKIP_VALUE:boolean = true
    constructor() {
        super()
        this.root = new BadWordNode()
    }
    public override insertElement(badword: BadWord) {
        let node: BadWordNode = this.root;
        for (const char of badword.value) {
            if (!node.children.has(char)) {
                node.children.set(char, new BadWordNode())
            }
            node = node.children.get(char)
        }
        node.fullWord = badword.value
        node.endWord = this.IS_END_WORD
    }
    public override search(value: string):string[] {
        try {
            value = value.replace(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\|\\/=]/g, ' ')
            let results: Array<string> = []
            let skip: boolean = !this.SKIP_VALUE
            let node: BadWordNode = this.root
            let i = 0
            for (const char of value) {
                if (skip){
                    if (char == ' ' && value[i + 1] != ' ') skip = !this.SKIP_VALUE
                }
                else if (!node.children.has(char)){
                    skip = true
                    node = this.root
                }else if (node.children.get(char).endWord == true && ((value[i + 1] == ' ') || (i == value.length - 1))){
                    results.push(node.children.get(char).fullWord)
                    node = this.root
                }
                else{
                    node = node.children.get(char)
                }
                i++
            }

            return results
        } catch (error) {
            console.log(error)
        }
    }
}