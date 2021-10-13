<!--
SPDX-FileCopyrightText: 2021 The Manyverse Authors

SPDX-License-Identifier: CC-BY-4.0
-->

# Git commits

When you have made a change to the codebase and would like to submit it to us via GitLab or GitHub, please follow this guide.

1. Open an issue or let us know that you're about to submit something new
1. Add your name and email to `AUTHORS` file
1. Git commit with the correct commit message format `ux:` or `dx:`

The above list, now in more details:

## Open an issue

It's a shame to spend time building something that won't match the project's needs or vision, so to avoid disappointments, let us know that you want to contribute on something. Open an issue on GitLab and check with us whether your contribution would be welcomed. Since Manyverse has committments to some principles (e.g. no ads, no proprietary code, no trackers, and simple UI design), we cannot accept any contribution. Most ideas that contributors have are very welcome!

## Add yourself to `AUTHORS`

Add your name and email address to the file `AUTHORS` in the root of this project's directory.

## git commit message format

When you're done making the contribution and are ready to git commit it and push to a branch, use the flag `-s` to sign the DCO, like this:

```
git commit -s -m "ux: bug fix: button should work"
```

Note also that for the commit message, we follow this format:

- `ux:` prefix for any change to the project that **end-users** will notice
  - `ux: [and] bug fix:` for Android-only bug fixes
  - `ux: [ios] bug fix:` for iOS-only bug fixes
  - `ux: [des] bug fix:` for Desktop-only bug fixes
  - `ux: [and] feature:` for Android-only features
  - `ux: [ios] feature:` for iOS-only features
  - `ux: [des] feature:` for Desktop-only features
  - `ux: [and]` for Android-only improvements
  - `ux: [ios]` for iOS-only improvements
  - `ux: [des]` for Desktop-only improvements
  - `ux: bug fix:` prefix for a bug fix that applies to all platforms
  - `ux: feature:` for a new feature on all platforms
  - `ux:` for any other improvement on all platforms
- `dx:` prefix for any change to the project that end-users will **not** notice
  - These commits will **not** show up on the CHANGELOG.md, while `ux:` commits **will**

Just check the git log if you want to see examples of these commit messages.
