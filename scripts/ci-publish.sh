#!/usr/bin/env bash
set -euo pipefail

TAG=$(bun ./scripts/publish-tag.ts)
PACKAGE_DIRS=$(bun ./scripts/publish-order.ts)

while IFS= read -r dir; do
	[ -z "$dir" ] && continue
	if [ -n "$TAG" ]; then
		(cd "$dir" && bun publish --tolerate-republish --tag "$TAG")
	else
		(cd "$dir" && bun publish --tolerate-republish)
	fi
done <<< "$PACKAGE_DIRS"

bunx changeset tag
