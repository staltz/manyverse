// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import toastDriver from './impl';
export * from './types';

export const Duration = toastDriver.Duration;

export const Gravity = toastDriver.Gravity;

export function makeToastDriver() {
  return toastDriver;
}
