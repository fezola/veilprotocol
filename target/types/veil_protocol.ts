/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/veil_protocol.json`.
 */
export type VeilProtocol = {
  "address": "5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h",
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
