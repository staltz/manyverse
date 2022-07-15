// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
const byteSize = require('byte-size').default;
import {Command as AlertCommand} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {displayName} from '~frontend/ssb/utils/from-ssb';
import {State} from './model';

interface Actions {
  aboutStorage$: Stream<any>;
}

export default function alert(
  state$: Stream<State>,
  actions: Actions,
): Stream<AlertCommand> {
  const informConnectionAttempt$ = state$
    .filter((state) => state.reason === 'connection-attempt')
    .take(1)
    .map(() => ({
      type: 'alert' as const,
      title: t('profile.dialog_friend_request.title'),
      content: t('profile.dialog_friend_request.description'),
      options: {
        ...Palette.dialogColors,
        positiveColor: Palette.textDialogStrong,
        positiveText: t('call_to_action.ok'),
      },
    }));

  const informAboutStorage$ = actions.aboutStorage$
    .compose(sample(state$))
    .map((state) => {
      const name = displayName(state.about.name, state.about.id);
      const space = byteSize(state.storageUsed).toString();
      const isSelf = state.about.id === state.selfFeedId;
      return {
        type: 'alert' as const,
        // FIXME: localize
        title: 'Storage used',
        content: isSelf
          ? `Your content and metadata is occupying ${space} of storage on your device at the moment.`
          : `${name}'s content and metadata is occupying ${space} of storage on your device at the moment.`,
        options: {
          ...Palette.dialogColors,
          positiveColor: Palette.textDialogStrong,
          positiveText: t('call_to_action.ok'),
        },
      };
    });

  return xs.merge(informConnectionAttempt$, informAboutStorage$);
}
