This is the `nodejs-mobile` background process. It has access to Node.js APIs, and executes `ssb-server` with a few modifications to work correctly on mobile, such as patching some dependencies.

See `/tools/build-backend` and `/tools/minify-backend` to understand how this gets integrated with the app.