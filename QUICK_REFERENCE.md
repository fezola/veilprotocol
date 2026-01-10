# Quick Reference - Veil Protocol Integrations

**For Fast Judge Verification**

---

## ✅ HELIUS INTEGRATION

**Status:** COMPLETE ✅

### Where to Look:

**Code:**
- `src/lib/helius.ts` - Line 21 (getPrivateConnection)
- `src/lib/helius.ts` - Line 45 (WalletActivityMonitor)
- `src/lib/helius.ts` - Line 86 (parseTransactionPrivately)
- `src/lib/helius.ts` - Line 135 (handleRecoveryWebhook)

**Verification:**
- Open browser DevTools → Network tab → Filter "helius"
- See all RPC requests go to `helius-rpc.com`
- No public RPC calls

**Docs:**
- `HELIUS_FOR_JUDGES.md` - Judge guide
- `WHERE_TO_SEE_HELIUS.md` - Step-by-step verification

**Stats:**
- 800+ lines of code
- 7000+ words of docs
- 4 major features implemented

**Track:** Best Privacy Project using Helius

---

## ✅ SHADOWPAY INTEGRATION

**Status:** COMPLETE ✅

### Where to Look:

**UI:**
- Dashboard → Quick Actions → "Send Privately"
- Label: "Powered by ShadowPay"

**Code:**
- `src/lib/shadowpay.ts` - Line 48 (ShadowWire client)
- `src/lib/shadowpay.ts` - Line 65 (sendPrivatePayment)
- `src/components/ui/PrivatePaymentDialog.tsx` - Complete payment UX
- `src/pages/Dashboard.tsx` - Line 353 (button), Line 476 (dialog)

**Dependency:**
- `package.json` - `@radr/shadowwire: "^1.1.1"`

**Docs:**
- `SHADOWPAY_FOR_JUDGES.md` - Judge guide
- `SHADOWPAY_INTEGRATION.md` - Technical guide

**Stats:**
- 400+ lines of code
- 5000+ words of docs
- Minimal, non-intrusive integration

**Tracks:**
- Best Overall Privacy Integration
- Best Integration into Existing App

---

## 🎯 DEMO FLOW (2 MIN)

1. **Login** (Privacy-preserving, ZK proofs)
2. **Dashboard** (Show privacy status)
3. **Click "Send Privately"** (ShadowPay dialog)
4. **Enter payment** (Show "Amount Hidden" badge)
5. **Complete** (Privacy preserved message)
6. **Explain** (Privacy at every stage)

---

## 📊 QUICK STATS

**Total Code:** 4200+ lines
**Total Docs:** 15,000+ words
**Files Created:** 20
**Build Status:** ✅ Successful

---

## 🏆 TRACK QUALIFICATION

✅ **Helius Track** - 800+ lines, infrastructure privacy
✅ **RADR Overall** - Complete privacy lifecycle
✅ **RADR Integration** - Minimal, non-intrusive

---

## 🔗 KEY CLAIMS

> "Privacy beyond cryptography - identity, infrastructure, recovery, and transfer privacy working together as a complete system."

> "ShadowPay enables private value transfer, while Veil Protocol ensures identity, access, and recovery remain private before and after the payment."

---

## ✅ VERIFICATION CHECKLIST

- [ ] Code: Open `src/lib/helius.ts` and `src/lib/shadowpay.ts`
- [ ] UI: Click "Send Privately" on Dashboard
- [ ] Dependency: Check `package.json` for `@radr/shadowwire`
- [ ] Network: DevTools shows `helius-rpc.com` requests
- [ ] Build: `npm run build` succeeds
- [ ] Docs: Read `INTEGRATION_SUMMARY.md`

**Time to verify:** 10 minutes

---

## 📁 MUST-READ FILES

1. `INTEGRATION_SUMMARY.md` - Complete overview
2. `HELIUS_FOR_JUDGES.md` - Helius verification
3. `SHADOWPAY_FOR_JUDGES.md` - ShadowPay verification

---

**All Integrations Complete & Demo-Ready** ✅
