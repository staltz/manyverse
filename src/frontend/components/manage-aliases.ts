// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import sample from 'xstream-sample';
import {h, ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {Command} from 'cycle-native-navigation';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import {ReactElement} from 'react';
import {FeedId} from 'ssb-typescript';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../drivers/localization';
import {SSBSource} from '../drivers/ssb';
import {DialogSource} from '../drivers/dialogs';
import {Toast, Duration as ToastDuration} from '../drivers/toast';
import {Typography} from '../global-styles/typography';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Alias, PeerKV} from '../ssb/types';
import {canonicalizeAliasURL} from '../ssb/utils/alias';
import {Screens} from '../screens/enums';
import {navOptions as registerAliasNavOpts} from '../screens/alias-register/layout';
import {Props as RegisterAliasProps} from '../screens/alias-register/props';
import Button from './Button';

interface State {
  aliases: Array<Alias>;
  aliasServers?: Array<PeerKV>;
}

interface Props {
  feedId: FeedId;
}

export interface Sources {
  props: Stream<Props>;
  ssb: SSBSource;
  screen: ReactSource;
  state: StateSource<State>;
  dialog: DialogSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  toast: Stream<Toast>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
}

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const styles = StyleSheet.create({
  aliasesContainer: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: Dimensions.verticalSpaceBig,
  },

  registerNewAlias: {
    backgroundColor: Palette.backgroundCTA,
    alignSelf: 'flex-start',
    marginVertical: Dimensions.verticalSpaceNormal,
  },

  aliasRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aliasLink: {
    flex: 1,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    marginLeft: Dimensions.horizontalSpaceSmall,
    textDecorationLine: 'underline',
    color: Palette.text,
  },

  aliasRemove: {
    paddingStart: Dimensions.horizontalSpaceNormal,
    paddingEnd: Dimensions.horizontalSpaceSmall,
    paddingVertical: Dimensions.verticalSpaceSmall,
    alignSelf: 'stretch',
  },
});

function Aliases({
  aliases,
  onRegister,
  onRemove,
}: {
  aliases: Array<Alias>;
  onRegister?: () => {};
  onRemove?: (a: Alias) => void;
}) {
  return h(View, {style: styles.aliasesContainer}, [
    h(Button, {
      key: 'r',
      style: styles.registerNewAlias,
      onPress: () => onRegister?.(),
      strong: true,
      text: t('profile_edit.call_to_action.register_new_alias.label'),
      accessible: true,
      accessibilityLabel: t(
        'profile_edit.call_to_action.register_new_alias.accessibility_label',
      ),
    }),

    ...aliases.map((a) =>
      h(View, {key: a.aliasURL, style: styles.aliasRow}, [
        h(Icon, {
          size: Dimensions.iconSizeSmall,
          color: Palette.textBrand,
          name: 'link-variant',
        }),

        h(
          Text,
          {selectable: true, style: styles.aliasLink},
          canonicalizeAliasURL(a.aliasURL),
        ),

        h(Touchable, {onPress: () => onRemove?.(a)}, [
          h(Icon, {
            size: Dimensions.iconSizeNormal,
            color: Palette.textVeryWeak,
            style: styles.aliasRemove,
            name: 'delete',
          }),
        ]),
      ]),
    ),
  ]);
}

function intent(screenSource: ReactSource, dialogSource: DialogSource) {
  const registerAlias$ = screenSource.select('aliases').events('register');

  const removeAlias$ = screenSource
    .select('aliases')
    .events('remove')
    .map((a: Alias) =>
      dialogSource
        .alert(
          '',
          t('profile_edit.dialogs.remove_alias.description', {
            alias: canonicalizeAliasURL(a.aliasURL),
          }),
          {
            positiveText: t('call_to_action.remove'),
            positiveColor: Palette.textNegative,
            negativeText: t('call_to_action.cancel'),
            negativeColor: Palette.colors.comet8,
          },
        )
        .filter((res) => res.action === 'actionPositive')
        .mapTo(a),
    )
    .flatten();

  return {registerAlias$, removeAlias$};
}

function model(props$: Stream<Props>, ssbSource: SSBSource) {
  const updateAliasesReducer$ = props$
    .map((props) => ssbSource.getAliasesLive$(props.feedId))
    .flatten()
    .map(
      (aliases) =>
        function updateAliasesReducer<S extends State>(prev: S): S {
          return {...prev, aliases};
        },
    );

  const loadAliasServersReducer$ = ssbSource.aliasRegistrationRooms$().map(
    (aliasServers) =>
      function loadAliasServersReducer<S extends State>(prev: S): S {
        return {...prev, aliasServers};
      },
  );

  return xs.merge(updateAliasesReducer$, loadAliasServersReducer$);
}

function toast(actions: {removeAlias$: Stream<Alias>}, ssbSource: SSBSource) {
  const successfullyRemovedAlias$ = actions.removeAlias$
    .map(({room, alias}) => ssbSource.revokeAlias$(room, alias))
    .flatten()
    .map(
      () =>
        ({
          type: 'show' as const,
          flavor: 'success',
          message: t('profile_edit.toasts.alias_removed_success'),
          duration: ToastDuration.SHORT,
        } as Toast),
    );

  const revokeAliasResponse$ = successfullyRemovedAlias$.replaceError(() =>
    successfullyRemovedAlias$.startWith({
      type: 'show' as const,
      flavor: 'failure',
      message: t('profile_edit.toasts.alias_removed_failure'),
      duration: ToastDuration.SHORT,
    } as Toast),
  );

  return revokeAliasResponse$;
}

export default function manageAliases(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.dialog);
  const reducer$ = model(sources.props, sources.ssb);
  const toast$ = toast(actions, sources.ssb);

  const goToRegisterAlias$ = actions.registerAlias$
    .compose(sample(sources.state.stream))
    .filter((state) => !!state.aliasServers)
    .map(
      (state) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.AliasRegister,
              passProps: {
                servers: state.aliasServers!,
              } as RegisterAliasProps,
              options: registerAliasNavOpts,
            },
          },
        } as Command),
    );

  const vdom$ = sources.state.stream
    .compose(dropRepeatsByKeys(['aliases']))
    .map((state) => h(Aliases, {sel: 'aliases', aliases: state.aliases}));

  return {
    navigation: goToRegisterAlias$,
    state: reducer$,
    toast: toast$,
    screen: vdom$,
  };
}
