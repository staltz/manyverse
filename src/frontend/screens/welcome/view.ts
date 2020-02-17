/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {StyleSheet, Text, View, Image, Platform} from 'react-native';
import tutorialSlide from '../../components/tutorial-slide';
import tutorialPresentation from '../../components/tutorial-presentation';
import Button from '../../components/Button';
import {State} from './model';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.backgroundBrand,
    flexDirection: 'column',
  },

  logo: {
    width: 48,
    height: 48,
  },

  bold: {
    fontWeight: 'bold',
  },

  italicBold: {
    fontStyle: 'italic',
    fontWeight: 'bold',
  },

  link: {
    textDecorationLine: 'underline',
  },

  button: {
    borderColor: Palette.colors.white,
    marginBottom: 62,
  },

  buttonText: {
    color: Palette.colors.white,
  },

  ctaButton: {
    backgroundColor: Palette.backgroundCTA,
    marginBottom: Dimensions.verticalSpaceBig,
  },
});

type Actions = {
  scrollBy$: Stream<[number, boolean]>;
};

export default function view(state$: Stream<State>, actions: Actions) {
  return state$.map(state =>
    h(View, {style: styles.screen}, [
      !state.readyToStart
        ? h(Image, {source: {uri: 'logo_outline'}, style: styles.logo})
        : tutorialPresentation('swiper', {scrollBy$: actions.scrollBy$}, [
            tutorialSlide({
              show: state.index >= 0,
              image: require('../../../../images/noun-butterfly.png'),
              portraitMode: state.isPortraitMode,
              title: 'Welcome to Manyverse!',
              renderDescription: () => [
                'Social networking can be simple, ' +
                  'neutral, non-commercial, and built on trust between friends. ' +
                  'This is what Manyverse stands for, and we hope you too ' +
                  'can make it your digital home. ' +
                  'All this is made possible by the novel SSB protocol. ',
                h(
                  Text,
                  {sel: 'learn-more-ssb', style: styles.link},
                  'Learn more',
                ),
              ],
              renderBottom: () =>
                h(Button, {
                  sel: 'continue1',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: 'Continue',
                  strong: false,
                  accessible: true,
                  accessibilityLabel: 'Continue Button',
                }),
            }),

            tutorialSlide({
              show: state.index >= 1,
              image: require('../../../../images/noun-camping.png'),
              portraitMode: state.isPortraitMode,
              title: 'Off the grid',
              renderDescription: () => [
                "Manyverse can use internet connectivity, but it's not ",
                h(Text, {style: styles.italicBold}, 'on'),
                ' the internet. Everything happens right here on your phone. ' +
                  'This means you can use it normally even when offline! Your ',
                h(
                  Text,
                  {style: styles.bold},
                  'content is stored first on your phone',
                ),
                ', and you can ' +
                  'synchronize it with friends once you connect with them. ',
                h(
                  Text,
                  {sel: 'learn-more-off-grid', style: styles.link},
                  'Learn more',
                ),
              ],
              renderBottom: () =>
                h(Button, {
                  sel: 'continue2',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: 'Continue',
                  strong: false,
                  accessible: true,
                  accessibilityLabel: 'Continue Button',
                }),
            }),

            tutorialSlide({
              show: state.index >= 2,
              image: require('../../../../images/noun-fish.png'),
              portraitMode: state.isPortraitMode,
              title: 'Many ways to connect',
              renderDescription: () => [
                'To connect with friends and synchronize content, you can ' +
                  'either: join the same ',
                h(Text, {style: styles.bold}, 'Wi-Fi'),
                ...Platform.select({
                  ios: [' or exchange '],
                  default: [
                    ', use ',
                    h(Text, {style: styles.bold}, 'Bluetooth sync'),
                    ', or exchange ',
                  ],
                }),
                h(Text, {style: styles.bold}, 'P2P invites'),
                '. To find new people on the internet, look for an invite code ' +
                  'to a ',
                h(Text, {style: styles.bold}, 'pub server'),
                ' or a ',
                h(Text, {style: styles.bold}, 'room server'),
                ', or start your own server! ',
                h(
                  Text,
                  {sel: 'learn-more-connections', style: styles.link},
                  'Learn more',
                ),
              ],
              renderBottom: () =>
                h(Button, {
                  sel: 'continue3',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: 'Continue',
                  strong: false,
                  accessible: true,
                  accessibilityLabel: 'Continue Button',
                }),
            }),

            tutorialSlide({
              show: state.index >= 3,
              image: require('../../../../images/noun-farm.png'),
              portraitMode: state.isPortraitMode,
              title: 'Shared moderation',
              renderDescription: () => [
                'Because your phone holds your social network, no one can ban or ' +
                  'remove accounts on your behalf. Only you can moderate your ' +
                  'space, by ',
                h(Text, {style: styles.bold}, 'blocking accounts'),
                " you don't wish to have on your " +
                  'phone. Then, your friends can choose to block those same ' +
                  'accounts. This is how moderation can spread naturally! ',
                h(
                  Text,
                  {sel: 'learn-more-moderation', style: styles.link},
                  'Learn more',
                ),
              ],
              renderBottom: () =>
                h(Button, {
                  sel: 'continue4',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: 'Continue',
                  strong: false,
                  accessible: true,
                  accessibilityLabel: 'Continue Button',
                }),
            }),

            tutorialSlide({
              show: state.index >= 4,
              image: require('../../../../images/noun-roots.png'),
              portraitMode: state.isPortraitMode,
              title: 'Permanence',
              renderDescription: () => [
                'Once your content is synchronized with friends, they now hold a ' +
                  'copy of it on their phones. Because they could go offline after ' +
                  'that, it is ',
                h(Text, {style: styles.bold}, 'not possible to delete'),
                ' your content globally from all phones! This is why we have ' +
                  'chosen to make content permanent. It also makes communities ' +
                  'more respectful and considerate of what is being posted. ',
                h(
                  Text,
                  {sel: 'learn-more-permanence', style: styles.link},
                  'Learn more',
                ),
              ],
              renderBottom: () =>
                h(Button, {
                  sel: 'continue5',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: 'Continue',
                  strong: false,
                  accessible: true,
                  accessibilityLabel: 'Continue Button',
                }),
            }),

            tutorialSlide({
              show: state.index >= 5,
              image: require('../../../../images/noun-wheelbarrow.png'),
              portraitMode: state.isPortraitMode,
              title: 'In construction!',
              renderDescription: () => [
                'Manyverse is ',
                h(Text, {style: styles.bold}, 'beta-quality software'),
                ". We haven't figured " +
                  'everything out yet and some parts need fixing. While syncing, ' +
                  'the app can appear frozen for several minutes. Have patience! ' +
                  'Inform us of any other bugs you stumbled upon, and with ' +
                  'enough time and donations, we can make this a great app.',
              ],
              renderBottom: () =>
                h(Button, {
                  sel: 'continue6',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: 'Continue',
                  strong: false,
                  accessible: true,
                  accessibilityLabel: 'Continue Button',
                }),
            }),

            tutorialSlide({
              show: state.index >= 6,
              image: require('../../../../images/noun-flower.png'),
              portraitMode: state.isPortraitMode,
              title: 'Is this your first time?',
              renderDescription: () => [
                'Do you want to create a new account, or would you like to ' +
                  'restore your old account from a 48-word recovery phrase?',
              ],
              renderBottom: () => [
                h(Button, {
                  sel: 'create-account',
                  style: styles.ctaButton,
                  text: 'Create account',
                  strong: true,
                  accessible: true,
                  accessibilityLabel: 'Create Account Button',
                }),
                h(Button, {
                  sel: 'restore-account',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: 'Restore account',
                  strong: false,
                  accessible: true,
                  accessibilityLabel: 'Restore Account Button',
                }),
              ],
            }),
          ]),
    ]),
  );
}
