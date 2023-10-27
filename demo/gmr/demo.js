
import {buildMimc7} from "circomlibjs";
const mimcjs = await buildMimc7();
export default async function buildMimc7Merkle(){
    return new Mimc7Merkle(mimcjs.F);
}

class Mimc7Merkle{
    constructor(F){
        this.F = F;
    }
    getZeroCache(zeroLeafHash, depth){
        var zeroCache = new Array(depth)
        zeroCache[0] = zeroLeafHash
        for (var i = 1; i < depth; i++){
            zeroCache[i] = mimcjs.multiHash([zeroCache[i-1],zeroCache[i-1]])
        }
        return zeroCache
    }
}
const mm = await buildMimc7Merkle();
console.log(mm.getZeroCache(12,4))




