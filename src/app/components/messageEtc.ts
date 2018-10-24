/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Msg} from 'ssb-typescript';
import {DialogSource} from '../drivers/dialogs';
import {Palette} from '../global-styles/palette';
import {Toast, Duration} from '../drivers/toast';

export type EtcChoiceId = 'copy-id' | 'raw-msg';

export type Sources = {
  appear$: Stream<Msg>;
  dialog: DialogSource;
};

export type Sinks = {
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  goToRawMsg$: Stream<Msg>;
};

export default function messageEtc(sources: Sources): Sinks {
  const messageEtcChoice$ = sources.appear$
    .map(msg =>
      sources.dialog
        .showPicker(undefined, undefined, {
          items: [
            {label: 'Copy cypherlink', id: 'copy-id'},
            {label: 'View raw message', id: 'raw-msg'},
          ],
          type: 'listPlain',
          contentColor: Palette.text,
          cancelable: true,
          positiveText: '',
          negativeText: '',
          neutralText: '',
        })
        .filter(res => res.action === 'actionSelect')
        .map((res: any) => ({id: res.selectedItem.id as EtcChoiceId, msg})),
    )
    .flatten();

  const goToRawMsg$ = messageEtcChoice$
    .filter(choice => choice.id === 'raw-msg')
    .map(choice => choice.msg);

  const copyCypherlink$ = messageEtcChoice$
    .filter(choice => choice.id === 'copy-id')
    .map(choice => choice.msg.key);

  const toast$ = copyCypherlink$.mapTo(
    {
      type: 'show',
      message: 'Copied to clipboard',
      duration: Duration.SHORT,
    } as Toast,
  );

  return {
    clipboard: copyCypherlink$,
    toast: toast$,
    goToRawMsg$,
  };
}
