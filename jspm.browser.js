SystemJS.config({
  baseURL: "/",
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*",
    "typescript-jspm-seed/": "src/"
  },
  bundles: {
    "storage/build.js": [
      "typescript-jspm-seed/index.ts",
      "typescript-jspm-seed/GreetingFactory.ts",
      "github:frankwallis/plugin-typescript@4.0.6.json"
    ]
  }
});
