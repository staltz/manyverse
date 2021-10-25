// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform} from 'react-native';
import xs, {Stream} from 'xstream';
import {Command as AlertCommand} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import getAboutContent from '../dialog-about/content';
import getThanksContent from '../dialog-thanks/content';

export interface Actions {
  toggleDetailedLogs$: Stream<any>;
  updateHops$: Stream<any>;
  goToAbout$: Stream<any>;
  goToThanks$: Stream<any>;
}

export default function alert(actions: Actions): Stream<AlertCommand> {
  const restartAlert$ = xs
    .merge(actions.toggleDetailedLogs$, actions.updateHops$)
    .mapTo({
      type: 'alert',
      title: t('settings.dialogs.restart_required.title'),
      content: t('settings.dialogs.restart_required.description'),
      options: {
        ...Palette.dialogColors,
        positiveColor: Palette.textDialogStrong,
        positiveText: t('call_to_action.ok'),
      },
    } as AlertCommand);

  const aboutAlert$ =
    Platform.OS === 'web'
      ? actions.goToAbout$.mapTo({
          type: 'alert',
          title: t('dialog_about.title'),
          content: getAboutContent(),
          options: {
            ...Palette.dialogColors,
            positiveColor: Palette.textDialogStrong,
            positiveText: t('call_to_action.ok'),
            markdownOnDesktop: true,
          },
        } as AlertCommand)
      : xs.never();

  const thanksAlert$ =
    Platform.OS === 'web'
      ? actions.goToThanks$.mapTo({
          type: 'alert',
          title: t('dialog_thanks.title'),
          content: getThanksContent(),
          options: {
            ...Palette.dialogColors,
            positiveColor: Palette.textDialogStrong,
            positiveText: t('call_to_action.ok'),
            markdownOnDesktop: true,
          },
        } as AlertCommand)
      : xs.never();

  return xs.merge(restartAlert$, thanksAlert$, aboutAlert$);
}
