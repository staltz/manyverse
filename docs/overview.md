<!--
SPDX-FileCopyrightText: 2021 The Manyverse Authors

SPDX-License-Identifier: CC-BY-4.0
-->

# Project overview

## Issue labels

For every issue, pick a **type**, a **scope**, and a **priority**:

- **Type** indicates what audience the issue is relevant to
  - `dx` means "developer experience" so these are issues that are related to refactoring, improving build system, tests, etc
  - `ux` means "user experience" and can be either `ux: feature` or `ux: bug fix` to indicate to the user what kind of improvement this was
  - Every git commit message starts with either `ux:` or `dx:`, and the changelog is generated from the commit history, where only `ux` commit messages are shown. This means the commit messages are literally the changelog that appears to users when they update the app
- **Scope** indicates what part of the codebase this issue is about. So far the codebase has only two relevant "places":
  - `scope: backend` refers to the background Node.js project running the SSB server
  - `scope: frontend` refers to the UI code in React Native and Cycle.js
  - In the future there should be `scope: android` and `scope: ios` and maybe `scope: desktop`
- **Priority** indicates how urgent/important the issue is, and I use 4 weights:
  - `priority 1 (maybe)` this is something we will maybe do
  - `priority 2 (could)` this is something we could do
  - `priority 3 (should)` this is something we should do
  - `priority 4 (must)` this is something we must do

There's also a rule for `priority` labeling: `must < should < could < maybe`. In other words, the number of `must` issues has to be less than the number of `should` issues, which has to be less than the number of `could` issues, etc. This gives a funnel shape to the kanban board, [see here](https://gitlab.com/staltz/manyverse/boards).

Ideally, in a team of N developers working on Manyverse, there are N issues marked **work in progress**. In the "must" column, there are usually 2~4 issues per developer, which means at any time I choose the next work to do, I only have to pick one issue out of three, approximately. I try to keep a somewhat golden ratio progression (i.e. more than 1x, less than 2x multiplication) to the shape of the funnel, but it doesn't need to be so strictly organized. The importance of organizing the issues is also proportional to the priority:

- It's _very_ important to keep the "must" column organized and well chosen
- It's _somewhat_ important to keep the "should" column organized and well chosen
- It's not that important to keep the "could" column organized
- It's not important to keep the "maybe" column organized

Once in a while, as issues get done, we go through the issues in lower priorities and begin promoting them to higher levels. You can think of this funnel as a job interview process with multiple stages of interviews. We try to imagine which of these issues "earns its spot" the best. And usually give priority to fixing bugs, because it's worth building new features after the current user experience is mostly bugless. But every month there should be at least one new feature, even a small feature suffices.

