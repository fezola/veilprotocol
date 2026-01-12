import { defineVeilConfig } from "veil-core";

export default defineVeilConfig({
  project: {
    name: "test-app",
    network: "devnet",
  },

  privacy: {
    identity: {
      enabled: true,
      method: "zk-login", // conceptual, hackathon-safe
      storeOnChain: false,
    },

    access: {
      proofRequired: true,
      revealAddress: false,
    },

    recovery: {
      enabled: true,
      method: "timelock", // or "shamir"
      publicGuardians: false,
      revealParticipants: false,
    },
  },

  infrastructure: {
    rpc: {
      provider: "default",
      publicPolling: false,
    },

    observability: {
      webhooks: false,
      exposeMetadata: false,
    },
  },

  integrations: {
    shadowPay: {
      enabled: false,
    },
  },
});
