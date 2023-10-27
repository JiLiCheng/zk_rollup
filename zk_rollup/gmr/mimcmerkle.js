const mimcjs = await buildMimc7();

import {buildMimc7} from "circomlibjs";
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
    getProof(leafIdx, tree, leaves){
        depth = tree.length;
        proofIdx = this.proofIdx(leafIdx, depth);
        proof = new Array(depth);
        proof[0] = leaves[proofIdx[0]]
        for (i = 1; i < depth; i++){
            proof[i] = tree[depth - i][proofIdx[i]]
        }
        return proof;
    }

    getProofEmpty(height, zeroCache){
        const depth = zeroCache.length
        if (height < depth){
            return zeroCache.slice(height, depth + 1)
        } else {
            return []
        }
    }

    verifyProof(leaf, idx, proof, root){
        computed_root = module.exports.rootFromLeafAndPath(leaf, idx, proof)
        return (root == computed_root)
    }

    rootFromLeafAndPath(leaf, idx, merkle_path){
        if (merkle_path.length > 0){
            const depth = merkle_path.length
            const merkle_path_pos = module.exports.idxToBinaryPos(idx, depth)
            var root = new Array(depth);
            left = bigInt(leaf) - bigInt(merkle_path_pos[0])*(bigInt(leaf) - bigInt(merkle_path[0]));
            right = bigInt(merkle_path[0]) - bigInt(merkle_path_pos[0])*(bigInt(merkle_path[0]) - bigInt(leaf));
            root[0] = mimcjs.multiHash([left, right]);
            var i;
            for (i = 1; i < depth; i++) {
                left = root[i-1] - bigInt(merkle_path_pos[i])*(root[i-1] - bigInt(merkle_path[i]));
                right = bigInt(merkle_path[i]) - bigInt(merkle_path_pos[i])*(bigInt(merkle_path[i]) - root[i-1]);              
                root[i] = mimcjs.multiHash([left, right]);
            }
    
            return root[depth - 1];
        } else {
            return leaf
        }

    }

    // fill a leaf array with zero leaves until it is a power of 2
    padLeafArray(leafArray, zeroLeaf, fillerLength){
        if (Array.isArray(leafArray)){
            var arrayClone = leafArray.slice(0)
            const nearestPowerOfTwo = Math.ceil(module.exports.getBase2Log(leafArray.length))
            const diff = fillerLength || 2**nearestPowerOfTwo - leafArray.length
            for (var i = 0; i < diff; i++){
                arrayClone.push(zeroLeaf)
            }
            return arrayClone
        } else {
            console.log("please enter pubKeys as an array")
        }
    }


    // fill a leaf hash array with zero leaf hashes until it is a power of 2
    padLeafHashArray(leafHashArray, zeroLeafHash, fillerLength){
        if (Array.isArray(leafHashArray)){
            var arrayClone = leafHashArray.slice(0)
            const nearestPowerOfTwo = Math.ceil(module.exports.getBase2Log(leafHashArray.length))
            const diff = fillerLength || 2**nearestPowerOfTwo - leafHashArray.length
            for (var i = 0; i < diff; i++){
                arrayClone.push(zeroLeafHash)
            }
            return arrayClone
        } else {
            console.log("please enter pubKeys as an array")
        }
    }

    treeFromLeafArray(leafArray){
        depth = module.exports.getBase2Log(leafArray.length);
        tree = Array(depth);

        tree[depth - 1] = module.exports.pairwiseHash(leafArray)

        for (j = depth - 2; j >= 0; j--){
            tree[j] = module.exports.pairwiseHash(tree[j+1])
        }

        // return treeRoot[depth-1]
        return tree
    }

    rootFromLeafArray(leafArray){
        return module.exports.treeFromLeafArray(leafArray)[0][0]
    }

    pairwiseHash(array){
        if (array.length % 2 == 0){
            arrayHash = []
            for (i = 0; i < array.length; i = i + 2){
                arrayHash.push(mimcjs.multiHash(
                    [array[i].toString(),array[i+1].toString()]
                ))
            }
            return arrayHash
        } else {
            console.log('array must have even number of elements')
        }
    }

    generateMerklePosArray(depth){
        merklePosArray = [];
        for (i = 0;  i < 2**depth; i++){
            binPos = module.exports.idxToBinaryPos(i, depth)
            merklePosArray.push(binPos)
        }
        return merklePosArray;
    }

    generateMerkleProofArray(txTree, txLeafHashes){
        txProofs = new Array(txLeafHashes.length)
        for (jj = 0; jj < txLeafHashes.length; jj++){
            txProofs[jj] = module.exports.getProof(jj, txTree, txLeafHashes)
        }
        return txProofs;
    }

    ///////////////////////////////////////////////////////////////////////
    // HELPER FUNCTIONS
    ///////////////////////////////////////////////////////////////////////

    getBase2Log(y){
        return Math.log(y) / Math.log(2);
    }

    binaryPosToIdx(binaryPos){
        var idx = 0;
        for (i = 0; i < binaryPos.length; i++){
            idx = idx + binaryPos[i]*(2**i)
        }
        return idx;
    }

    idxToBinaryPos(idx, binLength){

        binString = idx.toString(2);
        binPos = Array(binLength).fill(0)
        for (j = 0; j < binString.length; j++){
            binPos[j] = Number(binString.charAt(binString.length - j - 1));
        }
        return binPos;
    }

    proofIdx(leafIdx, treeDepth){
        proofIdxArray = new Array(treeDepth);
        proofPos = module.exports.idxToBinaryPos(leafIdx, treeDepth);
        // console.log('proofPos', proofPos)

        if (leafIdx % 2 == 0){
            proofIdxArray[0] = leafIdx + 1;
        } else {
            proofIdxArray[0] = leafIdx - 1;
        }

        for (i = 1; i < treeDepth; i++){
            if (proofPos[i] == 1){
                proofIdxArray[i] = Math.floor(proofIdxArray[i - 1] / 2) - 1;
            } else {
                proofIdxArray[i] = Math.floor(proofIdxArray[i - 1] / 2) + 1;
            }
        }

        return(proofIdxArray)
    }

}




