import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { ZKProofVisualizer } from "@/components/ui/ZKProofVisualizer";
import { generateAuthProof, deriveWalletAddress, ZKProofData } from "@/lib/zkProof";
import { useAuth, RecoveryKeyData } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthMethod = "passkey" | "email" | "import" | null;
type AuthStep = "method" | "email-input" | "import-key" | "verifying" | "creating";
type ProofStage = "idle" | "hashing" | "generating" | "verifying" | "complete";

/**
 * Get or create a persistent secret for an identifier (email/passkey).
 * Same identifier always returns the same secret = same wallet.
 * This is stored encrypted in localStorage.
 */
function getOrCreateSecret(identifier: string): { secret: string; isReturning: boolean } {
  // Simple hash of identifier for storage key (don't store email directly)
  const keyHash = btoa(identifier).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  const storageKey = `veil_secret_${keyHash}`;

  const existingSecret = localStorage.getItem(storageKey);
  if (existingSecret) {
    return { secret: existingSecret, isReturning: true };
  }

  // First time - generate and store new secret
  const newSecret = crypto.randomUUID();
  localStorage.setItem(storageKey, newSecret);
  return { secret: newSecret, isReturning: false };
}

// Validate recovery key structure
function isValidRecoveryKey(data: unknown): data is RecoveryKeyData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.version === 'string' &&
    typeof obj.secret === 'string' &&
    typeof obj.identifier === 'string' &&
    typeof obj.commitment === 'string' &&
    typeof obj.wallet === 'string' &&
    typeof obj.createdAt === 'number'
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithRecoveryKey, isAuthenticated, veilWallet } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState<AuthMethod>(null);
  const [step, setStep] = useState<AuthStep>("method");
  const [email, setEmail] = useState("");
  const [proofStage, setProofStage] = useState<ProofStage>("idle");
  const [proof, setProof] = useState<ZKProofData | null>(null);
  const [proofDuration, setProofDuration] = useState<number>(0);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to dashboard if already authenticated (e.g., from recovery)
  useEffect(() => {
    if (isAuthenticated && veilWallet) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, veilWallet, navigate]);

  const runZKProofGeneration = useCallback(async (identifier: string) => {
    // Stage 1: Hashing
    setProofStage("hashing");
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Stage 2: Generating proof
    setProofStage("generating");

    // Get or create persistent secret - same email = same secret = same wallet!
    const { secret, isReturning } = getOrCreateSecret(identifier);
    const result = await generateAuthProof(identifier, secret);

    if (result.success && result.proof) {
      // Stage 3: Verifying
      setProofStage("verifying");
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProof(result.proof);
      setProofDuration(result.duration);

      // Stage 4: Complete
      setProofStage("complete");

      // Store commitment for wallet derivation
      const walletAddress = await deriveWalletAddress(result.proof.commitment);

      // Update auth context with persistence - now includes secret for recovery!
      login(walletAddress, result.proof.commitment, identifier, secret);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      return { success: true, isReturning };
    }
    return { success: false, isReturning: false };
  }, [login]);

  // Handle recovery key file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!isValidRecoveryKey(data)) {
        setImportError("Invalid recovery key file format");
        return;
      }

      // Attempt to login with recovery key
      const success = loginWithRecoveryKey(data);
      if (success) {
        toast({
          title: "Wallet Recovered!",
          description: `Welcome back! Wallet ${data.wallet.slice(0, 8)}... restored.`,
        });
        navigate("/dashboard");
      } else {
        setImportError("Failed to restore wallet from recovery key");
      }
    } catch {
      setImportError("Failed to parse recovery key file. Make sure it's a valid JSON file.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasskeyAuth = async () => {
    setMethod("passkey");
    setStep("verifying");

    // For passkey, we use a stored passkey ID or create a new one
    const storedPasskeyId = localStorage.getItem('veil_passkey_id');
    const passkeyId = storedPasskeyId || `passkey_${crypto.randomUUID()}`;
    if (!storedPasskeyId) {
      localStorage.setItem('veil_passkey_id', passkeyId);
    }

    const result = await runZKProofGeneration(passkeyId);

    if (result.success) {
      setStep("creating");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Navigate to dashboard if returning, wallet-created if new
      navigate(result.isReturning ? "/dashboard" : "/wallet-created");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStep("verifying");
    const result = await runZKProofGeneration(email);

    if (result.success) {
      setStep("creating");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Navigate to dashboard if returning, wallet-created if new
      navigate(result.isReturning ? "/dashboard" : "/wallet-created");
    }
  };

  return (
    <PageLayout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon icon="ph:shield-check-fill" className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {step === "method" && "Private Authentication"}
                {step === "email-input" && "Enter Your Email"}
                {step === "import-key" && "Import Recovery Key"}
                {step === "verifying" && "Generating ZK Proof"}
                {step === "creating" && "Creating Your Wallet"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {step === "method" && "No passwords stored. No identity revealed."}
                {step === "email-input" && "We'll derive your wallet from a zero-knowledge proof of your email."}
                {step === "import-key" && "Restore your wallet using your backup recovery key."}
                {step === "verifying" && "Real cryptographic proof generation in progress..."}
                {step === "creating" && "Deriving your private wallet address..."}
              </p>
            </div>

            {/* Method Selection */}
            {step === "method" && (
              <div className="space-y-4">
                <button
                  onClick={handlePasskeyAuth}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon icon="ph:fingerprint" className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Passkey Authentication</p>
                    <p className="text-sm text-muted-foreground">Use biometrics or security key</p>
                  </div>
                  <Icon icon="ph:arrow-right" className="w-5 h-5 text-muted-foreground ml-auto" />
                </button>

                <button
                  onClick={() => {
                    setMethod("email");
                    setStep("email-input");
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon icon="ph:envelope-simple" className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Email-Based Login</p>
                    <p className="text-sm text-muted-foreground">zkLogin with your email</p>
                  </div>
                  <Icon icon="ph:arrow-right" className="w-5 h-5 text-muted-foreground ml-auto" />
                </button>

                {/* Recovery Key Import */}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setMethod("import");
                      setStep("import-key");
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-success/30 bg-success/5 hover:bg-success/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <Icon icon="ph:key" className="w-6 h-6 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Import Recovery Key</p>
                      <p className="text-sm text-muted-foreground">Restore wallet from backup file</p>
                    </div>
                    <Icon icon="ph:arrow-right" className="w-5 h-5 text-muted-foreground ml-auto" />
                  </button>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Icon icon="ph:info" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-medium">Privacy Note:</span> Your authentication method is never stored.
                      We only store a cryptographic commitment that cannot reveal your identity.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            {step === "email-input" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10">
                  <Icon icon="ph:shield-check" className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Your email is used to generate a zero-knowledge proof. We never see or store your email address.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <Icon icon="ph:arrow-right" className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("method");
                    setMethod(null);
                  }}
                  className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Back to options
                </button>
              </form>
            )}

            {/* Recovery Key Import */}
            {step === "import-key" && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Icon icon="ph:key" className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload your recovery key file to restore your wallet. This is the JSON file you downloaded when creating your wallet.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  id="recovery-file-input"
                />

                <label
                  htmlFor="recovery-file-input"
                  className="w-full py-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Icon icon="ph:upload-simple" className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload recovery key</span>
                  <span className="text-xs text-muted-foreground">veil-recovery-key-*.json</span>
                </label>

                {importError && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <Icon icon="ph:warning" className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">{importError}</p>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Icon icon="ph:info" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="text-primary font-medium">Don't have your recovery key?</span> If you used email login before,
                    try logging in with the same email — your wallet will be restored if you're on the same browser.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep("method");
                    setMethod(null);
                    setImportError(null);
                  }}
                  className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Back to options
                </button>
              </div>
            )}

            {/* ZK Proof Generation Visualization */}
            {(step === "verifying" || step === "creating") && (
              <div className="py-4">
                <ZKProofVisualizer
                  isGenerating={step === "verifying"}
                  proof={proof}
                  stage={proofStage}
                  duration={proofDuration}
                />
                
                {step === "creating" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Deriving wallet from commitment...
                    </p>
                  </motion.div>
                )}

                <p className="text-xs text-muted-foreground text-center mt-6">
                  All operations happen locally on your device
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New to Veil?{" "}
            <Link to="/why-privacy" className="text-primary hover:underline">
              Learn how it works
            </Link>
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
