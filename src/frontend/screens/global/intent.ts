/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {
  GlobalEvent,
  TriggerFeedCypherlink,
  TriggerMsgCypherlink,
} from '../../drivers/eventbus';
import {
  isFeedSSBURI,
  isMessageSSBURI,
  isAddressSSBURI,
  isExperimentalSSBURIWithAction,
  toFeedSigil,
  toMultiserverAddress,
  toMessageSigil,
} from 'ssb-uri2';
import {SSBSource} from '../../drivers/ssb';
const Ref = require('ssb-ref');

export default function intent(
  globalEventBus: Stream<GlobalEvent>,
  linkingSource: Stream<string>,
  ssbSource: SSBSource,
) {
  const canNowHandleLinks$ = ssbSource.connStarted$;

  const link$ = canNowHandleLinks$
    .map(() => linkingSource)
    .flatten()
    .remember();

  const handleUriClaimInvite$ = link$.filter(
    isExperimentalSSBURIWithAction('claim-http-invite'),
  );

  const handleUriStartHttpAuth$ = link$.filter(
    isExperimentalSSBURIWithAction('start-http-auth'),
  );

  const handleUriConsumeAlias$ = link$.filter(
    isExperimentalSSBURIWithAction('consume-alias'),
  );

  const handleUriFeed$ = link$.filter(isFeedSSBURI);

  const handleUriMsg$ = link$.filter(isMessageSSBURI);

  const handleUriAddress$ = link$.filter(isAddressSSBURI);

  const connectToPeer$ = handleUriAddress$.map(toMultiserverAddress) as Stream<
    string
  >;

  const goToProfile$ = xs.merge(
    globalEventBus
      .filter((ev) => ev.type === 'triggerFeedCypherlink')
      .map((ev) => ({authorFeedId: (ev as TriggerFeedCypherlink).feedId})),

    handleUriFeed$
      .map((uri) => {
        const authorFeedId = toFeedSigil(uri);
        if (!Ref.isFeed(authorFeedId)) return null;
        return {authorFeedId};
      })
      .filter((x) => !!x) as Stream<{authorFeedId: string}>,
  );

  const goToThread$ = xs.merge(
    globalEventBus
      .filter((ev) => ev.type === 'triggerMsgCypherlink')
      .map((ev) => ({rootMsgId: (ev as TriggerMsgCypherlink).msgId})),

    handleUriMsg$
      .map((uri) => {
        const rootMsgId = toMessageSigil(uri);
        if (!Ref.isMsg(rootMsgId)) return null;
        return {rootMsgId};
      })
      .filter((x) => !!x) as Stream<{rootMsgId: string}>,
  );

  return {
    handleUriClaimInvite$,
    handleUriConsumeAlias$,
    handleUriStartHttpAuth$,
    connectToPeer$,
    goToProfile$,
    goToThread$,
  };
}
