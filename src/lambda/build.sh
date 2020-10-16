#!/bin/bash
package_file_name=$1
s3_package_path=$2
PROFILE=$3 # aws profile

trap die ERR
die()
{
  echo "Failed in script \"$0\" at line $BASH_LINENO"
  exit 1
}

yarn install
yarn lint
rm -rf node_modules
yarn --prod
yarn lambda:pack
mkdir $PWD/packages -p; 
package_file_path="$PWD/packages/${package_file_name}"

zip -r $package_file_path . -x '*.ENV' '*.eslintrc*' './packages/*' './src/*' './test/*' './coverage/*' '*.git*' '*.n*rc' '*.DS_Store' 'yarn.lock' '.prettierrc.js' 'tsconfig.json' '.eslintignore' '.vscode/*' 'jest.config.js'
aws s3 cp $package_file_path $s3_package_path
