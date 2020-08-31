/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {MsgId, FeedId} from 'ssb-typescript';
import {PrivateThreadAndExtras} from '../../ssb/types';

export type Props = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  rootMsgId?: MsgId;
  recps?: PrivateThreadAndExtras['recps'];
  goBackActionType?: string;
};

function selfFeedIdExists(props: Partial<Record<keyof Props, any>>): boolean {
  return props.selfFeedId && typeof props.selfFeedId === 'string';
}

export function isExistingConversationProps(
  props: Partial<Record<keyof Props, any>>,
): props is Props & Required<Pick<Props, 'rootMsgId'>> {
  const rootMsgIdExists =
    props.rootMsgId && typeof props.rootMsgId === 'string';
  return selfFeedIdExists(props) && rootMsgIdExists;
}

export function isNewConversationProps(
  props: Partial<Record<keyof Props, any>>,
): props is Props & Required<Pick<Props, 'recps'>> {
  const recpsExists =
    props.recps && Array.isArray(props.recps) && props.recps.length > 0;
  return selfFeedIdExists(props) && recpsExists;
}
