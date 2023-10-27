pragma circom 2.1.6;
include "../../circomlib/circuits/mimc.circom";

template GetMerkleRoot(k){
    signal input hash_leaf;
    signal input paths2_root[k];
    signal input paths2_root_pos[k];
    signal output out;

    component merkle_root[k];
    merkle_root[0] = MultiMiMC7(2,91);
    // paths2_root_pos is a binary vector representing left or right node

    merkle_root[0].in[0] <==  paths2_root[0] - paths2_root_pos[0]* (paths2_root[0] - hash_leaf);
    merkle_root[0].in[1] <==  hash_leaf - paths2_root_pos[0]* (hash_leaf - paths2_root[0]);
    merkle_root[0].k <== 0;
  //  out[0] <== merkle_root[0].out;

    for (var v = 1; v < k; v++){
        merkle_root[v] = MultiMiMC7(2,91);
        merkle_root[v].in[0] <== paths2_root[v] - paths2_root_pos[v]* (paths2_root[v] - merkle_root[v-1].out);
        merkle_root[v].in[1] <== merkle_root[v-1].out- paths2_root_pos[v]*(merkle_root[v-1].out-paths2_root[v]);
        merkle_root[v].k <== 0;
    }
     out<== merkle_root[k-1].out;
}
component main = GetMerkleRoot(2);