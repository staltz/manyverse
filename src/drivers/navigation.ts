/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Navigation, ScreenVisibilityListener} from 'react-native-navigation';
import {Component, ReactElement, createElement} from 'react';
import xs, {Stream, Listener} from 'xstream';
import {View, Text} from 'react-native';
import {ScreenSource} from '@cycle/native-screen';

export type ScreenVNode = {
  screen: string;
  vdom: ReactElement<any>;
};

export type NoneAnim = 'none';
export type FadeAnim = 'fade';
export type SlideUpAnim = 'slide-up';
export type SlideDownAnim = 'slide-down';
export type SlideHorizontalAnim = 'slide-horizontal';

export type PushCommand = {
  type: 'push';
  /**
   * unique ID registered with Navigation.registerScreen
   */
  screen: string;

  /**
   * navigation bar title of the pushed screen (optional)
   */
  title?: string;

  /**
   * iOS only. navigation bar title image instead of the title text of the
   * pushed screen (optional)
   */
  titleImage?: any;

  /**
   * Object that will be passed as props to the pushed screen (optional)
   */
  passProps?: any;

  /**
   * does the push have transition animation or does it happen immediately
   * (optional)
   */
  animated?: boolean;

  /**
   * 'fade' (for both) / 'slide-horizontal' (for android) does the push have
   * different transition animation (optional)
   */
  animationType?: FadeAnim | SlideHorizontalAnim;

  /**
   * override the back button title (optional)
   */
  backButtonTitle?: string;

  /**
   * hide the back button altogether (optional)
   */
  backButtonHidden?: boolean;

  /**
   * override the navigator style for the pushed screen (optional)
   */
  navigatorStyle?: any;

  /**
   * override the nav buttons for the pushed screen (optional)
   */
  navigatorButtons?: any;
};

export type PopCommand = {
  type: 'pop';

  /**
   * does the pop have transition animation or does it happen
   * immediately (optional)
   */
  animated?: boolean;

  /**
   * 'fade' (for both) / 'slide-horizontal' (for android) does the pop have
   * different transition animation (optional)
   */
  animationType: FadeAnim | SlideHorizontalAnim;
};

export type PopToRootCommand = {
  type: 'popToRoot';

  /**
   * does the pop have transition animation or does it happen
   * immediately (optional)
   */
  animated?: boolean;

  /**
   * 'fade' (for both) / 'slide-horizontal' (for android) does the pop have
   * different transition animation (optional)
   */
  animationType: FadeAnim | SlideHorizontalAnim;
};

export type ResetToCommand = {
  type: 'resetTo';

  /**
   * unique ID registered with Navigation.registerScreen
   */
  screen: string;

  /**
   * navigation bar title of the pushed screen (optional)
   */
  title?: string;

  /**
   * simple serializable object that will pass as props to the pushed screen
   * (optional)
   */
  passProps?: any;

  /**
   * does the resetTo have transition animation or does it happen immediately
   * (optional)
   */
  animated?: boolean;

  /**
   * 'fade' (for both) / 'slide-horizontal' (for android) does the resetTo have
   * different transition animation (optional)
   */
  animationType?: FadeAnim | SlideHorizontalAnim;

  /**
   * override the navigator style for the pushed screen (optional)
   */
  navigatorStyle?: any;

  /**
   * override the nav buttons for the pushed screen (optional)
   */
  navigatorButtons?: any;
};

export type ShowModalCommand = {
  type: 'showModal';

  /**
   * unique ID registered with Navigation.registerScreen
   */
  screen: string;

  /**
   * navigation bar title of the pushed screen (optional)
   */
  title?: string;

  /**
   * simple serializable object that will pass as props to the pushed screen
   * (optional)
   */
  passProps?: any;

  /**
   * override the navigator style for the pushed screen (optional)
   */
  navigatorStyle?: any;

  /**
   * 'none' / 'slide-up' , appear animation for the modal (optional, default
   * 'slide-up')
   */
  animationType?: NoneAnim | SlideUpAnim;
};

export type DismissModalCommand = {
  type: 'dismissModal';

  /**
   * 'none' / 'slide-down' , dismiss animation for the modal (optional,
   * default 'slide-down')
   */
  animationType: NoneAnim | SlideDownAnim;
};

export type DismissAllModalsCommand = {
  type: 'dismissAllModals';

  /**
   * 'none' / 'slide-down' , dismiss animation for the modal (optional,
   * default 'slide-down')
   */
  animationType: NoneAnim | SlideDownAnim;
};

export type Command =
  | PushCommand
  | PopCommand
  | PopToRootCommand
  | ResetToCommand
  | ShowModalCommand
  | DismissModalCommand
  | DismissAllModalsCommand;

