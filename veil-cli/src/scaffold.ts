import fs from "fs-extra";
import path from "path";
import { VeilConfig } from "./cli.js";
import {
  generateVeilConfig,
  generateEnvExample,
  generateReadme,
  generateLoginTs,
  generateRecoveryTs,
  generateAccessTs,
  generateGuaranteesTs,
  generateRpcTs,
  generateHeliusTs,
  generatePackageJson,
  generateTsConfig,
  generateAppEntry,
  generateLayoutTsx,
  generateGlobalsCss,
  generateVeilProvider,
  generateWalletButton,
  generatePrivacyStatus,
  generateShadowPayModule,
  generateVeilHooks,
  generateNextConfig,
  generateTailwindConfig,
  generatePostcssConfig,
  generateProvidersTsx,
  generateSdkProvider,
  generateSdkHooks,
} from "./templates/index.js";

export async function scaffoldProject(config: VeilConfig): Promise<void> {
  const projectPath = path.resolve(process.cwd(), config.projectName);

  // Create project directory
  await fs.ensureDir(projectPath);

  // Create folder structure
  const srcDir = config.template === "nextjs" ? "app" : "src";
  const folders = [
    srcDir,
    `${srcDir}/components`,
    "privacy",
    "infra",
    "hooks",
    "contexts",
  ];

  if (config.shadowPay) {
    folders.push("shadowpay");
  }

  for (const folder of folders) {
    await fs.ensureDir(path.join(projectPath, folder));
  }

  // Generate all files
  const files: Array<{ path: string; content: string }> = [
    // Root config files
    { path: "veil.config.ts", content: generateVeilConfig(config) },
    { path: ".env.example", content: generateEnvExample(config) },
    { path: "README.md", content: generateReadme(config) },
    { path: "package.json", content: generatePackageJson(config) },
    { path: "tsconfig.json", content: generateTsConfig(config) },
    { path: "tailwind.config.js", content: generateTailwindConfig(config) },
    { path: "postcss.config.js", content: generatePostcssConfig() },

    // Privacy module
    { path: "privacy/login.ts", content: generateLoginTs() },
    { path: "privacy/recovery.ts", content: generateRecoveryTs() },
    { path: "privacy/access.ts", content: generateAccessTs() },
    { path: "privacy/guarantees.ts", content: generateGuaranteesTs() },
    { path: "privacy/index.ts", content: `export * from "./login.js";\nexport * from "./recovery.js";\nexport * from "./access.js";\nexport * from "./guarantees.js";\n` },

    // Infrastructure module
    { path: "infra/rpc.ts", content: generateRpcTs(config) },
    { path: "infra/helius.ts", content: generateHeliusTs(config) },
    { path: "infra/index.ts", content: `export * from "./rpc.js";\nexport * from "./helius.js";\n` },

    // Hooks
    { path: "hooks/useVeil.ts", content: generateVeilHooks(config) },
    { path: "hooks/useSdk.ts", content: generateSdkHooks() },
    { path: "hooks/index.ts", content: `export * from "./useVeil.js";\nexport * from "./useSdk.js";\n` },

    // Contexts
    { path: "contexts/VeilProvider.tsx", content: generateVeilProvider(config) },
    { path: "contexts/VeilSDKProvider.tsx", content: generateSdkProvider(config) },
    { path: "contexts/index.ts", content: `export * from "./VeilProvider.js";\nexport * from "./VeilSDKProvider.js";\n` },

    // Components
    { path: `${srcDir}/components/WalletButton.tsx`, content: generateWalletButton() },
    { path: `${srcDir}/components/PrivacyStatus.tsx`, content: generatePrivacyStatus() },

    // App files
    { path: `${srcDir}/page.tsx`, content: generateAppEntry(config) },
    { path: `${srcDir}/layout.tsx`, content: generateLayoutTsx(config) },
    { path: `${srcDir}/globals.css`, content: generateGlobalsCss() },
    { path: `${srcDir}/providers.tsx`, content: generateProvidersTsx(config) },
  ];

  // Add Next.js config if using Next.js
  if (config.template === "nextjs") {
    files.push({ path: "next.config.js", content: generateNextConfig() });
  }

  // Add ShadowPay module if enabled
  if (config.shadowPay) {
    files.push({ path: "shadowpay/index.ts", content: generateShadowPayModule(config) });
  }

  // Write all files
  for (const file of files) {
    await fs.writeFile(
      path.join(projectPath, file.path),
      file.content,
      "utf-8"
    );
  }

  // Create .gitignore
  const gitignore = `node_modules/
.env
.env.local
dist/
.next/
`;
  await fs.writeFile(path.join(projectPath, ".gitignore"), gitignore, "utf-8");
}

