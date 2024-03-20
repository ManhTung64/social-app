export class TrieNode {
    public children:any
    constructor() {
        this.children = new Map()
    }
}
export class BadWordNode extends TrieNode {
    public endWord:boolean
    public fullWord:string = null
    constructor(){
        super()
        this.endWord = false
    }
}