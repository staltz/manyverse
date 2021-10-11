// SPDX-FileCopyrightText: 2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
