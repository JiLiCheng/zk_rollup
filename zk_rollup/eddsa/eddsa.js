import {buildEddsa,buildMimc7} from "circomlibjs";
import fs from "fs";
const eddsa = await buildEddsa();
const mimcjs = await buildMimc7();
const F = mimcjs.F;
 
const preimage = [123,456,789];
const M = mimcjs.multiHash(preimage);
const prvKey = Buffer.from('1'.toString().padStart(64,'0'), "hex");
const pubKey = eddsa.prv2pub(prvKey);

const signature = eddsa.signMiMC(prvKey, M);

const inputs = {
    "from_x": F.toString(pubKey[0]),
    "from_y": F.toString(pubKey[1]),
    "R8x": F.toString(signature['R8'][0]),
    "R8y": F.toString(signature['R8'][1]),
    "S": signature['S'].toString(),
    "M": F.toString(M),
    "bug":8,
}

fs.writeFileSync(
    "./eddsa_input.json",
    JSON.stringify(inputs,null,2),
    "utf-8"
);