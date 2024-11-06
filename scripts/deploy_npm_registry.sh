#!/usr/bin/env bash
pnpm config set registry "https://registry.npmjs.org"
pnpm config set //registry.npmjs.org/:_authToken "${NPM_TOKEN}"
# workaround: packageManager is added to package.json after git checkout resulting in 'Unclean working tree' error
pnpm publish --no-git-checks .