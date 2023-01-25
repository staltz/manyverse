// SPDX-FileCopyrightText: 2020-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

/**
 * For compatibility with Patchwork, we select the same (arbitrary!) limit of
 * PM recipients, which is 8 (including the selfId!). For practical purposes in
 * the app we think in terms of *other* recipients, so 8 - 1 = 7.
 */
export const MAX_PRIVATE_MESSAGE_RECIPIENTS = 7;

// This is the largest possible string size for the msg.value.content.text in an SSB post message.
// The value was determined empirically by creating post msgs with ssb-db2.
// See https://gitlab.com/staltz/manyverse/-/merge_requests/366#note_1232269912
export const MAX_MESSAGE_TEXT_SIZE = 7850;

/**
 * Maximum size of an SSB blob according to https://github.com/ssbc/ssb-blobs#max-default-5mb
 */
export const MAX_BLOB_SIZE = 5 * 1024 * 1024;
