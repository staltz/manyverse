// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

export interface Toast {
  type: 'show';
  flavor?: 'success' | 'failure';
  message: string;
  duration: number;
}

export interface GravityToast {
  type: 'showWithGravity';
  flavor?: 'success' | 'failure';
  message: string;
  duration: number;
  gravity: number;
}
