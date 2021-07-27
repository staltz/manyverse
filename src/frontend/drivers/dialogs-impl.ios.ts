/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Alert, AlertButton} from 'react-native';
import {Implementation} from './dialogs-types';

const impl: Implementation = {
  alert(title, content, options) {
    return new Promise((resolve, _reject) => {
      const buttons: Array<AlertButton> = [];
      if (options?.positiveText) {
        buttons.push({
          text: options.positiveText,
          style: options.positiveStyleIOS ?? 'default',
          onPress: () => resolve({action: 'actionPositive'}),
        });
      }
      if (options?.negativeText) {
        buttons.push({
          text: options.negativeText,
          style: options.negativeStyleIOS ?? 'default',
          onPress: () => resolve({action: 'actionNegative'}),
        });
      }
      if (options?.neutralText) {
        buttons.push({
          text: options.neutralText,
          style: options.neutralStyleIOS ?? 'default',
          onPress: () => resolve({action: 'actionNeutral'}),
        });
      }
      if (!options) {
        buttons.push({
          text: 'OK',
          style: 'default',
          onPress: () => resolve({action: 'actionPositive'}),
        });
      }
      Alert.alert(title ?? '', content ?? '', buttons, {
        cancelable: true,
        onDismiss: () => resolve({action: 'actionDismiss'}),
      });
    });
  },

  showPicker(title, content, options) {
    return new Promise((resolve, _reject) => {
      const buttons: Array<AlertButton> = [];
      if (options) {
        for (const item of options.items) {
          buttons.push({
            text: item.label,
            style: item.iosStyle ?? 'default',
            onPress: () =>
              resolve({
                action: 'actionSelect',
                selectedItem: {id: item.id},
              }),
          });
        }
      }
      buttons.push({
        text: 'Cancel',
        style: 'cancel',
        onPress: () => resolve({action: 'actionDismiss'}),
      });
      Alert.alert(title ?? '', content, buttons);
    });
  },

  prompt(title, content, options) {
    return new Promise((resolve, _reject) => {
      const buttons = [
        {
          text: options?.positiveText ?? 'OK',
          onPress: (text: string) => {
            resolve({action: 'actionPositive', text});
          },
        },
      ];
      Alert.prompt(title ?? '', content, buttons);
    });
  },

  dismiss() {
    // TODO: unclear what this should be
  },
};

export default impl;
