# Demo Instructions - For Hackathon Judges

**Updated:** January 10, 2026

---

## 🎯 CRITICAL FIXES IMPLEMENTED

### Issue 1: Timelock Recovery Login ✅ FIXED
**Problem:** After successful recovery, users were not automatically logged in
**Solution:** Added auto-redirect to dashboard when authenticated (e.g., after recovery)

### Issue 2: ShadowPay Demo Visibility ✅ FIXED
**Problem:** Demo requires wallet connection, not accessible to judges
**Solution:** Added **Demo Mode** - full ShadowPay flow without wallet connection

---

## 🚀 QUICK DEMO (3 MINUTES)

### Step 1: Login (30 seconds)
1. Navigate to [http://localhost:8081](http://localhost:8081)
2. Click "Email-Based Login"
3. Enter any email (e.g., judge@hackathon.com)
4. Watch ZK proof generation
5. Redirected to Dashboard

### Step 2: ShadowPay Demo (90 seconds)
**IMPORTANT:** You can now demo ShadowPay **without connecting a wallet**

1. On Dashboard, look for the **large green card** titled "Private Transfers"
2. Click the big green button: **"Try Private Payment (Demo)"**
3. Dialog opens with privacy notice
4. **Click "Try Demo Mode"** (no wallet required!)
5. Enter any recipient address (e.g., `5Ey8m...x7Kp`)
6. Enter amount (e.g., `0.5`)
7. Click "Review Payment"
8. See confirmation screen with "Amount Hidden" badge
9. Click "Confirm"
10. Watch ShadowPay processing simulation
11. See success screen with privacy guarantees

### Step 3: Recovery Flow (Optional - 60 seconds)
1. Navigate to Recovery Setup
2. Generate recovery key
3. Navigate to Recovery Execute
4. Test timelock recovery
5. **Auto-redirected to Dashboard** after success ✅

---

## 📍 WHERE TO SEE SHADOWPAY

### Dashboard Location:
The ShadowPay integration is **HIGHLY VISIBLE** on the dashboard:

**Large Showcase Card** (Left Column):
- Location: Between "What's Hidden" and "What's Public"
- Features:
  - Green accent border (`border-2 border-success/20`)
  - "NEW" badge
  - "Powered by ShadowPay" label
  - 3 visual privacy guarantee cards
  - Big green call-to-action button
  - Privacy stack explanation

**Quick Actions** (Right Sidebar):
- "Send Privately" button
- "Powered by ShadowPay" subtitle

---

## 🎬 DEMO MODE FEATURES

### What Demo Mode Does:
✅ **No wallet connection required**
✅ **Full payment flow simulation**
✅ **Real UI/UX demonstration**
✅ **2-second processing delay** (realistic)
✅ **Success screen with privacy guarantees**
✅ **Clear "Demo Mode" badges**

### Demo Mode Indicators:
- "Demo Mode Available" prompt when wallet not connected
- "Demo Mode Active" badge during flow
- "This was a simulated demo" message on success
- "Demo" label on privacy guarantees

---

## 🔐 PRIVACY STACK DEMO

### What Judges See:

**1. Identity Privacy (Login)**
- ZK proofs verify without revealing identity
- Email never collected (only commitment)
- Deterministic wallet derivation

**2. Infrastructure Privacy (Helius)**
- All RPC calls via private endpoint
- No public polling
- Privacy-aware transaction parsing

**3. Recovery Privacy (Shamir)**
- No guardian lists on-chain
- Timelock protection
- ZK-based recovery initiation

**4. Transfer Privacy (ShadowPay)** ← NEW & HIGHLY VISIBLE
- Amount hiding on-chain
- No wallet linkage
- Identity safe during transfers
- **Demo mode for easy testing**

---

## ✅ VERIFICATION CHECKLIST

### ShadowPay Integration (2 minutes):

1. [ ] Open dashboard
2. [ ] See large green "Private Transfers" card
3. [ ] See "NEW" badge and "Powered by ShadowPay" label
4. [ ] Click "Try Private Payment (Demo)" button
5. [ ] Click "Try Demo Mode" (no wallet needed)
6. [ ] Enter test payment details
7. [ ] See "Amount Hidden" badge on confirmation
8. [ ] Complete demo flow
9. [ ] See success screen with privacy guarantees

### Recovery Login Flow (2 minutes):

1. [ ] Navigate to Recovery Setup
2. [ ] Generate recovery key
3. [ ] Navigate to Recovery Execute
4. [ ] Enter recovery key
5. [ ] Watch timelock simulation
6. [ ] **Automatically redirected to Dashboard** ✅
7. [ ] Session active (no re-login required)

---

## 🏆 HACKATHON QUALIFICATION

### Primary Tracks:

**1. Best Privacy Project using Helius** ✅
- 800+ lines of Helius integration
- Infrastructure-level privacy
- Private RPC, webhooks, monitoring

**2. Best Overall Privacy Integration (RADR)** ✅
- Complete privacy lifecycle
- Identity + Infrastructure + Recovery + Transfer
- Privacy at EVERY stage

**3. Best Integration into Existing App (RADR)** ✅
- Minimal, non-intrusive (one card, one dialog)
- Preserves all existing guarantees
- Demo mode for easy testing
- Feels like a feature, not standalone app

---

## 📊 WHAT CHANGED

### Recovery Login Fix:
**Before:** After recovery, user sent back to login page
**After:** After recovery, user auto-redirected to dashboard ✅

**Files Modified:**
- [src/pages/Login.tsx](src/pages/Login.tsx#L24-L29) - Added auto-redirect on authentication
- Added `useEffect` to check `isAuthenticated` state
- Uses `navigate("/dashboard", { replace: true })`

### ShadowPay Demo Mode:
**Before:** Required wallet connection to see demo
**After:** Full demo mode without wallet ✅

**Files Modified:**
- [src/components/ui/PrivatePaymentDialog.tsx](src/components/ui/PrivatePaymentDialog.tsx) - Added demo mode
- `demoMode` state for wallet-less testing
- "Try Demo Mode" button when wallet not connected
- Simulated payment with 2-second delay
- Clear demo mode indicators throughout flow

---

## 🎯 KEY CLAIMS FOR JUDGES

### Complete Privacy System:
> "Privacy beyond cryptography - identity, infrastructure, recovery, and transfer privacy working together as a complete system."

### ShadowPay Integration:
> "ShadowPay enables private value transfer within our privacy-preserving account lifecycle, ensuring no identity leakage from login to payment."

### Minimal Integration:
> "One prominent showcase card, one dialog, demo mode for testing - minimal, deliberate, non-intrusive."

---

## 🔗 FILE REFERENCES

### ShadowPay Integration:
- [src/lib/shadowpay.ts](src/lib/shadowpay.ts) - Core integration (100+ lines)
- [src/components/ui/PrivatePaymentDialog.tsx](src/components/ui/PrivatePaymentDialog.tsx) - Payment UI (350+ lines with demo mode)
- [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx#L140-L208) - Large showcase card
- [package.json](package.json#L44) - `@radr/shadowwire` dependency

### Recovery Fix:
- [src/pages/Login.tsx](src/pages/Login.tsx#L1) - Auto-redirect logic
- [src/pages/RecoveryExecute.tsx](src/pages/RecoveryExecute.tsx#L75) - Recovery success flow

### Documentation:
- [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) - Complete overview
- [SHADOWPAY_FOR_JUDGES.md](SHADOWPAY_FOR_JUDGES.md) - Judge guide
- [WHAT_JUDGES_SEE.md](WHAT_JUDGES_SEE.md) - Visual guide
- **DEMO_INSTRUCTIONS.md** - This file

---

## 🎉 READY FOR JUDGING

**Status:** All fixes implemented & tested ✅

**Build:** Successful (37.27s)

**Features:**
- ✅ Recovery login auto-redirect
- ✅ ShadowPay demo mode (no wallet required)
- ✅ Large visible showcase card
- ✅ Complete privacy stack
- ✅ Comprehensive documentation

**Demo Time:** 3 minutes (including recovery)

**Verification Time:** 5 minutes

---

**All Integrations Complete & Demo-Ready for Hackathon** ✅🎉
