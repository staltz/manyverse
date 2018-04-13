#!/bin/bash
      # Helper script for Gradle to call npm on macOS in case it is not found
      export PATH=$PATH:/Users/luandrovieira/.nvm/versions/node/v8.10.0/lib/node_modules/npm/node_modules/npm-lifecycle/node-gyp-bin:/Users/luandrovieira/Sites/swaraj/projects/mmmmm-mobile/node_modules/nodejs-mobile-react-native/node_modules/.bin:/Users/luandrovieira/Sites/swaraj/projects/mmmmm-mobile/node_modules/.bin:/usr/local/sbin:/Users/luandrovieira/.nvm/versions/node/v8.10.0/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/git/bin:/Users/luandrovieira/Library/Android/sdk/tools:/Users/luandrovieira/Library/Android/sdk/platform-tools
      npm $@
    