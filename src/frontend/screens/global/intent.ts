// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import {NativeModules, Platform} from 'react-native';
import {
  isFeedSSBURI,
  isMessageSSBURI,
  isAddressSSBURI,
  isExperimentalSSBURIWithAction,
  toFeedSigil,
  toMultiserverAddress,
  toMessageSigil,
} from 'ssb-uri2';
import {
  GlobalEvent,
  TriggerFeedCypherlink,
  TriggerHashtagLink,
  TriggerMsgCypherlink,
} from '../../drivers/eventbus';
import {SSBSource} from '../../drivers/ssb';
import {AlertAction, DialogSource} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {State} from './model';
const Ref = require('ssb-ref');
const urlParse = require('url-parse');

export default function intent(
  globalEventBus: Stream<GlobalEvent>,
  linkingSource: Stream<string>,
  dialogSource: DialogSource,
  ssbSource: SSBSource,
  state$: Stream<State>,
) {
  const canNowHandleLinks$ = ssbSource.connStarted$;

  let responseCheckingNewVersion$: Stream<AlertAction>;
  if (
    Platform.OS === 'web' ||
    (Platform.OS === 'android' && NativeModules.BuildConfig.FLAVOR === 'indie')
  ) {
    const DURATION_CHECK_NEW_VERSION = 1000 * 60 * 60 * 24; // 1 day
    responseCheckingNewVersion$ = state$
      .map(
        (state) =>
          state.allowCheckingNewVersion === null &&
          !!state.firstVisit &&
          state.firstVisit + DURATION_CHECK_NEW_VERSION < Date.now(),
      )
      .filter((showDialog) => showDialog === true)
      .take(1)
      .compose(delay(5e3))
      .map(() =>
        dialogSource.alert(
          t('drawer.dialogs.update.title'),
          t('drawer.dialogs.update.description'),
          {
            ...Palette.dialogColors,
            positiveText: t('call_to_action.yes'),
            negativeText: t('call_to_action.no'),
            markdownOnDesktop: true,
          },
        ),
      )
      .flatten();
  } else {
    responseCheckingNewVersion$ = xs.never();
  }

  const approvedCheckingNewVersion$ = responseCheckingNewVersion$.filter(
    (res) => res.action === 'actionPositive',
  );

  const rejectedCheckingNewVersion$ = responseCheckingNewVersion$.filter(
    (res) => res.action === 'actionNegative',
  );

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

  const connectToPeer$ = handleUriAddress$.map(
    toMultiserverAddress,
  ) as Stream<string>;

  // Server-initiated SSB HTTP Auth
  const confirmedSignInRoom$ = handleUriStartHttpAuth$
    .map((uri) => {
      const query = urlParse(uri, true).query;
      const msaddr = query.multiserverAddress;
      const room = msaddr ? Ref.toAddress(msaddr).host : '';
      const roomid = query.sid && Ref.isFeed(query.sid) ? query.sid : false;
      if (!roomid) return xs.never();

      return dialogSource
        .alert(
          t('connections.dialogs.sign_in_with_ssb.server_initiated.title'),
          t(
            'connections.dialogs.sign_in_with_ssb.server_initiated.description',
            {room, roomid},
          ),
          {
            ...Palette.dialogColors,
            positiveText: t('call_to_action.yes'),
            negativeText: t('call_to_action.no'),
            markdownOnDesktop: true,
          },
        )
        .filter((res) => res.action === 'actionPositive')
        .mapTo(uri);
    })
    .flatten();

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

  const goToSearch$ = (
    globalEventBus.filter(
      (ev) => ev.type === 'triggerHashtagLink',
    ) as Stream<TriggerHashtagLink>
  ).map((ev) => ({query: ev.hashtag}));

  return {
    handleUriClaimInvite$,
    handleUriConsumeAlias$,
    handleUriStartHttpAuth$,
    approvedCheckingNewVersion$,
    rejectedCheckingNewVersion$,
    connectToPeer$,
    confirmedSignInRoom$,
    goToProfile$,
    goToThread$,
    goToSearch$,
  };
}
