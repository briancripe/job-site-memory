_install:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -x node_modules/.bin/turbo ]]; then
      exit 0
    fi
    git_common_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
    worktree_store="${git_common_dir}/../.pnpm-worktrees/$(basename "$PWD")"
    pnpm install --frozen-lockfile --virtual-store-dir "$worktree_store"

build: _install
    pnpm build

test: _install
    pnpm test

check: _install
    pnpm verify
