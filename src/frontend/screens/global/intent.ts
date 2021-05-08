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
const urlParse = require('url-parse');
const Ref = require('ssb-ref');

function getBase64Part(pathname: string | null): string | null {
  if (!pathname) return null;
  const ref = /(:|\/)([\w_\-=]+)$/.exec(pathname)?.[2];
  if (!ref) return null;
  const base64 = ref.replace(/-/g, '+').replace(/_/g, '/');
  return base64;
}

function isCanonicalSSBURI(type: 'feed' | 'message' | 'blob' | 'address') {
  return (uri: string) => {
    const parsed = urlParse(uri, true);
    const pathname = parsed.pathname;
    if (type === 'feed') {
      return (
        (uri.startsWith('ssb:feed:ed25519:') ||
          uri.startsWith('ssb:feed/ed25519/') ||
          uri.startsWith('ssb://feed/ed25519/')) &&
        !!getBase64Part(pathname)
      );
    } else if (type === 'message') {
      return (
        (uri.startsWith('ssb:message:sha256:') ||
          uri.startsWith('ssb:message/sha256/') ||
          uri.startsWith('ssb://message/sha256/')) &&
        !!getBase64Part(pathname)
      );
    } else if (type === 'blob') {
      return (
        (uri.startsWith('ssb:blob:sha256:') ||
          uri.startsWith('ssb:blob/sha256/') ||
          uri.startsWith('ssb://blob/sha256/')) &&
        !!getBase64Part(pathname)
      );
    } else if (type === 'address') {
      return (
        (uri.startsWith('ssb:address:multiserver') ||
          uri.startsWith('ssb:address/multiserver') ||
          uri.startsWith('ssb://address/multiserver')) &&
        !!parsed.query?.multiserverAddress
      );
    } else {
      throw new Error('unexpected canonical SSB URI type: ' + type);
    }
  };
}

function isExperimentalSSBURI(action: string) {
  return (uri: string) => {
    return (
      (uri.startsWith('ssb:experimental') ||
        uri.startsWith('ssb://experimental')) &&
      urlParse(uri, true).query?.action === action
    );
  };
}

export default function intent(
  globalEventBus: Stream<GlobalEvent>,
  linkingSource: Stream<string>,
) {
  const handleUriClaimInvite$ = linkingSource.filter(
    isExperimentalSSBURI('claim-http-invite'),
  );

  const handleUriStartHttpAuth$ = linkingSource.filter(
    isExperimentalSSBURI('start-http-auth'),
  );

  const handleUriConsumeAlias$ = linkingSource.filter(
    isExperimentalSSBURI('consume-alias'),
  );

  const handleUriFeed$ = linkingSource.filter(isCanonicalSSBURI('feed'));

  const handleUriMsg$ = linkingSource.filter(isCanonicalSSBURI('message'));

  const handleUriAddress$ = linkingSource.filter(isCanonicalSSBURI('address'));

  const connectToPeer$ = handleUriAddress$.map(
    (uri) => urlParse(uri, true).query!.multiserverAddress as string,
  );

  const goToProfile$ = xs.merge(
    globalEventBus
      .filter((ev) => ev.type === 'triggerFeedCypherlink')
      .map((ev) => ({authorFeedId: (ev as TriggerFeedCypherlink).feedId})),

    handleUriFeed$
      .map((uri) => {
        const ref = getBase64Part(urlParse(uri, true).pathname)!;
        const authorFeedId = `@${ref}.ed25519`;
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
        const ref = getBase64Part(urlParse(uri, true).pathname)!;
        const rootMsgId = `%${ref}.sha256`;
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
