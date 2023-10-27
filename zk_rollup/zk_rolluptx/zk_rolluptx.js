import fs from 'fs';
import { buildEddsa,buildMimc7} from 'circomlibjs';
const mimcjs = await buildMimc7();
const F = mimcjs.F;
const eddsa = await buildEddsa();

const alicePrvKey = Buffer.from('1'.toString().padStart(64,'0'), "hex");
const alicePubKey = eddsa.prv2pub(alicePrvKey);
const bobPrvKey = Buffer.from('2'.toString().padStart(64,'0'), "hex");
const bobPubKey = eddsa.prv2pub(bobPrvKey);
//Alice的账户
const Alice = {
    pubkey: alicePubKey,
    balance: 500
}
const aliceHash = mimcjs.multiHash(
    [Alice.pubkey[0], Alice.pubkey[1], Alice.balance]
);
const Bob = {
    pubkey: bobPubKey,
    balance: 0
}
const bobHash = mimcjs.multiHash(
    [Bob.pubkey[0], Bob.pubkey[1], Bob.balance]
);
const accounts_root = mimcjs.multiHash([aliceHash, bobHash])

// transaction
const tx = {
    from: Alice.pubkey,
    to: Bob.pubkey,
    amount: 500
}

// Alice sign tx
const txHash = mimcjs.multiHash(
    [tx.from[0], tx.from[1], tx.to[0], tx.to[1], tx.amount]
);
const signature = eddsa.signMiMC(alicePrvKey, txHash)

// update Alice account
const newAlice = {
    pubkey: alicePubKey,
    balance: 0
}
const newAliceHash = mimcjs.multiHash(
    [newAlice.pubkey[0], newAlice.pubkey[1], newAlice.balance]
);

// update intermediate root
const intermediate_root = mimcjs.multiHash([newAliceHash, bobHash])

// update Bob account
const newBob = {
    pubkey: bobPubKey,
    balance: 500
}
const newBobHash = mimcjs.multiHash(
    [newBob.pubkey[0], newBob.pubkey[1], newBob.balance]
);

// update final root
const final_root = mimcjs.multiHash([newAliceHash, newBobHash])


const inputs = {
    "accounts_root": F.toString(accounts_root),
    "intermediate_root": F.toString(intermediate_root),
    "accounts_pubkeys": [
        [F.toString(Alice.pubkey[0]), F.toString(Alice.pubkey[1])], 
        [F.toString(Bob.pubkey[0]), F.toString(Bob.pubkey[1])]
    ],
    "accounts_balances": [Alice.balance, Bob.balance],
    "sender_pubkey": [F.toString(Alice.pubkey[0]), F.toString(Alice.pubkey[1])],
    "sender_balance": Alice.balance,
    "receiver_pubkey": [F.toString(Bob.pubkey[0]), F.toString(Bob.pubkey[1])],
    "receiver_balance": Bob.balance,
    "amount": tx.amount,
    "signature_R8x": F.toString(signature['R8'][0]),
    "signature_R8y": F.toString(signature['R8'][1]),
    "signature_S": signature['S'].toString(),
    "sender_proof": [F.toString(bobHash)],
    "sender_proof_pos": [1],
    "receiver_proof": [F.toString(newAliceHash)],
    "receiver_proof_pos": [0]
}

fs.writeFileSync(
    "./zk_rolluptx_input.json",
    JSON.stringify(inputs,null,2),
    "utf-8"
);