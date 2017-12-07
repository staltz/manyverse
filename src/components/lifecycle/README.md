# Lifecycle hooks

These files are utilities that help implement reusable React component lifecycle hooks. The main purpose of these are to keep code DRY (Don't Repeat Yourself).

Typically, the usage of them requires:

- Import a TypeScript interface, an `attach` function and a `detach` function
- Use that interface to `implements` a React component
- Call `attach` in `componentDidMount`
- Call `detach` in `componentWillUnmount`
