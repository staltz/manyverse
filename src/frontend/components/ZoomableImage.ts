/* Copyright (C) 2018-2019 The Manyverse Authors.
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
import ImageView from 'react-native-image-view';
import {Dimensions as Dimens} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';
import HeaderButton from './HeaderButton';
const ToastIOS = require('react-native-tiny-toast').default;
const urlToBlobId = require('ssb-serve-blobs/url-to-id');

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
    backgroundColor: Palette.backgroundVoidWeak,
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

  public renderFooter(img: any) {
    const blobId = urlToBlobId(img.source.uri);
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
          } else {
            ToastIOS.show(toastMsg, {
              position: 0,
              duration: ToastAndroid.SHORT,
            });
          }
          this.onClose();
        },
        onLongPress: () => {
          Clipboard.setString(`![${blobId}](${blobId})`);
          const toastMsg = 'Copied as markdown code';
          if (Platform.OS === 'android') {
            ToastAndroid.show(toastMsg, ToastAndroid.SHORT);
          } else {
            ToastIOS.show(toastMsg, {
              position: 0,
              duration: ToastAndroid.SHORT,
            });
          }
          this.onClose();
        },
        icon: 'content-copy',
        accessibilityLabel: 'Copy Blob ID',
        side: 'neutral',
      }),
    ]);
  }

  public render() {
    const d = Dimensions.get('window');
    const width = d.width - Dimens.horizontalSpaceBig * 2;
    const height = width * 0.7;
    const uri = this.props.src;
    const {fullwidth, fullheight, loaded, fullscreen} = this.state;

    if (loaded) {
      return $(View, {key: uri}, [
        fullscreen
          ? $(ImageView, {
              key: 'full',
              images: [{source: {uri}, width: fullwidth, height: fullheight}],
              imageIndex: 0,
              onClose: this.onClose,
              renderFooter: this.renderFooter.bind(this),
            })
          : null,
        $(
          Touchable,
          {onPress: this.onOpen, key: 't'},
          $(Image, {
            key: 'preview',
            source: {uri},
            accessible: true,
            accessibilityLabel: this.props.title ?? 'Picture without caption',
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
            accessibilityLabel: this.props.title ?? 'Picture without caption',
            resizeMode: 'center',
            style: [styles.imagePlaceholder, {width, height}],
          },
          [
            $(Image, {
              source: {uri},
              key: 'img',
              onLoad: this.onLoad,
              style: [styles.imageLoading, {width, height}],
            }),
          ],
        ),
      ]);
    }
  }
}
