#!/usr/bin/env bash
set -euo pipefail

TAG=$(bun -e 'const main=async()=>{try{const f=Bun.file(".changeset/pre.json");if(!await f.exists())return;const p=await f.json();if(p.mode==="pre"&&typeof p.tag==="string")console.log(p.tag)}catch{}};await main()')
for dir in packages/*; do
	bun -e "const j = await Bun.file('$dir/package.json').json(); if (j.private === true) process.exit(1)" || continue
	if [ -n "$TAG" ]; then
		(cd "$dir" && bun publish --tolerate-republish --tag "$TAG")
	else
		(cd "$dir" && bun publish --tolerate-republish)
	fi
done
bunx changeset tag
