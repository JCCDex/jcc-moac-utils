#!/bin/bash
npm run build
npx babel node_modules/base-x/index.js -o node_modules/base-x/index.js
./node_modules/cross-env/dist/bin/cross-env-shell.js MODE=$1 REPORT=$2 webpack

# ./compile.sh dev true
# ./compile.sh prod true


