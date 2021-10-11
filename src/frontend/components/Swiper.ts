// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {createRef, PureComponent, RefObject} from 'react';
import {Dimensions} from 'react-native';
import {h} from '@cycle/react';
import {SwiperProps} from 'react-native-swiper';
import Carousel, {CarouselSlideRenderControlProps} from 'nuka-carousel';

export default class Swiper extends PureComponent<SwiperProps> {
  private ref: RefObject<CarouselSlideRenderControlProps> = createRef();

  public scrollBy(delta: number) {
    if (delta === 1) {
      this.ref.current?.nextSlide();
    } else if (delta === -1) {
      this.ref.current?.previousSlide();
    } else {
      throw new Error('Web Swiper does not support large scrollBy');
    }
  }

  public render() {
    const {
      horizontal,
      loop,
      children,
      activeDotColor,
      onIndexChanged,
    } = this.props;
    return h(
      Carousel,
      {
        ['ref' as any]: this.ref as any,
        vertical: !horizontal,
        wrapAround: loop,
        autoGenerateStyleTag: false,
        afterSlide: onIndexChanged,
        heightMode: 'max',
        height: '100%',
        swiping: false,
        dragging: false,
        initialSlideHeight: Dimensions.get('window').height * 0.7,
        className: 'custom-swiper',
        defaultControlsConfig: {
          nextButtonStyle: {display: 'none'},
          prevButtonStyle: {display: 'none'},
          pagingDotsStyle: {
            fill: activeDotColor,
          },
        },
      },
      Array.isArray(children) ? children : [children],
    );
  }
}
