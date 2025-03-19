#!/usr/bin/env node
import { createJiti } from "../node_modules/jiti/lib/jiti.mjs";

const jiti = createJiti(import.meta.url, {
  "interopDefault": true,
  "alias": {
    "@babylonjsmarket/create-arcade": "/Users/lawrence/Programming/Web/create-arcade"
  },
  "transformOptions": {
    "babel": {
      "plugins": []
    }
  }
})

/** @type {import("/Users/lawrence/Programming/Web/create-arcade/src/index.js")} */
const _module = await jiti.import("/Users/lawrence/Programming/Web/create-arcade/src/index.ts");

export default _module?.default ?? _module;