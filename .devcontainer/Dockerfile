# [Choice] Node.js version: 16, 14, 12
ARG VARIANT="12-buster"
FROM node:${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends sudo openjdk-8-jdk


ADD https://sh.rustup.rs install-rustup.sh
RUN chown -R node install-rustup.sh
RUN su node -c "sh install-rustup.sh -y"
RUN rm install-rustup.sh
RUN su node -c "source ~/.cargo/env && \
        rustup target add aarch64-linux-android && \
        rustup target add arm-linux-androideabi && rustup target add armv7-linux-androideabi"

ADD https://dl.google.com/android/repository/commandlinetools-linux-7302050_latest.zip /home/node/Android/commandlinetools-linux.zip

RUN chown -R node /home/node/Android/

RUN su node -c "cd /home/node/Android && unzip commandlinetools-linux.zip && cd cmdline-tools/bin && \
        yes | ./sdkmanager --sdk_root='/home/node/Android/' 'build-tools;28.0.3' 'cmake;3.6.4111459' 'ndk;21.4.7075529' 'platforms;android-29' 'tools' 'platform-tools'"


RUN npm install --global react-native-cli


RUN bash -c "keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname \"cn=Unknown, ou=Unknown, o=Unknown, c=Unknown\""
RUN su node -c "mkdir /home/node/.gradle && echo -e \"MYAPP_RELEASE_STORE_FILE=debug.keystore \
                \nMYAPP_RELEASE_STORE_PASSWORD=android \
                \nMYAPP_RELEASE_KEY_ALIAS=androiddebugkey \
                \nMYAPP_RELEASE_KEY_PASSWORD=android\" > /home/node/.gradle/gradle.properties"

ENV PATH="/home/node/.cargo/bin:/home/node/Android/tools:/home/node/Android/tools/bin:/home/node/Android/platform-tools:${PATH}"
ENV ANDROID_SDK_ROOT="/home/node/Android/"
ENV ANDROID_NDK_HOME="${ANDROID_SDK_ROOT}ndk/21.4.7075529"
RUN su node -c "echo \"\nndk.dir=$ANDROID_NDK_HOME\" >> /home/node/.gradle/gradle.properties"

RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
RUN /home/linuxbrew/.linuxbrew/bin/brew install watchman

RUN su node -c "echo -e \"adb kill-server\nadb devices\nreact-native start\" > /home/node/.bash_history"

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"
