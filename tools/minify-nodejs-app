#!/bin/bash

echo "Building native modules for armeabi-v7a...";
cd android;
./gradlew nodejs-mobile-react-native:CopyNodeProjectAssetsarmeabi-v7a;
./gradlew nodejs-mobile-react-native:MakeToolchainarmeabi-v7a;
./gradlew nodejs-mobile-react-native:BuildNpmModulesarmeabi-v7a;
cd ..;
echo "";

declare -a keepThese=("bufferutil" "level" "leveldown" "sodium-native")

echo -en "Minifying with noderify...";
cd ./nodejs-assets/nodejs-project;
$(npm bin)/noderify \
  --replace.bindings=bindings-noderify-nodejs-mobile \
  --replace.node-extend=xtend \
  index.js > _index.js;
rm index.js;
mv _index.js index.js;
cd ../..;
echo -en " done.\n";

echo -en "Patching the noderified prelude...";
sed -i '12s/file/__dirname, file/' ./nodejs-assets/nodejs-project/index.js;
echo -en " done.\n";

echo -en "Replacing node_modules folder...";
rm -rf ./nodejs-assets/nodejs-project/node_modules;
cp -r ./android/build/nodejs-native-assets/nodejs-native-assets-armeabi-v7a/node_modules ./nodejs-assets/nodejs-project;
echo -en " done.\n";

echo -en "Removing other unused files...";
cd ./nodejs-assets/nodejs-project;
rm package-lock.json;
find . -type d -name "darwin-x64" -exec rm -rf {} \;
find . -type d -name "win32-ia32" -exec rm -rf {} \;
find . -type d -name "win32-x64" -exec rm -rf {} \;
cd ../..;
echo -en " done.\n";
