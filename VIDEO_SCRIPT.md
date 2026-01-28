# Veil Protocol - Hackathon Video Script (3 Minutes)

## 🎬 VIDEO STRUCTURE

**Total Time: 3:00**
- Hook & Problem (0:00 - 0:30)
- Solution Overview (0:30 - 1:00)
- Live Demo (1:00 - 2:15)
- Technical Differentiators (2:15 - 2:45)
- Call to Action (2:45 - 3:00)

---

## 📝 SCRIPT

### HOOK & PROBLEM (0:00 - 0:30)
*[Show Solana Explorer with visible transaction amounts]*

> "Every transaction you make on Solana is completely public. Your wallet balance, how much you're staking, how you voted in a DAO — it's all visible to everyone.
>
> This isn't just a privacy issue. It's a security risk. Front-runners can see your trades. Attackers can target high-value wallets. Your financial life is an open book.
>
> **What if you could use Solana with the same privacy you expect from your bank account?**
>
> That's Veil Protocol."

---

### SOLUTION OVERVIEW (0:30 - 1:00)
*[Show Veil Protocol landing page]*

> "Veil Protocol is the **complete privacy infrastructure** for Solana.
>
> We don't just hide one thing — we hide everything that matters:
>
> - **Transaction amounts** — hidden with Pedersen commitments
> - **Wallet balances** — stored in shielded pools
> - **Vote choices** — private until reveal phase
> - **Stake amounts** — hidden from validators and observers
> - **Multisig signers** — no one knows WHO approved a transaction
>
> And we do this by deeply integrating **ShadowWire** for private transfers and **Light Protocol** for ZK compression.
>
> This isn't a proof of concept. It's **production-ready** — deployed on Devnet, published on npm, with 136 tests passing."

---

### LIVE DEMO (1:00 - 2:15)
*[Screen share: Show the demo page]*

> "Let me show you how it works."

**Demo 1: Shielded Pool (1:00 - 1:30)**
*[Click on Shielded Pool demo]*

> "Here's our shielded pool demo. I'll connect my wallet...
>
> Now I'm depositing 1.5 SOL. Watch what happens on-chain.
>
> *[Show transaction]*
>
> See that? The transaction is visible, but the **amount is completely hidden**. On-chain, there's only a cryptographic commitment — not '1.5 SOL'.
>
> I can check my balance — only I can decrypt it — and withdraw privately using a nullifier that prevents double-spending."

**Demo 2: Private Voting (1:30 - 1:50)**
*[Click on Private Voting demo]*

> "Now let's look at private voting.
>
> I'm voting YES on this proposal. But instead of broadcasting my vote, I'm creating a **commitment** — a hash of my vote plus a secret.
>
> During the voting period, no one knows how I voted. No vote buying. No social pressure.
>
> When voting ends, I reveal my vote, and it's counted. The final tally is public, but individual votes stay private."

**Demo 3: Stealth Multisig (1:50 - 2:15)**
*[Click on Stealth Multisig demo]*

> "Finally, stealth multisig.
>
> This is a 2-of-3 multisig. I'm signing a transaction, but here's the key difference:
>
> **No one can see that I signed.** The signature is verified using zero-knowledge proofs. When the threshold is reached, the transaction executes — but the signers remain anonymous.
>
> This is huge for DAOs, treasuries, and any organization that needs privacy."

---

### TECHNICAL DIFFERENTIATORS (2:15 - 2:45)
*[Show architecture diagram or docs page]*

> "What makes Veil Protocol different?
>
> **First**, we're the only project that integrates BOTH ShadowWire AND Light Protocol. ShadowWire gives us private transfers with Bulletproofs. Light Protocol gives us 1000x cheaper state with ZK compression.
>
> **Second**, this is production-ready:
> - Deployed Solana program on Devnet
> - Published SDK on npm — `npm install @veil-protocol/sdk`
> - CLI for scaffolding privacy-first apps
> - 136 tests passing
>
> **Third**, we're not just hiding transactions. We're hiding **everything** — amounts, balances, votes, stakes, signers. A complete privacy stack."

---

### CALL TO ACTION (2:45 - 3:00)
*[Show npm install command and GitHub]*

> "Veil Protocol is ready to use today.
>
> ```
> npm install @veil-protocol/sdk
> ```
>
> Check out our GitHub, try the live demos, and build privacy-first applications on Solana.
>
> **Privacy isn't a feature. It's a right.**
>
> Thank you."

---

## 🎯 KEY TALKING POINTS TO REMEMBER

1. **Problem is real**: Front-running, targeted attacks, surveillance
2. **Complete stack**: Not just one feature — everything hidden
3. **Production-ready**: Deployed, published, tested
4. **Unique integration**: ShadowWire + Light Protocol together
5. **Easy to use**: npm install and go

## 📋 DEMO CHECKLIST

Before recording:
- [ ] Wallet connected with some Devnet SOL
- [ ] Demo page loaded and working
- [ ] Solana Explorer open in another tab
- [ ] Screen recording software ready
- [ ] Microphone tested

## 🎨 VISUAL SUGGESTIONS

- Start with Solana Explorer showing public transactions (the problem)
- Transition to Veil Protocol site (the solution)
- Show live demos with wallet interactions
- End with npm install command and GitHub link

## ⏱️ TIMING GUIDE

| Section | Duration | Cumulative |
|---------|----------|------------|
| Hook & Problem | 30s | 0:30 |
| Solution Overview | 30s | 1:00 |
| Demo: Shielded Pool | 30s | 1:30 |
| Demo: Private Voting | 20s | 1:50 |
| Demo: Stealth Multisig | 25s | 2:15 |
| Technical Differentiators | 30s | 2:45 |
| Call to Action | 15s | 3:00 |

