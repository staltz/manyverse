// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {createElement as $, Component, createRef} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@material-ui/core';
const ReactDOM = require('react-dom');
import {Palette} from '../../global-styles/palette';
import Markdown from '../../components/Markdown';
import {
  AlertAction,
  Implementation,
  OptionsAlert,
  OptionsCommon,
  OptionsPicker,
  OptionsPrompt,
  PickerAction,
  PromptAction,
} from './types';

interface BasicState {
  title?: string;
  content?: string;
  textInput?: string;
}

interface NoneState extends BasicState {
  show: 'none';
  options: null | undefined;
}

interface PromptState extends BasicState {
  show: 'prompt';
  options?: OptionsPrompt;
  textInput: string;
}

interface AlertState extends BasicState {
  show: 'alert';
  options?: OptionsAlert;
}

interface PickerState extends BasicState {
  show: 'picker';
  options?: OptionsPicker;
}

type State = NoneState | AlertState | PickerState | PromptState;

class Dialogs extends Component<unknown, State> implements Implementation {
  state: State = {
    show: 'none',
    title: '',
    content: '',
    options: null,
    textInput: undefined,
  };

  private resolveAction:
    | ((action: AlertAction) => void)
    | ((action: PickerAction) => void)
    | ((action: PromptAction) => void)
    | null = null;

  public alert(title?: string, content?: string, options?: OptionsCommon) {
    this.setState({show: 'alert', title, content, options} as AlertState);
    return new Promise<AlertAction>((resolve) => {
      this.resolveAction = resolve;
    });
  }

  public showPicker(title?: string, content?: string, options?: OptionsPicker) {
    this.setState({show: 'picker', options} as PickerState);
    return new Promise<PickerAction>((resolve) => {
      this.resolveAction = resolve;
    });
  }

  public prompt(title?: string, content?: string, options?: OptionsPrompt) {
    this.setState({show: 'prompt', title, content, options} as PromptState);
    return new Promise<PromptAction>((resolve) => {
      this.resolveAction = resolve;
    });
  }

  public dismiss() {
    this.resolveAction?.({action: 'actionDismiss'});
    this.setState({show: 'none'});
    this.resolveAction = null;
  }

  private onPressNegative = () => {
    (this.resolveAction as (action: AlertAction | PromptAction) => void)?.({
      action: 'actionNegative',
    });
    this.setState({show: 'none'});
    this.resolveAction = null;
  };

  private onPressPositive = () => {
    (this.resolveAction as (action: AlertAction | PromptAction) => void)?.({
      action: 'actionPositive',
      text: this.state.show === 'prompt' ? this.state.textInput : undefined,
    });
    this.setState({show: 'none'});
    this.resolveAction = null;
  };

  private onPressSelect = (id: string) => {
    (this.resolveAction as (action: PickerAction) => void)?.({
      action: 'actionSelect',
      selectedItem: {id},
    });
    this.setState({show: 'none'});
    this.resolveAction = null;
  };

  render() {
    const state = this.state as State;
    if (state.show === 'none') {
      return null;
    } else {
      if (state.show === 'alert' || state.show === 'prompt') {
        return $(
          Dialog,
          {key: 'dialog', open: true, onClose: () => this.dismiss()},
          [
            $(
              'form',
              {
                key: 'form',
                style: {
                  backgroundColor:
                    state.options?.backgroundColor ??
                    Palette.dialogColors.backgroundColor,
                },
              },
              [
                $(
                  DialogTitle,
                  {
                    key: 'title',
                    style: {
                      color:
                        state.options?.titleColor ??
                        Palette.dialogColors.titleColor,
                    },
                  },
                  state.title,
                ),
                $(DialogContent, {key: 'content'}, [
                  state.show === 'alert' && state.options?.markdownOnDesktop
                    ? $(Markdown, {key: 'md', text: state.content!})
                    : $(
                        DialogContentText,
                        {
                          key: 'text',
                          style: {
                            wordBreak: 'break-word',
                            color:
                              state.options?.contentColor ??
                              Palette.dialogColors.contentColor,
                          },
                        },
                        state.content,
                      ),
                  state.show === 'prompt' &&
                    $(TextField, {
                      key: 'input',
                      autoFocus: true,
                      margin: 'dense',
                      fullWidth: true,
                      onChange: (evt) =>
                        this.setState({textInput: evt.target.value}),
                    }),
                ]),

                $(DialogActions, {key: 'actions'}, [
                  state.options?.negativeText
                    ? $(
                        Button,
                        {
                          key: 'negative',
                          type: 'button',
                          onClick: () => this.onPressNegative(),
                          style: {
                            color:
                              state.options?.negativeColor ??
                              Palette.dialogColors.negativeColor,
                          },
                        },
                        state.options.negativeText,
                      )
                    : null,
                  state.options?.positiveText
                    ? $(
                        Button,
                        {
                          key: 'positive',
                          type: 'submit',
                          onClick: (evt) => {
                            evt.preventDefault();
                            this.onPressPositive();
                          },
                          style: {
                            color:
                              state.options?.positiveColor ??
                              Palette.dialogColors.positiveColor,
                          },
                        },
                        state.options.positiveText,
                      )
                    : null,
                ]),
              ],
            ),
          ],
        );
      } else if (state.show === 'picker') {
        return $(
          Dialog,
          {
            open: true,
            onClose: () => this.dismiss(),
            fullWidth: true,
            maxWidth: 'xs',
          },
          [
            $(
              List,
              {
                key: 'list',
                style: {
                  backgroundColor:
                    state.options?.backgroundColor ??
                    Palette.dialogColors.backgroundColor,
                },
              },
              (state.options?.items ?? []).map((item: any) =>
                $(
                  ListItem,
                  {
                    key: item.id,
                    button: true,
                    onClick: () => this.onPressSelect(item.id),
                  },
                  $(ListItemText, {
                    key: 'text',
                    primary: item.label,
                    style: {
                      color: state.options?.contentColor ?? Palette.text,
                    },
                  }),
                ),
              ),
            ),
          ],
        );
      }
    }
  }
}

const dialogsRef = createRef<Dialogs>();

function Root() {
  return $(Dialogs, {ref: dialogsRef});
}

const domContainer = document.getElementById('dialogs');
ReactDOM.render($(Root), domContainer);

const reactImpl: Implementation = dialogsRef.current!;

export default reactImpl;
