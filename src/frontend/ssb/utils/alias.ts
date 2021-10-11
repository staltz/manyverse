// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

export function canonicalizeAliasURL(aliasURL: string) {
  return aliasURL.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
