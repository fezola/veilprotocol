"use client";

import { useVeil } from "../../hooks/useVeil";

export function PrivacyStatus() {
  const { isAuthenticated, privacyLevel } = useVeil();

  const getStatusColor = () => {
    if (!isAuthenticated) return "bg-gray-500";
    switch (privacyLevel) {
      case "high": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    if (!isAuthenticated) return "Not Connected";
    switch (privacyLevel) {
      case "high": return "Privacy: High";
      case "medium": return "Privacy: Medium";
      case "low": return "Privacy: Low";
      default: return "Unknown";
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-sm text-gray-300">{getStatusText()}</span>
    </div>
  );
}
