import {buildMimc7} from "circomlibjs";
import fs from "fs";
const mimcjs = await buildMimc7();
const F = mimcjs.F;
function demo(arr){
    const h = mimcjs.multiHash(arr);
    const h_string = F.toString(h);
    const h_string_e = F.e(h_string);
    const result = {
        h:h,
        h_string:h_string,
        h_string_e:h_string_e,
    }
    return result;
}
const h0 = demo([1]);
const h1 = demo([1]);
const h2 = demo([2]);
const h3 = demo([3]);
const h01 = demo([h0.h,h1.h])
const h23 = demo([h2.h,h3.h])
const h0123 = demo([h01.h,h23.h])
console.log("h0",h0.h_string);
console.log("h1",h1.h_string);
console.log("   h01",h01.h_string)
console.log("h2",h2.h_string);
console.log("h3",h3.h_string);
console.log("   h23",h23.h_string);
console.log("      h0123",h0123.h_string);
console.log("---------------------------------------------------------------------------------")

const input ={
    "hash_leaf": h2.h,
    "paths2_root":[h3.h,h01.h],
    "paths2_root_pos":[F.e(1),F.e(0)],
}

const merkle_root_in0 = F.sub(
    input.paths2_root[0],
    F.mul(
        input.paths2_root_pos[0],
        F.sub( input.paths2_root[0],input.hash_leaf)
    )
)
const merkle_root_in1 = F.sub(
    input.hash_leaf,
    F.mul(
        input.paths2_root_pos[0],
        F.sub(input.hash_leaf,input.paths2_root[0])
    )
)
const merkle0_out = mimcjs.multiHash([merkle_root_in0,merkle_root_in1])
console.log("merkle_root[0].in[0]",F.toString(merkle_root_in0))
console.log("merkle_root[0].in[1]",F.toString(merkle_root_in1))
console.log("merkle_root[0].out",F.toString(merkle0_out))

const k = 2;
for(let v = 1 ;v<k;v++){
    const merkle_root_inv0 = F.sub(
        input.paths2_root[v],
        F.mul(
            input.paths2_root_pos[v],
            F.sub( input.paths2_root[v],merkle0_out)
        )
    )
    const merkle_root_inv1 = F.sub(
        merkle0_out,
        F.mul(
            input.paths2_root_pos[v],
            F.sub(
                merkle0_out,input.paths2_root[v]
            )
        )
    )
    const merkle0_vout = mimcjs.multiHash([merkle_root_inv0,merkle_root_inv1])
    
console.log(F.toString(merkle_root_inv0))
console.log(F.toString(merkle_root_inv1))
console.log(F.toString(merkle0_vout))
}


const inputs ={
    "hash_leaf": h2.h_string,
    "paths2_root":[h3.h_string,h01.h_string],
    "paths2_root_pos":[1,0]
}
fs.writeFileSync(
    "gmr_input.json",
    JSON.stringify(inputs,null,2),
    "utf-8"
)
