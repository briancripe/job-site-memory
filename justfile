_install:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -x node_modules/.bin/turbo ]]; then
      exit 0
    fi
    git_common_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
    worktree_store="${git_common_dir}/../.pnpm-worktrees/$(basename "$PWD")"
    pnpm install --frozen-lockfile --virtual-store-dir "$worktree_store"

# Install the pnpm workspace from the lockfile.
install: _install

build: _install
    pnpm build

test: _install
    pnpm test

check: _install
    pnpm verify

# Run 0xL0C1 locally; update LOCI_SERVER_DIR when its checkout moves.
demo-loci:
    #!/usr/bin/env bash
    set -euo pipefail
    set -a
    source .env
    source .env.local
    set +a
    loci_server_dir="${LOCI_SERVER_DIR:?Set LOCI_SERVER_DIR in .env.local}"
    demo_host="${DEMO_HOST:-127.0.0.1}"
    cd "$loci_server_dir"
    LOCI_PATH_TOKEN=localdemo LOCI_HOST="$demo_host" LOCI_PORT=8130 uv run python server.py

demo-web: _install
    #!/usr/bin/env bash
    set -euo pipefail
    set -a
    source .env
    source .env.local
    set +a
    demo_host="${DEMO_HOST:-127.0.0.1}"
    cd apps/web
    node --env-file-if-exists=../../.env --env-file-if-exists=../../.env.local node_modules/next/dist/bin/next dev --turbopack -p 3100 -H "$demo_host"

# Run the complete local stack in one terminal; Ctrl-C stops both processes.
demo:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! grep -qsE '^(OPENAI_API_KEY|OPENROUTER_API_KEY|ANTHROPIC_API_KEY|GOOGLE_API_KEY)=' .env .env.local; then
      echo "Note: UI and MCP will start, but chat needs a model-provider key in .env." >&2
    fi
    just demo-loci &
    loci_pid=$!
    trap 'kill "$loci_pid" 2>/dev/null || true' EXIT INT TERM
    just demo-web

# Check the dispatcher, CopilotKit runtime, LOCI bridge, and MCP health.
demo-check:
    #!/usr/bin/env bash
    set -euo pipefail
    set -a
    source .env
    source .env.local
    set +a
    demo_host="${DEMO_HOST:-127.0.0.1}"
    web_url="http://${demo_host}:3100"
    loci_origin="${LOCI_MCP_URL%%/loci-*}"
    curl --fail --silent --show-error --output /dev/null "$web_url/"
    curl --fail --silent --show-error --output /dev/null "$web_url/api/copilotkit/info"
    curl --fail --silent --show-error --output /dev/null "$web_url/api/loci"
    curl --fail --silent --show-error --output /dev/null "$loci_origin/health"
    echo "dispatcher=$web_url loci=$loci_origin status=ready"
