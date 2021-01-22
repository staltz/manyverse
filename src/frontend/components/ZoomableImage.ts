/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {createElement, PureComponent} from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  Dimensions,
  Clipboard,
  TouchableWithoutFeedback as Touchable,
  ToastAndroid,
  StyleSheet,
  Platform,
} from 'react-native';
import {t} from '../drivers/localization';
import {Dimensions as Dimens} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';
import HeaderButton from './HeaderButton';
const urlToBlobId = require('ssb-serve-blobs/url-to-id');
const ToastIOS =
  Platform.OS === 'ios'
    ? require('react-native-tiny-toast').default
    : undefined;
const ImageView =
  Platform.OS !== 'web'
    ? () => require('react-native-image-viewing')
    : () => undefined;

const $ = createElement;

const pictureIcon = require('../../../images/image-area.png');

const styles = StyleSheet.create({
  imageBlobIdContainer: {
    flexDirection: 'row',
    backgroundColor: Palette.transparencyDark,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Dimens.horizontalSpaceNormal,
    paddingVertical: Dimens.verticalSpaceTiny,
  },

  imageBlobIdText: {
    flex: 1,
    color: Palette.colors.white,
    marginRight: Dimens.horizontalSpaceNormal,
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
  },

  imageLoading: {
    resizeMode: 'cover',
  },

  imageLoaded: {
    marginVertical: Dimens.verticalSpaceSmall,
    resizeMode: 'cover',
  },

  imagePlaceholder: {
    marginVertical: Dimens.verticalSpaceSmall,
    backgroundColor: Palette.voidWeak,
    resizeMode: 'center',
  },
});

type State = {
  loaded: boolean;
  fullscreen: boolean;
  fullwidth: number;
  fullheight: number;
};

type Props = {
  src: string;
  title?: string;
};

export default class ZoomableImage extends PureComponent<Props, State> {
  public state = {
    loaded: false,
    fullscreen: false,
    fullwidth: 300,
    fullheight: 200,
  };

  private onOpen = () => this.setState({fullscreen: true});
  private onClose = () => this.setState({fullscreen: false});
  private onLoad = () => this.setState({loaded: true});

  public componentDidMount() {
    const win = Dimensions.get('window');
    Image.getSize(
      this.props.src,
      (imgWidth: number, imgHeight: number) => {
        const ratio = imgHeight / imgWidth;
        this.setState({fullwidth: win.width, fullheight: win.width * ratio});
      },
      () => {},
    );
  }

  public renderFooter(img: {uri: string}) {
    const blobId = urlToBlobId(img.uri);
    return $(View, {style: styles.imageBlobIdContainer}, [
      $(
        Text,
        {
          key: 'text',
          numberOfLines: 1,
          ellipsizeMode: 'middle',
          style: styles.imageBlobIdText,
        },
        blobId,
      ),

      $(HeaderButton, {
        key: 'btn',
        onPress: () => {
          Clipboard.setString(blobId);
          const toastMsg = "Copied this blob's ID";
          if (Platform.OS === 'android') {
            ToastAndroid.show(toastMsg, ToastAndroid.SHORT);
          } else if (Platform.OS === 'ios') {
            ToastIOS.show(toastMsg, {
              position: 0,
              duration: ToastAndroid.SHORT,
            });
          } else {
            window.alert(toastMsg);
          }
          this.onClose();
        },
        onLongPress: () => {
          Clipboard.setString(`![${blobId}](${blobId})`);
          const toastMsg = 'Copied as markdown code';
          if (Platform.OS === 'android') {
            ToastAndroid.show(toastMsg, ToastAndroid.SHORT);
          } else if (Platform.OS === 'ios') {
            ToastIOS.show(toastMsg, {
              position: 0,
              duration: ToastAndroid.SHORT,
            });
          } else {
            window.alert(toastMsg);
          }
          this.onClose();
        },
        icon: 'content-copy',
        accessibilityLabel: t(
          'message.call_to_action.copy_blob_id.accessibility_label',
        ),
        side: 'neutral',
      }),
    ]);
  }

  public render() {
    const d = Dimensions.get('window');
    const width = d.width - Dimens.horizontalSpaceBig * 2;
    const height = width * 0.7;
    const uri = this.props.src;
    const {loaded, fullscreen} = this.state;
    const images = [{uri}];

    if (loaded) {
      return $(View, {key: uri}, [
        Platform.OS !== 'web'
          ? $(ImageView, {
              key: 'full',
              images,
              imageIndex: 0,
              visible: fullscreen,
              onRequestClose: this.onClose,
              FooterComponent: ({imageIndex}: {imageIndex: any}) =>
                this.renderFooter(images[imageIndex]),
            })
          : $(View),
        $(
          Touchable,
          {onPress: this.onOpen, key: 't'},
          $(Image, {
            key: 'preview',
            source: {uri},
            accessible: true,
            accessibilityRole: 'image',
            accessibilityLabel:
              this.props.title ??
              t('message.image.without_caption.accessibility_label'),
            style: [styles.imageLoaded, {width, height}],
          }),
        ),
      ]);
    } else {
      return $(View, {key: uri}, [
        $(
          ImageBackground,
          {
            key: 'loading',
            source: pictureIcon,
            accessible: true,
            accessibilityRole: 'image',
            accessibilityLabel:
              this.props.title ??
              t('message.image.without_caption.accessibility_label'),
            resizeMode: 'center',
            style: [styles.imagePlaceholder, {width, height}],
          },
          [
            $(Image, {
              key: 'img',
              source: {uri},
              onLoad: this.onLoad,
              style: [styles.imageLoading, {width, height}],
            }),
          ],
        ),
      ]);
    }
  }
}
