import path from "path";
import { env } from "./env";

export interface RuntimePaths {
  appRoot: string;
  pkmRoot: string;
  indexRoot: string;
  modelsDir: string;
  referenceDir: string;
  skillsDir: string;
  agentsInstructionsPath: string;
}

let cachedRuntimePaths: RuntimePaths | null = null;

export function getRuntimePaths(): RuntimePaths {
  if (cachedRuntimePaths) {
    return cachedRuntimePaths;
  }

  const appRoot = path.resolve(env.APP_ROOT_PATH ?? /* turbopackIgnore: true */ process.cwd());
  const pkmRoot = path.resolve(env.PKM_PATH);
  const indexRoot = path.resolve(env.INDEX_PATH ?? path.join(appRoot, "index"));

  cachedRuntimePaths = {
    appRoot,
    pkmRoot,
    indexRoot,
    modelsDir: path.join(appRoot, "models"),
    referenceDir: path.join(appRoot, "reference"),
    skillsDir: path.join(appRoot, ".agents", "skills"),
    agentsInstructionsPath: path.join(appRoot, "AGENTS.md"),
  };

  return cachedRuntimePaths;
}
