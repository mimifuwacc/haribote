import { intro, outro, text, select, isCancel, cancel, spinner } from "@clack/prompts";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const FRAMEWORKS = [
  { value: "react", label: "React" },
  { value: "react-router", label: "React + React Router" },
  { value: "vue", label: "Vue" },
] as const;

const DEPLOY_TARGETS = [
  { value: "node", label: "Node.js" },
  { value: "cf", label: "Cloudflare Workers" },
] as const;

type Framework = (typeof FRAMEWORKS)[number]["value"];
type DeployTarget = (typeof DEPLOY_TARGETS)[number]["value"];

const FILES_WITH_REPLACEMENTS = new Set(["package.json", "wrangler.jsonc"]);

function copyDir(src: string, dest: string, projectName: string) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destName = entry === "_gitignore" ? ".gitignore" : entry;
    const destPath = join(dest, destName);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath, projectName);
    } else if (FILES_WITH_REPLACEMENTS.has(entry)) {
      writeFileSync(destPath, readFileSync(srcPath, "utf-8").replace(/__PROJECT_NAME__/g, projectName));
    } else {
      cpSync(srcPath, destPath);
    }
  }
}

function applyDeployOverlay(
  deployDir: string,
  targetDir: string,
  framework: Framework,
  projectName: string,
) {
  for (const entry of readdirSync(deployDir)) {
    const srcPath = join(deployDir, entry);
    if (statSync(srcPath).isDirectory()) continue;
    const destPath = join(targetDir, entry);
    if (FILES_WITH_REPLACEMENTS.has(entry)) {
      writeFileSync(destPath, readFileSync(srcPath, "utf-8").replace(/__PROJECT_NAME__/g, projectName));
    } else {
      cpSync(srcPath, destPath);
    }
  }
  const pkgSrc = join(deployDir, framework, "package.json");
  writeFileSync(
    join(targetDir, "package.json"),
    readFileSync(pkgSrc, "utf-8").replace(/__PROJECT_NAME__/g, projectName),
  );
}

async function main() {
  intro("create-haribote");

  let projectName = process.argv[2];

  if (!projectName) {
    const result = await text({
      message: "Project name:",
      placeholder: "my-app",
      defaultValue: "my-app",
      validate(value) {
        if (!value.trim()) return "Project name is required";
      },
    });
    if (isCancel(result)) {
      cancel("Cancelled");
      process.exit(0);
    }
    projectName = result;
  }

  const targetDir = join(process.cwd(), projectName);

  if (existsSync(targetDir)) {
    cancel(`Directory "${projectName}" already exists`);
    process.exit(1);
  }

  const framework = await select<Framework>({
    message: "Select a framework:",
    options: FRAMEWORKS,
  });

  if (isCancel(framework)) {
    cancel("Cancelled");
    process.exit(0);
  }

  const deployTarget = await select<DeployTarget>({
    message: "Deploy target:",
    options: DEPLOY_TARGETS,
  });

  if (isCancel(deployTarget)) {
    cancel("Cancelled");
    process.exit(0);
  }

  const s = spinner();
  s.start("Scaffolding project...");

  const templatesDir = join(fileURLToPath(new URL("..", import.meta.url)), "templates");

  copyDir(join(templatesDir, framework), targetDir, projectName);
  applyDeployOverlay(join(templatesDir, "_deploy", deployTarget), targetDir, framework, projectName);

  s.stop("Project created");

  const devCmd = deployTarget === "cf" ? "pnpm dev:cf" : "pnpm dev";

  outro(`Done! Get started:

  cd ${projectName}
  pnpm install
  ${devCmd}`);
}

main();
