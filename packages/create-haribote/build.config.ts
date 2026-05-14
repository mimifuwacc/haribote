import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index"],
  declaration: false,
  rollup: {
    inlineDependencies: true,
    output: {
      banner: "#!/usr/bin/env node",
    },
  },
});
