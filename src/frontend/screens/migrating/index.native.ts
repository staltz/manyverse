// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

export function migrating(sources: any): any {
  throw new Error('migrating not supported on mobile');
}
