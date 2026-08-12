#!/usr/bin/env bash
set -euo pipefail

TAG=$(bun ./scripts/publish-tag.ts)
PACKAGE_DIRS=$(bun ./scripts/publish-order.ts)

publish_package() {
	local name version packfile
	name=$(bun -e "console.log((await Bun.file('package.json').json()).name)")
	version=$(bun -e "console.log((await Bun.file('package.json').json()).version)")

	if npm view "${name}@${version}" version &>/dev/null; then
		echo "Skipping ${name}@${version} (already published)"
		return 0
	fi

	packfile=$(bun pm pack --quiet | tail -1)
	trap 'rm -f "$packfile"' RETURN

	local -a publish_args=(--provenance --access public)
	if [ -n "$TAG" ]; then
		publish_args+=(--tag "$TAG")
	fi

	npm publish "$packfile" "${publish_args[@]}"
}

while IFS= read -r dir; do
	[ -z "$dir" ] && continue
	(cd "$dir" && publish_package)
done <<< "$PACKAGE_DIRS"

bunx changeset git-tag
