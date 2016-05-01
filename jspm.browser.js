SystemJS.config({
  baseURL: "/",
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*",
    "typescript-jspm-umd-seed/": "src/"
  },
  bundles: {
    "storage/build.js": [
      "typescript-jspm-umd-seed/main.ts",
      "typescript-jspm-umd-seed/GreetingFactory.ts",
      "github:frankwallis/plugin-typescript@4.0.6.json"
    ]
  }
});
