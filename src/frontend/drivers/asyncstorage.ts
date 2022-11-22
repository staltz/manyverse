// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {
  ClearCommand,
  MergeItemCommand,
  MultiMergeCommand,
  MultiRemoveCommand,
  MultiSetCommand,
  RemoveItemCommand,
  SetItemCommand,
} from 'cycle-native-asyncstorage';

type SchemaKeys =
  | `replyDraft:${string}`
  | `privateDraft:${string}`
  | 'composeDraft'
  | 'firstVisit'
  | 'latestVisit'
  | 'lastSessionTimestamp'
  | 'resyncing'
  | 'followingOnly';

interface TypedSetItemCommand extends SetItemCommand {
  key: SchemaKeys;
}

interface TypedMergeItemCommand extends MergeItemCommand {
  key: SchemaKeys;
}

interface TypedRemoveItemCommand extends RemoveItemCommand {
  key: SchemaKeys;
}

interface TypedMultiSetCommand extends MultiSetCommand {
  keyValuePairs: Array<[SchemaKeys, string]>;
}

interface TypedMultiMergeCommand extends MultiMergeCommand {
  keyValuePairs: Array<[SchemaKeys, string]>;
}

interface TypedMultiRemoveCommand extends MultiRemoveCommand {
  keys: Array<SchemaKeys>;
}

export type TypedCommand =
  | ClearCommand
  | TypedSetItemCommand
  | TypedMergeItemCommand
  | TypedRemoveItemCommand
  | TypedMultiSetCommand
  | TypedMultiMergeCommand
  | TypedMultiRemoveCommand;

export function setItem(key: SchemaKeys, value: string): TypedSetItemCommand {
  return {type: 'setItem', key, value};
}

export function removeItem(key: SchemaKeys): TypedRemoveItemCommand {
  return {type: 'removeItem', key};
}