function makeScreenComponent(
  screenID: string,
  latestVNodes: Map<string, ReactElement<any>>,
  vdom$: Stream<ScreenVNode>,
  command$: Stream<Command>
) {
  return () =>
    class extends Component<any, {vdom: ReactElement<any>}> {
      vdomListener: Partial<Listener<ScreenVNode>>;
      commandListener: Partial<Listener<Command>>;

      constructor(props: any) {
        super(props);

        this.props.navigator.setOnNavigatorEvent(
          this.onNavigatorEvent.bind(this)
        );

        this.vdomListener = {
          next: (x: ScreenVNode) => {
            if (x.screen === screenID) {
              this.setState(() => ({vdom: x.vdom}));
            }
          }
        };

        this.commandListener = {
          next: (command: Command) => {
            this.props.navigator[command.type](command);
          }
        };

        if (latestVNodes.has(screenID)) {
          this.state = {
            vdom: latestVNodes.get(screenID) as ReactElement<any>
          };
        } else {
          this.state = {
            vdom: createElement(View, {}, createElement(Text, {}, screenID))
          };
        }
      }

      componentWillMount() {
        vdom$.addListener(this.vdomListener);
      }

      componentWillUnmount() {
        vdom$.removeListener(this.vdomListener);
      }

      onNavigatorEvent(event: any) {
        switch (event.id) {
          case 'willAppear':
            command$.addListener(this.commandListener);
            break;
          case 'didAppear':
            break;
          case 'willDisappear':
            command$.removeListener(this.commandListener);
            break;
          case 'didDisappear':
            break;
        }
      }

      public render() {
        return this.state.vdom;
      }
    };
}

// TODO
function makeTabBasedNavDrivers(screenIDs: Array<string>, config: any) {
  return function navigationDriver(nav$: Stream<ScreenVNode>) {};
}

export interface ScreenVisibilityEvent {
  screen: string;
  startTime: number;
  endTime: number;
  commandType: string;
}

export class ScreensSource extends ScreenSource {
  private _willAppear: Stream<ScreenVisibilityEvent>;
  private _didAppear: Stream<ScreenVisibilityEvent>;
  private _willDisappear: Stream<ScreenVisibilityEvent>;
  private _didDisappear: Stream<ScreenVisibilityEvent>;
  private _listener: any;

  constructor() {
    super();

    this._willAppear = xs.create<ScreenVisibilityEvent>();
    this._didAppear = xs.create<ScreenVisibilityEvent>();
    this._willDisappear = xs.create<ScreenVisibilityEvent>();
    this._didDisappear = xs.create<ScreenVisibilityEvent>();

    this._listener = new ScreenVisibilityListener({
      willAppear: (ev: ScreenVisibilityEvent) => this._willAppear._n(ev),
      didAppear: (ev: ScreenVisibilityEvent) => this._didAppear._n(ev),
      willDisappear: (ev: ScreenVisibilityEvent) => this._willDisappear._n(ev),
      didDisappear: (ev: ScreenVisibilityEvent) => this._didDisappear._n(ev)
    });

    this._listener.register();
  }

  willAppear(screen: string): Stream<ScreenVisibilityEvent> {
    return this._willAppear.filter(ev => ev.screen === screen);
  }

  didAppear(screen: string): Stream<ScreenVisibilityEvent> {
    return this._didAppear.filter(ev => ev.screen === screen);
  }

  willDisappear(screen: string): Stream<ScreenVisibilityEvent> {
    return this._willDisappear.filter(ev => ev.screen === screen);
  }

  didDisappear(screen: string): Stream<ScreenVisibilityEvent> {
    return this._didDisappear.filter(ev => ev.screen === screen);
  }
}

export function makeSingleScreenNavDrivers(
  screenIDs: Array<string>,
  config: any
) {
  const screenVNodeMimic$ = xs.create<ScreenVNode>();
  const commandMimic$ = xs.create<Command>();
  const latestVNodes = new Map<string, ReactElement<any>>();
  for (let i = 0, n = screenIDs.length; i < n; i++) {
    const screenID = screenIDs[i];
    Navigation.registerComponent(
      screenID,
      makeScreenComponent(
        screenID,
        latestVNodes,
        screenVNodeMimic$,
        commandMimic$
      )
    );
  }
  Navigation.startSingleScreenApp(config);

  function screenVNodeDriver(screenVNode$: Stream<ScreenVNode>) {
    screenVNode$.addListener({
      next: s => {
        latestVNodes.set(s.screen, s.vdom);
      }
    });
    screenVNode$._add(screenVNodeMimic$);
    return new ScreensSource();
  }
  function commandDriver(command$: Stream<Command>) {
    command$._add(commandMimic$);
  }
  return {screenVNodeDriver, commandDriver};
}
