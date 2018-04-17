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

import xs, {Stream} from 'xstream';
import {h} from '@cycle/native-screen';
import {View, Text, TextInput, Modal, Image} from 'react-native';
import {StyleSheet} from 'react-native';
import Button from '../../../components/Button';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';
import {State} from './model';

const avatarSize = 80;
const avatarSizeHalf = avatarSize * 0.5;

export const navigatorStyle = {
  statusBarColor: Palette.brand.backgroundDarker,
  navBarBackgroundColor: Palette.brand.background,
  topBarElevationShadowEnabled: false,
  navBarTextColor: Palette.white,
  navBarTextFontSize: Typography.fontSizeLarge,
  navBarTextFontFamily: Typography.fontFamilyReadableText,
  navBarButtonColor: Palette.white,
  navBarTextFontBold: true,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.brand.textBackground,
  },

  cover: {
    backgroundColor: Palette.brand.background,
    height: avatarSizeHalf,
    zIndex: 10,
  },

  fields: {
    top: -avatarSize,
    marginBottom: -avatarSize,
    zIndex: 10,
    paddingTop: avatarSizeHalf + Dimensions.verticalSpaceNormal,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.brand.textBackground,
  },

  avatarBackground: {
    height: avatarSize,
    width: avatarSize,
    borderRadius: 3,
    top: -avatarSizeHalf,
    left: Dimensions.horizontalSpaceBig,
    zIndex: 20,
    backgroundColor: Palette.indigo1,
  },

  avatar: {
    position: 'absolute',
    borderRadius: 3,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },

  label: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.brand.textWeak,
    marginLeft: 3,
  },

  textInput: {
    fontSize: Typography.fontSizeNormal,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  save: {
    position: 'absolute',
    top: avatarSizeHalf + Dimensions.verticalSpaceSmall,
    right: Dimensions.horizontalSpaceBig,
    zIndex: 30,
  },
});

export default function view(state$: Stream<State>) {
  return state$.map(state => {
    const defaultName =
      !state.about.name ||
      (state.about.name.length > 40 && state.about.name[0] === '@')
        ? ''
        : state.about.name;

    return {
      screen: 'mmmmm.Profile.Edit',
      vdom: h(View, {style: styles.container}, [
        h(View, {style: styles.cover}),

        h(
          View,
          {style: styles.avatarBackground},
          [
            !!state.about.imageUrl
              ? h(Image, {
                  style: styles.avatar,
                  source: {uri: state.about.imageUrl},
                })
              : null,
          ] as Array<any>,
        ),

        h(Button, {
          selector: 'save',
          style: styles.save,
          strong: true,
          text: 'SAVE',
          accessible: true,
          accessibilityLabel: 'Save Profile Button',
        }),

        h(View, {style: styles.fields}, [
          h(Text, {style: styles.label}, 'Name'),
          h(TextInput, {
            selector: 'name',
            multiline: false,
            autoFocus: true,
            defaultValue: defaultName,
            underlineColorAndroid: Palette.brand.background,
            accessible: true,
            accessibilityLabel: 'Name Text Input',
            style: styles.textInput,
          }),

          h(Text, {style: styles.label}, 'Bio'),
          h(TextInput, {
            selector: 'description',
            multiline: true,
            autoFocus: false,
            numberOfLines: 1,
            defaultValue: state.about.description || '',
            underlineColorAndroid: Palette.brand.background,
            accessible: true,
            accessibilityLabel: 'Description Text Input',
            style: styles.textInput,
          }),
        ]),
      ]),
    };
  });
}
