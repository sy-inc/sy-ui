import {existsSync} from "node:fs";
import {fileURLToPath} from "node:url";

import {describe, expect, it} from "vitest";

import {getDemo} from "@/demos";
import {demos as cnDemos} from "@/demos/cn";
import {demos as enDemos} from "@/demos/en";

const demosDir = fileURLToPath(new URL("../src/demos/", import.meta.url));

const registries = [
  ["en", enDemos],
  ["cn", cnDemos],
] as const;

describe("demo registries", () => {
  it("registers the same demos for every language", () => {
    expect(Object.keys(cnDemos).sort()).toEqual(Object.keys(enDemos).sort());
  });

  for (const [language, registry] of registries) {
    it(`points every ${language} demo at an existing lang-prefixed source file`, () => {
      const missing = Object.entries(registry)
        .filter(([, demo]) => !existsSync(`${demosDir}${demo.file}`))
        .map(([key, demo]) => `${key} -> ${demo.file}`);

      expect(missing).toEqual([]);

      for (const [key, demo] of Object.entries(registry)) {
        expect(demo.file, key).toMatch(new RegExp(`^${language}/`));
        expect(getDemo(key, language)).toBe(demo);
      }
    });
  }
});
