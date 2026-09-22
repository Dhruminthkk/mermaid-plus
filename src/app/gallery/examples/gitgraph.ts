import type { Example } from './types'

export const gitgraph: Example[] = [
  { title: 'Trunk-based development', source: `gitGraph
  commit id: "baseline"
  branch feature/checkout-copy
  checkout feature/checkout-copy
  commit id: "copy tweaks"
  checkout main
  merge feature/checkout-copy id: "squash copy"
  branch feature/wallet-pay
  checkout feature/wallet-pay
  commit id: "wallet adapter"
  commit id: "wallet tests"
  checkout main
  commit id: "dependency bump"
  merge feature/wallet-pay id: "squash wallet"
  commit id: "release" tag: "v2.14.0"` },

  { title: 'Git flow release', source: `gitGraph
  commit id: "v1.3.0" tag: "v1.3.0"
  branch develop
  checkout develop
  commit id: "feature A"
  commit id: "feature B"
  branch release/1.4
  checkout release/1.4
  commit id: "bump version"
  commit id: "release notes"
  checkout main
  merge release/1.4 id: "release 1.4" tag: "v1.4.0"
  checkout develop
  merge release/1.4 id: "back-merge"
  commit id: "feature C"` },

  { title: 'Hotfix on a production tag', source: `gitGraph
  commit id: "v3.2.0" tag: "v3.2.0"
  branch develop
  checkout develop
  commit id: "next work"
  commit id: "more next work"
  checkout main
  branch hotfix/token-expiry
  checkout hotfix/token-expiry
  commit id: "fix clock skew"
  commit id: "regression test"
  checkout main
  merge hotfix/token-expiry id: "hotfix" tag: "v3.2.1"
  checkout develop
  merge main id: "carry the fix forward"` },

  { title: 'Long-lived fork kept in sync', source: `gitGraph
  commit id: "upstream 1"
  commit id: "upstream 2"
  branch fork/acme
  checkout fork/acme
  commit id: "acme branding"
  commit id: "acme auth"
  checkout main
  commit id: "upstream 3"
  commit id: "upstream 4"
  checkout fork/acme
  merge main id: "sync upstream"
  commit id: "acme reports"
  checkout main
  commit id: "upstream 5"
  checkout fork/acme
  merge main id: "sync again"` },

  { title: 'Reverting a bad merge', source: `gitGraph
  commit id: "stable"
  branch feature/pricing
  checkout feature/pricing
  commit id: "new pricing engine"
  checkout main
  merge feature/pricing id: "merge pricing"
  commit id: "revert pricing" type: REVERSE
  commit id: "incident notes"
  checkout feature/pricing
  commit id: "fix rounding"
  commit id: "add property tests"
  checkout main
  merge feature/pricing id: "merge pricing again"
  commit id: "release" tag: "v5.1.0"` },

  { title: 'Release train with two versions', source: `gitGraph
  commit id: "shared base"
  branch release/8.x
  checkout release/8.x
  commit id: "8.4 features"
  commit id: "8.4 freeze" tag: "v8.4.0"
  checkout main
  commit id: "9.0 work"
  commit id: "breaking change"
  checkout release/8.x
  commit id: "8.4.1 crash fix" tag: "v8.4.1"
  checkout main
  merge release/8.x id: "carry the crash fix"
  commit id: "9.0 beta" tag: "v9.0.0-beta.1"` },

  { title: 'Stacked pull requests', source: `gitGraph
  commit id: "main"
  branch pr/1-schema
  checkout pr/1-schema
  commit id: "add columns"
  branch pr/2-writes
  checkout pr/2-writes
  commit id: "dual write"
  branch pr/3-reads
  checkout pr/3-reads
  commit id: "read new column"
  checkout main
  merge pr/1-schema id: "merge 1"
  checkout pr/2-writes
  merge main id: "rebase onto main"
  checkout main
  merge pr/2-writes id: "merge 2"
  checkout pr/3-reads
  merge main id: "rebase again"
  checkout main
  merge pr/3-reads id: "merge 3"` },

  { title: 'Documentation alongside code', source: `gitGraph
  commit id: "feature branch base"
  branch feature/api-v2
  checkout feature/api-v2
  commit id: "endpoints"
  commit id: "openapi spec"
  branch docs/api-v2
  checkout docs/api-v2
  commit id: "reference pages"
  commit id: "migration guide"
  checkout feature/api-v2
  commit id: "review fixes"
  merge docs/api-v2 id: "fold docs in"
  checkout main
  merge feature/api-v2 id: "ship v2" tag: "api-v2"` },

  { title: 'Vendored dependency upgrade', source: `gitGraph
  commit id: "app at lib 3.1"
  branch chore/lib-4
  checkout chore/lib-4
  commit id: "bump to 4.0"
  commit id: "fix breaking imports"
  commit id: "update snapshots"
  checkout main
  commit id: "unrelated fix"
  checkout chore/lib-4
  merge main id: "keep current"
  commit id: "perf regression found" type: HIGHLIGHT
  commit id: "pin the fast path"
  checkout main
  merge chore/lib-4 id: "upgrade lib"` },

  { title: 'Cherry-picking a security fix', source: `gitGraph
  commit id: "v2.0.0" tag: "v2.0.0"
  branch release/2.0
  checkout main
  commit id: "refactor auth"
  commit id: "fix token leak" type: HIGHLIGHT
  commit id: "new feature"
  checkout release/2.0
  commit id: "cherry-pick token leak" type: HIGHLIGHT
  commit id: "patch release" tag: "v2.0.1"
  checkout main
  commit id: "carry on"` },
]