This funnel shape also works for the [Feature roadmap](https://gitlab.com/staltz/manyverse/wikis/roadmap), which is kind of like a backlog, but less actionable, it's basically a backlog of ideas, while the issues are a backlog of tasks to perform as a developer.

Then there are less important issues, that are used just for communication:

- `~ work in progress` used just to create a column in the kanban board
- `~ testing` also for having a column in the kanban board, indicates issues that were developed but need further testing before releasing
- `type: discussion` discussion issues are not issues (tasks) at all, but sometimes people open these, so I don't want to delete them
- `closed because: ...` which inform why a certain issue was closed, e.g.
  - `closed because: fixed` ("done")
  - `closed because: is discussion` this one is used for every `type: discussion` issue because I don't want discussions to seem like actionable tasks, but I don't want closing to feel like dismissal of the conversation, this turns out to be quite useful as people understand that all discussion issues are closed by default
  - etc
- `~ contribute` just an indicator that the maintainers would gladly welcome anyone to try out solving this issue

## Codebase overview

The app is built on these technologies:

- [React Native](https://facebook.github.io/react-native/) (frontend)
- [Node.js Mobile](https://code.janeasystems.com/nodejs-mobile/) (backend)
- [Scuttlebutt](https://www.scuttlebutt.nz/) (backend and frontend)
- [TypeScript](https://www.typescriptlang.org/) (backend and frontend)
- [Cycle.js / xstream](https://cycle.js.org/) (frontend)
- [Pull streams](https://github.com/pull-stream/pull-stream/) (backend and frontend)

There are three important parts to the app, executing in runtime as different threads: **frontend thread** handles UI logic for the features, **backend thread** handles local database and peer-to-peer networking capabilities, **app thread** lightly coordinates the lifecycle of the app and creation of the other two threads.

```
+---------------------------------+
|         FRONTEND THREAD         |
|                                 |         +----------------------------------+
|   TypeScript  (dev language)    |         |            APP THREAD            |
|   JavaScript  (target language) |         |----------------------------------|
|     Cycle.js  (framework)       |<------->|                                  |
| React Native  (JS runtime env)  |         | Java/ObjectiveC  (language)      |
| src/frontend  (path to src)     |         | Android/iOS SDK  (framework)     |
|        8000+  (lines of code)   |         |    React Native  (framework)     |
+---------------------------------+         | android/app/src  (path to src)   |
                                            |   ios/Manyverse  (path to src)   |
                                            |            250+  (lines of code) |
+---------------------------------+         |                                  |
|         BACKEND THREAD          |         |                                  |
|                                 |<------->|                                  |
|   TypeScript  (dev language)    |         |                                  |
|   JavaScript  (target language) |         |                                  |
|   ssb-server  (plugin system)   |         +----------------------------------+
|      Node.js  (JS runtime env)  |
|  src/backend  (path to src)     |
|         300+  (lines of code)   |
+---------------------------------+
```

Most app development happens in `src/frontend` and thus follows the [Cycle.js](https://cycle.js.org/) architecture, but utilizes React Native components for rendering. It's good to get familiar with the architecture, but here is an explanation of it in a nutshell:

- Each _screen_ in the app is a Cycle.js component
- A Cycle.js component is a function with `sources` as input and `sinks` as output
- `Sources` is an object with several "source" streams, one stream per "channel"
- `Sinks` is an object with several "sink" streams, one stream per channel
- A **channel** is a name designated to a certain type of effect, for instance, we have the channels:
  - `asyncstorage`: for communication with the local lightweight database
  - `ssb`: for communication with the SSB database
  - `clipboard`: for reading or writing to the clipboard
  - `screen`: for sending UI updates to render on the screen, or for listening to UI events
  - `dialog`: for creating and interacting with UI dialogs overlaying the app
  - etc
- **Drivers** handle interactions with channels, there is typically one **driver** per channel, for instance see `src/frontend/drivers/dialogs.ts`
- In a Cycle.js component, _data flows_ from the sources to the sinks, passing through _transformations and combination_ steps in between
- Transformation and combination of streams is done with **stream operators** from the library [xstream](https://github.com/staltz/xstream/)
- Typically, streams are created and transformed in these sections:
  - `intent`: handles raw streams of UI events and interprets what they mean, creating "action" streams
  - `model`: take action streams as input and return "reducer" streams as outputs, to change the UI state
  - `view`: takes a stream of UI state as input and returns a stream of React elements
  - `ssb`: takes a stream of actions as input and returns a stream of SSB requests to make
  - etc

📽️ **Watch this [screencast on YouTube](https://www.youtube.com/watch?v=iv7FEbLKNUI) where Andre Staltz and David Gómez have a walkthrough the basics of thee app architecture**

## Backend in Node.js Mobile

There is lots to be explained about the backend part of this project, so consider this subsection docs a work in progress.

### How to add a new Rust-in-Node.js native module

- Add it in `src/backend/package.json`
- Create a patch for this package using `patch-package`
  - Run `rm -rf nodejs-assets`
  - Run `tools/backend/move-to-nodejs-assets.sh`
  - Run `cd nodejs-assets/nodejs-project`
  - Run `rm -rf patches`
  - Run `npm install --no-optional`
  - Run `$(npm bin)/patch-package NAME_OF_THE_PACKAGE`
  - Copy the file `./patches/NAME_OF_THE_PACKAGE` to `src/backend/patches`
- Update `tools/backend/noderify-mobile.sh` to add a `replace` option
- Update `tools/backend/noderify-desktop.sh` to add a `replace` option
- Update `tools/backend/patch-android-ssb-neon-modules.sh` to add the package in the `modules` array
- Update `tools/backend/patch-ios-ssb-neon-modules.sh` to add the package in the `modules` array
- (Optional) Update `tools/backend/remove-unused-files.sh` to remove the package's `prebuilds` folder and others

## Integration tests

**Only Android is supported for end-to-end tests at the moment.**

We use Appium and Tape, just plug in a device through USB and run `npm run test-e2e-android`. This will run tests on top of the _release_ variant of the app, so it that doesn't exist, you must run `npm run build-android-release` first. See the guide below on how to generate release builds.