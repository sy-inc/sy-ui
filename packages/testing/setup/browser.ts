import {commands} from "vitest/browser";
import "vitest-browser-react";

// Once per file, before its first command: see `waitForTesterFrame` in configs/browser.mjs.
beforeAll(() => commands.waitForTesterFrame(location.href));
