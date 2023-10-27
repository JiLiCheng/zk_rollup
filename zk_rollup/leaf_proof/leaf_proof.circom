pragma circom  2.1.6;
include "./gmr.circom";

// checks for existence of leaf in tree of depth k

template LeafExistence(k){
// k is depth of tree

    signal input hash_leaf;
    signal input root;
    signal input paths2_root[k];
    signal input paths2_root_pos[k];
   

    component computed_root = GetMerkleRoot(k);
    computed_root.hash_leaf <== hash_leaf;

    for (var i = 0; i < k; i++){
        computed_root.paths2_root[i] <== paths2_root[i];
        computed_root.paths2_root_pos[i] <== paths2_root_pos[i];
    }
    // equality constraint: input tx root === computed tx root
    root === computed_root.out;
}

//component main{public[root]} = LeafExistence(2);