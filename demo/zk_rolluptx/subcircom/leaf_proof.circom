pragma circom  2.1.6;
include "./gmr.circom";

// checks for existence of leaf in tree of depth k

template LeafExistence(k,l){
// k is depth of tree
    signal input preimage[l]; 
    signal input root;
    signal input paths2_root[k];
    signal input paths2_root_pos[k];
    
    component hash_leaf = MultiMiMC7(l,91);
    hash_leaf.k <== 0;
    for (var i = 0; i < l; i++){
        hash_leaf.in[i] <== preimage[i];
    }

    component computed_root = GetMerkleRoot(k);
    computed_root.hash_leaf <== hash_leaf.out;

    for (var i = 0; i < k; i++){
        computed_root.paths2_root[i] <== paths2_root[i];
        computed_root.paths2_root_pos[i] <== paths2_root_pos[i];
    }
    // equality constraint: input tx root === computed tx root
    root === computed_root.out;
}

//component main{public[root]} = LeafExistence(2,1);