// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {AlertButton} from 'react-native';

export type ButtonStyleIOS = 'default' | 'cancel' | 'destructive';

export interface OptionsCommon {
  cancelable?: boolean;
  forceStacking?: boolean;

  title?: string;
  titleColor?: string;

  backgroundColor?: string;
  content?: string;
  contentColor?: string;
  contentIsHtml?: boolean;
  linkColor?: string;

  negativeColor?: string;
  negativeStyleIOS?: ButtonStyleIOS;
  negativeText?: string;

  neutralColor?: string;
  neutralStyleIOS?: ButtonStyleIOS;
  neutralText?: string;

  positiveColor?: string;
  positiveStyleIOS?: ButtonStyleIOS;
  positiveText?: string; // default "OK"
}

export interface PickerItem {
  label?: string;
  id?: any;
  iosStyle?: AlertButton['style'];
}

export interface OptionsAlert extends OptionsCommon {
  markdownOnDesktop?: boolean;
}

export interface OptionsPicker extends OptionsCommon {
  items: Array<PickerItem>;
  idKey?: string;
  labelKey?: string;
  neutralIsClear?: boolean;
  selectedId?: any;
  selectedIds?: any[];
  type?: 'listCheckbox' | 'listPlain' | 'listRadio';
  widgetColor?: string;
}

export interface OptionsPrompt extends OptionsCommon {
  widgetColor?: string;
}

export interface AlertAction {
  action:
    | 'actionDismiss'
    | 'actionNegative'
    | 'actionNeutral'
    | 'actionPositive';
}

export type PickerAction =
  | {action: 'actionNegative' | 'actionNeutral' | 'actionDismiss'}
  | {
      action: 'actionSelect';
      selectedItem: any;
    };

export type PromptAction =
  | {action: 'actionNegative' | 'actionNeutral' | 'actionDismiss'}
  | {action: 'actionPositive'; text: string; checked?: boolean};

export interface Implementation {
  alert(
    title?: string,
    content?: string,
    options?: OptionsAlert,
  ): Promise<AlertAction>;

  showPicker(
    title?: string,
    content?: string,
    options?: OptionsPicker,
  ): Promise<PickerAction>;

  prompt(
    title?: string,
    content?: string,
    options?: OptionsPrompt,
  ): Promise<PromptAction>;

  dismiss(): void;
}
