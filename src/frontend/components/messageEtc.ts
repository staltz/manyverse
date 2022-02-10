// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Msg} from 'ssb-typescript';
import {Platform} from 'react-native';
import {fromMessageSigil} from 'ssb-uri2';
import {t} from '~frontend/drivers/localization';
import {DialogSource} from '~frontend/drivers/dialogs';
import {Toast, Duration} from '~frontend/drivers/toast';
import {Palette} from '~frontend/global-styles/palette';

export type EtcChoiceId = 'copy-uri' | 'copy-id' | 'raw-msg';

export interface Sources {
  appear$: Stream<Msg>;
  dialog: DialogSource;
}

export interface Sinks {
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  goToRawMsg$: Stream<Msg>;
}

export default function messageEtc(sources: Sources): Sinks {
  const messageEtcChoice$ = sources.appear$
    .map((msg) =>
      sources.dialog
        .showPicker(
          Platform.OS === 'ios'
            ? t('message.call_to_action.etc.dialog_title')
            : undefined,
          undefined,
          {
            items: [
              {label: t('message.call_to_action.copy_msg_uri'), id: 'copy-uri'},
              {label: t('message.call_to_action.copy_msg_id'), id: 'copy-id'},
              {label: t('message.call_to_action.view_raw'), id: 'raw-msg'},
            ],
            type: 'listPlain',
            ...Palette.listDialogColors,
            cancelable: true,
            positiveText: '',
            negativeText: '',
            neutralText: '',
          },
        )
        .filter((res) => res.action === 'actionSelect')
        .map((res: any) => ({id: res.selectedItem.id as EtcChoiceId, msg})),
    )
    .flatten();

  const goToRawMsg$ = messageEtcChoice$
    .filter((choice) => choice.id === 'raw-msg')
    .map((choice) => choice.msg);

  const copyCypherlink$ = messageEtcChoice$
    .filter((choice) => choice.id === 'copy-id')
    .map((choice) => choice.msg.key);

  const copySSBURI$ = messageEtcChoice$
    .filter((choice) => choice.id === 'copy-uri')
    .map((choice) => fromMessageSigil(choice.msg.key));

  const copyToClipboard$ = xs.merge(copyCypherlink$, copySSBURI$);

  const toast$ = copyToClipboard$.mapTo({
    type: 'show',
    message: t('message.toast.copied_to_clipboard'),
    duration: Duration.SHORT,
  } as Toast);

  return {
    clipboard: copyToClipboard$,
    toast: toast$,
    goToRawMsg$,
  };
}
