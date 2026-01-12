"use client";

import { useVeilContext } from "../contexts/VeilProvider";
import { PRIVACY_GUARANTEES } from "../privacy/guarantees";

export function useVeil() {
  const context = useVeilContext();
  return context;
}

export function usePrivacyGuarantees() {
  return PRIVACY_GUARANTEES;
}

export function usePrivacyCheck() {
  const { isAuthenticated, privacyLevel } = useVeil();
  
  return {
    isPrivate: privacyLevel === "high",
    warnings: privacyLevel === "low" 
      ? ["Your session may be linkable to your identity"]
      : [],
  };
}
