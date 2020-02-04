/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * For compatibility with Patchwork, we select the same (arbitrary!) limit of
 * PM recipients, which is 8 (including the selfId!). For practical purposes in
 * the app we think in terms of *other* recipients, so 8 - 1 = 7.
 */
export const MAX_PRIVATE_MESSAGE_RECIPIENTS = 7;
