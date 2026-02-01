import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";

interface CodeExample {
  language: string;
  label: string;
  icon: string;
  code: string;
}

interface CodeBlockProps {
  examples: CodeExample[];
  title?: string;
}

export function CodeBlock({ examples, title }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [activeTab]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(examples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117] code-block">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b border-border/50 bg-[#161b22]">
        <div className="flex items-center flex-wrap">
          {title && (
            <span className="px-4 py-2 text-sm font-medium text-muted-foreground border-r border-border/50">
              {title}
            </span>
          )}
          <div className="flex">
            {examples.map((example, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === i
                    ? "bg-[#0d1117] text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#0d1117]/50"
                }`}
              >
                <Icon icon={example.icon} className="w-4 h-4" />
                {example.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={copyToClipboard}
          className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <Icon icon={copied ? "ph:check" : "ph:copy"} className="w-4 h-4" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code content with custom scrollbar */}
      <pre
        className="p-4 overflow-x-auto text-sm leading-relaxed !bg-transparent !m-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4a5568 #1a202c'
        }}
      >
        <code className={`language-${examples[activeTab].language}`}>
          {examples[activeTab].code}
        </code>
      </pre>

      <style>{`
        .code-block pre::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .code-block pre::-webkit-scrollbar-track {
          background: #1a202c;
          border-radius: 4px;
        }
        .code-block pre::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 4px;
        }
        .code-block pre::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}

