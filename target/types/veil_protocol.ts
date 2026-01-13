/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/veil_protocol.json`.
 */
export type VeilProtocol = {
  "address": "FaSJXt21yZ2WZKLoQYAV9nkTHqYNduDh95nU1uYGZP87",
  "metadata": {
    "name": "veilProtocol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Privacy-preserving wallet infrastructure for Solana"
  },
  "instructions": [
    {
      "name": "cancelRecovery",
      "docs": [
        "Cancel an active recovery (owner only, before timelock expires)"
      ],
      "discriminator": [
        176,
        23,
        203,
        37,
        121,
        251,
        227,
        83
      ],
      "accounts": [
        {
          "name": "walletAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "wallet_account.owner",
                "account": "walletAccount"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "castVote",
      "docs": [
        "Cast a private vote using a commitment",
        "The actual vote (yes/no) is hidden - only the commitment is stored",
        "commitment = hash(vote_choice || secret || voter_pubkey)"
      ],
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "voteRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "voteCommitment",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "createMultisig",
      "docs": [
        "Create a stealth multisig vault",
        "Signer identities are stored as commitments, not public keys"
      ],
      "discriminator": [
        148,
        146,
        240,
        10,
        226,
        215,
        167,
        174
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  115,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "vaultId"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vaultId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "threshold",
          "type": "u8"
        },
        {
          "name": "signerCommitments",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        }
      ]
    },
    {
      "name": "createMultisigProposal",
      "docs": [
        "Create a proposal for the multisig to execute"
      ],
      "discriminator": [
        130,
        193,
        212,
        170,
        94,
        104,
        32,
        9
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true
        },
        {
          "name": "multisigProposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  115,
                  95,
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "multisig"
              },
              {
                "kind": "arg",
                "path": "proposalId"
              }
            ]
          }
        },
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "proposalId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "instructionHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "createProposal",
      "docs": [
        "Create a new proposal for private voting",
        "Only the proposal ID and metadata hash are stored on-chain"
      ],
      "discriminator": [
        132,
        116,
        68,
        174,
        216,
        160,
        198,
        22
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "proposalId"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "proposalId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "metadataHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "votingEndsAt",
          "type": "i64"
        },
        {
          "name": "revealEndsAt",
          "type": "i64"
        }
      ]
    },
    {
      "name": "executeMultisigProposal",
      "docs": [
        "Execute a multisig proposal after threshold is reached"
      ],
      "discriminator": [
        171,
        4,
        72,
        183,
        80,
        109,
        173,
        27
      ],
      "accounts": [
        {
          "name": "multisig"
        },
        {
          "name": "multisigProposal",
          "writable": true
        },
        {
          "name": "executor",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "executeRecovery",
      "docs": [
        "Execute recovery after timelock has expired",
        "Requires proof of recovery secret ownership"
      ],
      "discriminator": [
        203,
        133,
        133,
        228,
        153,
        121,
        182,
        237
      ],
      "accounts": [
        {
          "name": "walletAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "wallet_account.owner",
                "account": "walletAccount"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "recoveryProof",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "finalizeProposal",
      "docs": [
        "Finalize the proposal after reveal period ends"
      ],
      "discriminator": [
        23,
        68,
        51,
        167,
        109,
        173,
        187,
        164
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeCommitment",
      "docs": [
        "Initialize a new wallet commitment",
        "This stores a privacy-preserving commitment without revealing identity"
      ],
      "discriminator": [
        79,
        227,
        189,
        206,
        151,
        200,
        0,
        214
      ],
      "accounts": [
        {
          "name": "walletAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "commitment",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "initiateRecovery",
      "docs": [
        "Initiate time-locked recovery",
        "This allows wallet recovery after a specified timelock period"
      ],
      "discriminator": [
        132,
        148,
        60,
        74,
        49,
        178,
        235,
        187
      ],
      "accounts": [
        {
          "name": "walletAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "wallet_account.owner",
                "account": "walletAccount"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "recoveryCommitment",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "timelockDays",
          "type": "u8"
        }
      ]
    },
    {
      "name": "revealVote",
      "docs": [
        "Reveal a vote after the voting period ends",
        "Proves the commitment matches the actual vote"
      ],
      "discriminator": [
        100,
        157,
        139,
        17,
        186,
        75,
        185,
        149
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "voteRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voter",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "voteChoice",
          "type": "bool"
        },
        {
          "name": "secret",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "stealthSign",
      "docs": [
        "Sign a multisig proposal with a stealth signature",
        "The signer proves they are an authorized signer without revealing which one"
      ],
      "discriminator": [
        169,
        195,
        111,
        9,
        185,
        113,
        131,
        37
      ],
      "accounts": [
        {
          "name": "multisig"
        },
        {
          "name": "multisigProposal",
          "writable": true
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "signerProof",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "approvalCommitment",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "submitProof",
      "docs": [
        "Submit a zero-knowledge proof for verification",
        "In production, this would verify the actual ZK proof on-chain",
        "For hackathon demo, we accept the proof and emit an event"
      ],
      "discriminator": [
        54,
        241,
        46,
        84,
        4,
        212,
        46,
        94
      ],
      "accounts": [
        {
          "name": "walletAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "wallet_account.owner",
                "account": "walletAccount"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "proofData",
          "type": "bytes"
        },
        {
          "name": "publicSignals",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "multisigProposal",
      "discriminator": [
        13,
        15,
        144,
        55,
        252,
        164,
        83,
        208
      ]
    },
    {
      "name": "proposal",
      "discriminator": [
        26,
        94,
        189,
        187,
        116,
        136,
        53,
        33
      ]
    },
    {
      "name": "stealthMultisig",
      "discriminator": [
        216,
        25,
        107,
        205,
        121,
        247,
        1,
        115
      ]
    },
    {
      "name": "voteRecord",
      "discriminator": [
        112,
        9,
        123,
        165,
        234,
        9,
        157,
        167
      ]
    },
    {
      "name": "walletAccount",
      "discriminator": [
        158,
        98,
        171,
        153,
        212,
        64,
        242,
        213
      ]
    }
  ],
  "events": [
    {
      "name": "commitmentCreated",
      "discriminator": [
        179,
        58,
        10,
        188,
        241,
        19,
        191,
        229
      ]
    },
    {
      "name": "multisigCreated",
      "discriminator": [
        94,
        25,
        238,
        110,
        95,
        40,
        251,
        66
      ]
    },
    {
      "name": "multisigProposalCreated",
      "discriminator": [
        102,
        239,
        228,
        148,
        144,
        88,
        31,
        68
      ]
    },
    {
      "name": "multisigProposalExecuted",
      "discriminator": [
        147,
        235,
        233,
        153,
        115,
        116,
        201,
        197
      ]
    },
    {
      "name": "proofVerified",
      "discriminator": [
        181,
        54,
        148,
        211,
        237,
        73,
        131,
        232
      ]
    },
    {
      "name": "proposalCreated",
      "discriminator": [
        186,
        8,
        160,
        108,
        81,
        13,
        51,
        206
      ]
    },
    {
      "name": "proposalFinalized",
      "discriminator": [
        159,
        104,
        210,
        220,
        86,
        209,
        61,
        51
      ]
    },
    {
      "name": "recoveryCancelled",
      "discriminator": [
        191,
        25,
        236,
        86,
        25,
        77,
        117,
        96
      ]
    },
    {
      "name": "recoveryExecuted",
      "discriminator": [
        161,
        218,
        6,
        191,
        85,
        217,
        12,
        144
      ]
    },
    {
      "name": "recoveryInitiated",
      "discriminator": [
        138,
        165,
        92,
        207,
        123,
        93,
        223,
        98
      ]
    },
    {
      "name": "stealthSignatureAdded",
      "discriminator": [
        170,
        123,
        128,
        98,
        110,
        4,
        141,
        143
      ]
    },
    {
      "name": "voteCast",
      "discriminator": [
        39,
        53,
        195,
        104,
        188,
        17,
        225,
        213
      ]
    },
    {
      "name": "voteRevealed",
      "discriminator": [
        104,
        162,
        140,
        194,
        213,
        217,
        117,
        179
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidProof",
      "msg": "Invalid proof provided"
    },
    {
      "code": 6001,
      "name": "recoveryAlreadyActive",
      "msg": "Recovery is already active"
    },
    {
      "code": 6002,
      "name": "noActiveRecovery",
      "msg": "No active recovery to execute or cancel"
    },
    {
      "code": 6003,
      "name": "timelockNotExpired",
      "msg": "Timelock period has not expired yet"
    },
    {
      "code": 6004,
      "name": "invalidTimelockPeriod",
      "msg": "Invalid timelock period (must be 1-90 days)"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Unauthorized: only owner can perform this action"
    },
    {
      "code": 6006,
      "name": "invalidVotingPeriod",
      "msg": "Invalid voting period"
    },
    {
      "code": 6007,
      "name": "invalidRevealPeriod",
      "msg": "Invalid reveal period"
    },
    {
      "code": 6008,
      "name": "votingEnded",
      "msg": "Voting period has ended"
    },
    {
      "code": 6009,
      "name": "alreadyVoted",
      "msg": "Already voted on this proposal"
    },
    {
      "code": 6010,
      "name": "votingNotEnded",
      "msg": "Voting period has not ended yet"
    },
    {
      "code": 6011,
      "name": "revealEnded",
      "msg": "Reveal period has ended"
    },
    {
      "code": 6012,
      "name": "notVoted",
      "msg": "Not voted on this proposal"
    },
    {
      "code": 6013,
      "name": "alreadyRevealed",
      "msg": "Already revealed vote"
    },
    {
      "code": 6014,
      "name": "invalidVoteReveal",
      "msg": "Invalid vote reveal - commitment mismatch"
    },
    {
      "code": 6015,
      "name": "revealNotEnded",
      "msg": "Reveal period has not ended yet"
    },
    {
      "code": 6016,
      "name": "alreadyFinalized",
      "msg": "Proposal already finalized"
    },
    {
      "code": 6017,
      "name": "invalidThreshold",
      "msg": "Invalid threshold"
    },
    {
      "code": 6018,
      "name": "tooManySigners",
      "msg": "Too many signers (max 10)"
    },
    {
      "code": 6019,
      "name": "proposalAlreadyExecuted",
      "msg": "Proposal already executed"
    },
    {
      "code": 6020,
      "name": "thresholdReached",
      "msg": "Threshold already reached"
    },
    {
      "code": 6021,
      "name": "invalidSignerProof",
      "msg": "Invalid signer proof"
    },
    {
      "code": 6022,
      "name": "duplicateApproval",
      "msg": "Duplicate approval"
    },
    {
      "code": 6023,
      "name": "insufficientApprovals",
      "msg": "Insufficient approvals to execute"
    }
  ],
  "types": [
    {
      "name": "commitmentCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "commitment",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "multisigCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multisig",
            "type": "pubkey"
          },
          {
            "name": "vaultId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "threshold",
            "type": "u8"
          },
          {
            "name": "totalSigners",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "multisigProposal",
      "docs": [
        "Multisig proposal with stealth signatures"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multisig",
            "docs": [
              "The multisig this proposal belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "proposalId",
            "docs": [
              "Unique proposal identifier"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "instructionHash",
            "docs": [
              "Hash of the instruction to execute"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "When the proposal was created"
            ],
            "type": "i64"
          },
          {
            "name": "approvalCount",
            "docs": [
              "Number of approvals received"
            ],
            "type": "u8"
          },
          {
            "name": "approvalCommitments",
            "docs": [
              "Approval commitments (proves approval without revealing signer)"
            ],
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    32
                  ]
                },
                10
              ]
            }
          },
          {
            "name": "isExecuted",
            "docs": [
              "Whether the proposal has been executed"
            ],
            "type": "bool"
          },
          {
            "name": "executedAt",
            "docs": [
              "When the proposal was executed"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "multisigProposalCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multisig",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "proposalId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "instructionHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "multisigProposalExecuted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multisig",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "approvalCount",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "proofVerified",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "proofHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "proposal",
      "docs": [
        "Private Voting Proposal - commit-reveal scheme"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposalId",
            "docs": [
              "Unique proposal identifier"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "creator",
            "docs": [
              "Creator of the proposal"
            ],
            "type": "pubkey"
          },
          {
            "name": "metadataHash",
            "docs": [
              "Hash of proposal metadata (title, description stored off-chain)"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "When the proposal was created"
            ],
            "type": "i64"
          },
          {
            "name": "votingEndsAt",
            "docs": [
              "When voting ends (commit phase)"
            ],
            "type": "i64"
          },
          {
            "name": "revealEndsAt",
            "docs": [
              "When reveal phase ends"
            ],
            "type": "i64"
          },
          {
            "name": "yesCount",
            "docs": [
              "Number of YES votes (after reveal)"
            ],
            "type": "u32"
          },
          {
            "name": "noCount",
            "docs": [
              "Number of NO votes (after reveal)"
            ],
            "type": "u32"
          },
          {
            "name": "totalCommitments",
            "docs": [
              "Total vote commitments received"
            ],
            "type": "u32"
          },
          {
            "name": "totalRevealed",
            "docs": [
              "Total votes revealed"
            ],
            "type": "u32"
          },
          {
            "name": "isFinalized",
            "docs": [
              "Whether the proposal has been finalized"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proposalCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "proposalId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "votingEndsAt",
            "type": "i64"
          },
          {
            "name": "revealEndsAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "proposalFinalized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "yesCount",
            "type": "u32"
          },
          {
            "name": "noCount",
            "type": "u32"
          },
          {
            "name": "totalVotes",
            "type": "u32"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "recoveryCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "recoveryExecuted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "recoveryInitiated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "recoveryCommitment",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "unlockTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "stealthMultisig",
      "docs": [
        "Stealth Multisig Vault - signers stored as commitments"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultId",
            "docs": [
              "Unique vault identifier"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "creator",
            "docs": [
              "Creator of the multisig"
            ],
            "type": "pubkey"
          },
          {
            "name": "threshold",
            "docs": [
              "Number of signatures required"
            ],
            "type": "u8"
          },
          {
            "name": "totalSigners",
            "docs": [
              "Total number of signers"
            ],
            "type": "u8"
          },
          {
            "name": "signerCommitments",
            "docs": [
              "Signer commitments (not public keys!)",
              "Each commitment = hash(signer_secret || signer_pubkey)"
            ],
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    32
                  ]
                },
                10
              ]
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "When the multisig was created"
            ],
            "type": "i64"
          },
          {
            "name": "proposalCount",
            "docs": [
              "Number of proposals created"
            ],
            "type": "u32"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "stealthSignatureAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "approvalCommitment",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "currentApprovals",
            "type": "u8"
          },
          {
            "name": "threshold",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "voteCast",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "commitment",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "docs": [
        "Individual vote record for commit-reveal"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "docs": [
              "The proposal this vote is for"
            ],
            "type": "pubkey"
          },
          {
            "name": "voter",
            "docs": [
              "The voter (for PDA derivation)"
            ],
            "type": "pubkey"
          },
          {
            "name": "commitment",
            "docs": [
              "Vote commitment: hash(vote_choice || secret || voter)"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "hasVoted",
            "docs": [
              "Whether a vote has been cast"
            ],
            "type": "bool"
          },
          {
            "name": "hasRevealed",
            "docs": [
              "Whether the vote has been revealed"
            ],
            "type": "bool"
          },
          {
            "name": "revealedChoice",
            "docs": [
              "The revealed choice (only valid if has_revealed)"
            ],
            "type": "bool"
          },
          {
            "name": "votedAt",
            "docs": [
              "When the vote was cast"
            ],
            "type": "i64"
          },
          {
            "name": "revealedAt",
            "docs": [
              "When the vote was revealed"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "voteRevealed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "walletAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commitment",
            "docs": [
              "The privacy-preserving commitment (never reveals identity)"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "owner",
            "docs": [
              "The wallet owner (can cancel recovery)"
            ],
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "docs": [
              "When this wallet was created"
            ],
            "type": "i64"
          },
          {
            "name": "recoveryCommitment",
            "docs": [
              "Recovery commitment (for time-locked recovery)"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "recoveryActive",
            "docs": [
              "Whether recovery is currently active"
            ],
            "type": "bool"
          },
          {
            "name": "recoveryInitiatedAt",
            "docs": [
              "When recovery was initiated"
            ],
            "type": "i64"
          },
          {
            "name": "recoveryUnlockAt",
            "docs": [
              "When recovery can be executed"
            ],
            "type": "i64"
          },
          {
            "name": "recoveryExecutedAt",
            "docs": [
              "When recovery was executed (if applicable)"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
