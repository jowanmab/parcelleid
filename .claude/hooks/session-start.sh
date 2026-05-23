#!/bin/bash
# SessionStart hook: installs an SSH client and provisions a key + known_hosts
# entry so Claude can `ssh root@62.238.18.248` (parcelleid prod) from a remote
# Claude Code on the web session.
#
# Required env vars (set as SECRETS in the Claude Code Web environment config):
#   PARCELLEID_SSH_KEY_B64   base64-encoded private SSH key (PEM)
#   PARCELLEID_HOST_KEY      one-line SSH host key for 62.238.18.248
#                            (output of: ssh-keyscan -t ed25519 62.238.18.248)
#
# Network policy: the environment must allow outbound TCP to
# 62.238.18.248:22. Set this in the environment's network policy.

set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

SERVER_HOST="62.238.18.248"

if ! command -v ssh >/dev/null 2>&1; then
  echo "[session-start] installing openssh-client..."
  export DEBIAN_FRONTEND=noninteractive
  # `apt-get update` may fail on unrelated third-party PPAs that aren't signed
  # any more; we only care that the openssh-client install itself succeeds.
  apt-get update -qq || true
  apt-get install -y -qq openssh-client
fi

mkdir -p ~/.ssh
chmod 700 ~/.ssh

if [ -n "${PARCELLEID_SSH_KEY_B64:-}" ]; then
  KEY_PATH=~/.ssh/parcelleid_ed25519
  echo "$PARCELLEID_SSH_KEY_B64" | base64 -d > "$KEY_PATH"
  chmod 600 "$KEY_PATH"

  cat > ~/.ssh/config <<EOF
Host parcelleid
  HostName $SERVER_HOST
  User root
  IdentityFile $KEY_PATH
  IdentitiesOnly yes
EOF
  chmod 600 ~/.ssh/config
  echo "[session-start] SSH key installed (alias: ssh parcelleid)"
else
  echo "[session-start] PARCELLEID_SSH_KEY_B64 not set — skipping key install"
fi

if [ -n "${PARCELLEID_HOST_KEY:-}" ]; then
  touch ~/.ssh/known_hosts
  chmod 644 ~/.ssh/known_hosts
  if ! grep -qxF "$PARCELLEID_HOST_KEY" ~/.ssh/known_hosts; then
    echo "$PARCELLEID_HOST_KEY" >> ~/.ssh/known_hosts
    echo "[session-start] host key pinned for $SERVER_HOST"
  fi
else
  echo "[session-start] PARCELLEID_HOST_KEY not set — host key not pinned"
fi
