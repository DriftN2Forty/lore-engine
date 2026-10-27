# Opt-in live checks

Run commands from the `testing/` app folder; executable scripts remain in `testing/scripts/`.

`npm run test:live` calls the currently running, server-configured **local** model. It runs ten bounded synthetic requests: six short follow-ups, three other selection combinations and one near-limit token-accounting probe. It prints metadata/metrics and assertions, not generated story prose or reasoning. It never starts/stops the model or provisions cloud resources. Budget a few minutes on the author's machine; the near-limit prefill is deliberately slower than ordinary chat.

From a Windows PowerShell prompt on the WSL UNC checkout, bypass npm's `cmd.exe` script runner:

```powershell
node --import tsx scripts/live-check.ts
```

Run from `testing/`. Set server environment overrides in the invoking shell when necessary; this standalone script does not automatically load Next's `.env.local`. The default alias is `rvn-iq2m-base`.

For the opt-in browser inference test against an already running Windows app:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:3000'
$env:PLAYWRIGHT_CHANNEL = 'msedge'
$env:LORE_LIVE_UI = '1'
node node_modules/@playwright/test/cli.js test
```

Unset `LORE_LIVE_UI` afterward to return to the ordinary fault-injected browser suite. Live browser traces/screenshots/video are disabled. Use the synthetic fixture; real manuscript/dialogue is outside these automated checks.

`npm run test:live:memory` (or `node --import tsx scripts/live-memory-check.ts`) performs one real summary plus one real recall response using twelve **hand-authored synthetic** prior exchanges. It verifies cited/schema-valid memory and recall of a corrected scarf color. This is not a claimed twelve-turn or thirty-turn live-model session. Optional `--diagnose` prints only JSON/schema validation metadata, not generated prose or memory values. The live failure that motivated JSON-schema-constrained compaction and the successful rerun are recorded in the evidence file.

## Default versus disabled host-cache comparison

For the test app's initial comparison, use only the build default (no explicit flag) and `--cache-ram 0`; a larger budget sweep can follow if warranted. `npm run test:cache -- default` and `npm run test:cache -- disabled` run the same twelve fixed synthetic requests. For the Windows UNC checkout use:

```powershell
node --import tsx scripts/cache-benchmark.ts default
# After restarting the model with --cache-ram 0:
node --import tsx scripts/cache-benchmark.ts disabled
```

**Those labels do not change the server configuration.** The benchmark prints per-request measurements and token-overlap/visit-label assertions, not model dialogue. `lib/cache-workload.ts` supplies two same-story visits and four generated synthetic story variants, using the normal importer/context contract. It tests short switching/return behavior, not a catalog/cache capacity limit or production accounts.

For reproducible model launches, stop the current model server first and, from a Windows prompt in `testing/`, use one of:

```text
.\start-model-cache-test.cmd default
.\start-model-cache-test.cmd disabled
```

The helper matches the owner's model/alias, Vulkan runtime, loopback port, 8192 context, one slot and GPU/Jinja flags. It clears `LLAMA_ARG_CACHE_RAM` only in the child environment: `default` supplies no cache flag; `disabled` supplies `--cache-ram 0`. Run one server at a time. Restore `default` or the original owner launcher afterward. Do not run browser/model workloads concurrently with the timed comparison. The host-cache-disabled condition still permits ordinary active-slot prefix reuse.

[Measured default/disabled results](cache-comparison-evidence.md) show why returning to an earlier story belongs in the workload, along with low-overlap new-story requests. Future larger-catalog tests should increase both distinct contexts and per-conversation history, measuring actual RAM/VRAM and eviction rather than extrapolating from a small run.
