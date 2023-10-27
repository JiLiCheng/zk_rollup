pragma circom  2.1.6;
include "./subcircom/leaf_proof.circom";
include "./subcircom/eddsa.circom";
include "./subcircom/gmr.circom";
include "../../circomlib/circuits/mimc.circom";

template ProcessTx(k){
    // k is depth of accounts tree

    // accounts tree info
    signal input accounts_root;
    signal input intermediate_root;
    signal input accounts_pubkeys[2**k][2];
    signal input accounts_balances[2**k];

    // transactions info
    signal input sender_pubkey[2];
    signal input sender_balance;
    signal input receiver_pubkey[2];
    signal input receiver_balance;
    signal input amount;
    signal input signature_R8x;
    signal input signature_R8y;
    signal input signature_S;
    signal input sender_proof[k];
    signal input sender_proof_pos[k];
    signal input receiver_proof[k];
    signal input receiver_proof_pos[k];

    // output
    signal output new_accounts_root;

    // verify sender account exists in accounts_root
    component senderExistence = LeafExistence(k, 3);
    senderExistence.preimage[0] <== sender_pubkey[0];
    senderExistence.preimage[1] <== sender_pubkey[1];
    senderExistence.preimage[2] <== sender_balance;
    senderExistence.root <== accounts_root;
    for (var i = 0; i < k; i++){
        senderExistence.paths2_root_pos[i] <== sender_proof_pos[i];
        senderExistence.paths2_root[i] <== sender_proof[i];
    }

    // check that transaction was signed by sender
    component signatureCheck = VerifyEdDSAMiMC(5);
    signatureCheck.from_x <== sender_pubkey[0];
    signatureCheck.from_y <== sender_pubkey[1];
    signatureCheck.R8x <== signature_R8x;
    signatureCheck.R8y <== signature_R8y;
    signatureCheck.S <== signature_S;
    signatureCheck.preimage[0] <== sender_pubkey[0];
    signatureCheck.preimage[1] <== sender_pubkey[1];
    signatureCheck.preimage[2] <== receiver_pubkey[0];
    signatureCheck.preimage[3] <== receiver_pubkey[1];
    signatureCheck.preimage[4] <== amount;

    // debit sender account and hash new sender leaf
    component newSenderLeaf = MultiMiMC7(3,91);
    newSenderLeaf.in[0] <== sender_pubkey[0];
    newSenderLeaf.in[1] <== sender_pubkey[1];
    newSenderLeaf.in[2] <== sender_balance - amount;
    newSenderLeaf.k <== 0;
    

    // update accounts_root
    component computed_intermediate_root = GetMerkleRoot(k);
    computed_intermediate_root.hash_leaf <== newSenderLeaf.out;
    for (var i = 0; i < k; i++){
        computed_intermediate_root.paths2_root_pos[i] <== sender_proof_pos[i];
        computed_intermediate_root.paths2_root[i] <== sender_proof[i];
    }

    // check that computed_intermediate_root.out === intermediate_root
    computed_intermediate_root.out === intermediate_root;

    // verify receiver account exists in intermediate_root
    component receiverExistence = LeafExistence(k, 3);
    receiverExistence.preimage[0] <== receiver_pubkey[0];
    receiverExistence.preimage[1] <== receiver_pubkey[1];
    receiverExistence.preimage[2] <== receiver_balance;
    receiverExistence.root <== intermediate_root;
    for (var i = 0; i < k; i++){
        receiverExistence.paths2_root_pos[i] <== receiver_proof_pos[i];
        receiverExistence.paths2_root[i] <== receiver_proof[i];
    }

    // credit receiver account and hash new receiver leaf
    component newReceiverLeaf = MultiMiMC7(3,91);
    newReceiverLeaf.in[0] <== receiver_pubkey[0];
    newReceiverLeaf.in[1] <== receiver_pubkey[1];
    newReceiverLeaf.in[2] <== receiver_balance + amount;
    newReceiverLeaf.k <== 0;
    

    // update accounts_root
    component computed_final_root = GetMerkleRoot(k);
    computed_final_root.hash_leaf <== newReceiverLeaf.out;
    for (var i = 0; i < k; i++){
        computed_final_root.paths2_root_pos[i] <== receiver_proof_pos[i];
        computed_final_root.paths2_root[i] <== receiver_proof[i];
    }

    // output final accounts_root
    new_accounts_root <== computed_final_root.out;
}

component main{public[accounts_root]} = ProcessTx(1);