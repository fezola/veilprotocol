pragma circom 2.1.6;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

/*
 * Identity Commitment Circuit
 * 
 * Proves knowledge of (identifier, secret) such that:
 *   commitment = Poseidon(identifier, secret)
 * 
 * Public inputs: commitment, nullifier
 * Private inputs: identifier, secret, nonce
 * 
 * This allows proving identity without revealing the identifier or secret.
 */
template IdentityCommitment() {
    // Private inputs (witness)
    signal input identifier;      // Hash of email/passkey (private)
    signal input secret;          // Random secret (private)
    signal input nonce;           // Nonce for nullifier (private)
    
    // Public inputs
    signal input commitment;      // Public commitment to verify against
    signal input nullifier;       // Public nullifier (prevents replay)
    
    // Compute commitment = Poseidon(identifier, secret)
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== identifier;
    commitmentHasher.inputs[1] <== secret;
    
    // Verify commitment matches
    commitment === commitmentHasher.out;
    
    // Compute nullifier = Poseidon(secret, nonce)
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== secret;
    nullifierHasher.inputs[1] <== nonce;
    
    // Verify nullifier matches
    nullifier === nullifierHasher.out;
}

/*
 * Transaction Proof Circuit
 * 
 * Proves authorization for a transaction without revealing identity.
 * 
 * Public inputs: commitment, actionHash, nullifier
 * Private inputs: identifier, secret, nonce
 */
template TransactionProof() {
    // Private inputs
    signal input identifier;
    signal input secret;
    signal input nonce;
    
    // Public inputs
    signal input commitment;
    signal input actionHash;      // Hash of the action being authorized
    signal input nullifier;
    
    // Verify identity commitment
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== identifier;
    commitmentHasher.inputs[1] <== secret;
    commitment === commitmentHasher.out;
    
    // Compute transaction nullifier = Poseidon(secret, actionHash, nonce)
    component nullifierHasher = Poseidon(3);
    nullifierHasher.inputs[0] <== secret;
    nullifierHasher.inputs[1] <== actionHash;
    nullifierHasher.inputs[2] <== nonce;
    nullifier === nullifierHasher.out;
}

// Main component - Identity Commitment proof
component main {public [commitment, nullifier]} = IdentityCommitment();

