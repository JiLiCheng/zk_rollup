import {buildMimc7} from "circomlibjs";
import fs from "fs";
const mimcjs = await buildMimc7();
const hash_leaf = [0,1,2,3];
for(var i=0;i<hash_leaf.length;i++){
    hash_leaf[i] = mimcjs.F.toString(mimcjs.multiHash([hash_leaf[i]]))
}

const h12 = mimcjs.F.toString(mimcjs.multiHash(hash_leaf.slice(0,2)))
const h34 = mimcjs.F.toString(mimcjs.multiHash(hash_leaf.slice(2,4)))
const root = mimcjs.F.toString(mimcjs.multiHash([h12,h34]))
//19841061478679081214949457796476271472380560471176846973868149355981074744743
console.log(hash_leaf)
console.log("h12的哈希值",h12)
console.log("h34的哈希值",h34)
console.log("root的哈希值",root)

//证明2
const inputs ={
    "in":[0,1,2,3]
}
fs.writeFileSync(
    "mimcdemo_input.json",
    JSON.stringify(inputs,null,2),
    "utf-8"
)
console.log("成功写入文件gmr_input.json文件")
