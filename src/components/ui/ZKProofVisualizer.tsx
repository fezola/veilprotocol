import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { ZKProofData } from "@/lib/zkProof";

interface ZKProofVisualizerProps {
  isGenerating: boolean;
  proof?: ZKProofData | null;
  stage?: "idle" | "hashing" | "generating" | "verifying" | "complete";
  duration?: number;
}

export function ZKProofVisualizer({
  isGenerating,
  proof,
  stage = "idle",
  duration,
}: ZKProofVisualizerProps) {
  const stages = [
    { key: "hashing", label: "Hashing inputs", icon: "ph:hash" },
    { key: "generating", label: "Generating proof", icon: "ph:cpu" },
    { key: "verifying", label: "Verifying", icon: "ph:shield-check" },
    { key: "complete", label: "Complete", icon: "ph:check-circle" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="space-y-4">
      {/* Stage Indicators */}
      <div className="flex items-center justify-between">
        {stages.map((s, index) => (
          <div key={s.key} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: stage === s.key ? 1.1 : 1,
                backgroundColor:
                  index < currentStageIndex
                    ? "hsl(var(--success))"
                    : index === currentStageIndex && stage !== "idle"
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted))",
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
            >
              <Icon
                icon={
                  index < currentStageIndex ? "ph:check" : s.icon
                }
                className={`w-4 h-4 ${
                  index <= currentStageIndex ? "text-background" : "text-muted-foreground"
                } ${stage === s.key && isGenerating ? "animate-pulse" : ""}`}
              />
            </motion.div>
            {index < stages.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: index < currentStageIndex ? 1 : 0,
                  backgroundColor: "hsl(var(--success))",
                }}
                className="h-0.5 w-8 md:w-12 origin-left"
                style={{ backgroundColor: "hsl(var(--muted))" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Stage Label */}
      <AnimatePresence mode="wait">
        {isGenerating && (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-sm font-medium text-primary">
              {stages.find((s) => s.key === stage)?.label || "Preparing..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof Data Display */}
      <AnimatePresence>
        {proof && stage === "complete" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="bg-secondary rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Protocol</span>
                <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {proof.proof.protocol.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Curve</span>
                <span className="font-mono text-xs">{proof.proof.curve}</span>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Commitment</p>
                <p className="font-mono text-xs break-all text-primary/80">
                  0x{proof.commitment.slice(0, 32)}...
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Nullifier</p>
                <p className="font-mono text-xs break-all text-muted-foreground">
                  0x{proof.nullifier.slice(0, 32)}...
                </p>
              </div>

              {duration && (
                <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Generation Time</span>
                  <span className="font-mono text-xs text-success">
                    {duration.toFixed(0)}ms
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
              <Icon icon="ph:seal-check" className="w-5 h-5 text-success" />
              <span className="text-sm text-success">Proof verified successfully</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
