pragma circom 2.1.6;
include "../../circomlib/circuits/mimc.circom";

template Mimcdemo(){
    //四个输入
    signal input in[4];
    signal output out;

     component hash_array[4];
    for(var i = 0; i < 4; i++){
        hash_array[i] = MultiMiMC7(1,91);
        hash_array[i].in[0] <== in[i];
        hash_array[i].k <== 0;
   }
    
    component h12 = MultiMiMC7(2,91);
    h12.in[0] <==  hash_array[0].out;
    h12.in[1] <== hash_array[1].out;
    h12.k <== 0;
    component h34 = MultiMiMC7(2,91);
    h34.in[0] <== hash_array[2].out;
    h34.in[1] <== hash_array[3].out;
    h34.k <== 0;
    component hash_root = MultiMiMC7(2,91);
    hash_root.in[0] <== h12.out;
    hash_root.in[1] <== h34.out;
    hash_root.k <== 0;
    out <== hash_root.out;
}
component main = Mimcdemo();
