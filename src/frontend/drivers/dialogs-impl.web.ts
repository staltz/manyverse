/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {createElement as $, Component, createRef} from 'react';
import {Dialog, List, ListItem, ListItemText} from '@material-ui/core';
const ReactDOM = require('react-dom');
import {
  AlertAction,
  Implementation,
  OptionsCommon,
  OptionsPicker,
  OptionsPrompt,
  PickerAction,
  PromptAction,
} from './dialogs-types';

interface NoneState {
  show: 'none';
  options: null | undefined;
}

interface AlertState {
  show: 'alert';
  options?: OptionsCommon;
}

interface PickerState {
  show: 'picker';
  options?: OptionsPicker;
}

interface PromptState {
  show: 'prompt';
  options?: OptionsPrompt;
}

type State = NoneState | AlertState | PickerState | PromptState;

class Dialogs extends Component<unknown, State> implements Implementation {
  state: State = {
    show: 'none',
    options: null,
  };

  private resolveAction:
    | ((action: AlertAction) => void)
    | ((action: PickerAction) => void)
    | ((action: PromptAction) => void)
    | null = null;

  public alert(title?: string, content?: string, options?: OptionsCommon) {
    this.setState({show: 'alert', options} as AlertState);
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
    this.setState({show: 'prompt', options} as PromptState);
    return new Promise<PromptAction>((resolve) => {
      this.resolveAction = resolve;
    });
  }

  public dismiss() {
    this.resolveAction?.({action: 'actionDismiss'});
    this.setState({show: 'none'});
  }

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
      // TODO `if (state.show === 'alert')`
      // TODO `if (state.show === 'prompt')`
      if (state.show === 'picker') {
        return $(Dialog, {open: true, onClose: () => this.dismiss()}, [
          $(
            'div',
            {
              key: 'div',
              style: {
                display: 'flex',
                flexDirection: 'column',
              },
            },
            $(
              List,
              {key: 'list'},
              (state.options?.items ?? []).map((item: any) =>
                $(
                  ListItem,
                  {
                    key: item.id,
                    button: true,
                    onClick: () => this.onPressSelect(item.id),
                  },
                  $(ListItemText, {key: 'text', primary: item.label}),
                ),
              ),
            ),
          ),
        ]);
      } else {
        throw new Error(`unimplemented dialog type ${state.show}`);
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
