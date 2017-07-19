import {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {Msg} from '../types';

export const styles = StyleSheet.create({
  messageWrapper: {
    backgroundColor: Palette.brand.voidBackground,
    paddingTop: Dimensions.verticalSpaceNormal * 0.5,
    paddingBottom: Dimensions.verticalSpaceNormal * 0.5
  },

  messageCard: {
    elevation: 2,
    backgroundColor: Palette.brand.contentBackground,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'column'
  },

  messageHeaderRow: {
    flexDirection: 'row',
    flex: 1
  },

  messageAuthorImage: {
    height: 50,
    width: 50,
    borderRadius: 3,
    backgroundColor: Palette.blue3,
    marginRight: Dimensions.horizontalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall
  },

  messageHeaderAuthorColumn: {
    flexDirection: 'column',
    flex: 1
  },

  flexRow: {
    flexDirection: 'row',
    flex: 1
  },

  messageHeaderAuthorName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.text
  },

  messageHeaderTimestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak
  },

  metadataBox: {
    flex: 1,
    backgroundColor: Palette.brand.metadataBackground,
    padding: 5,
    borderRadius: 2
  },

  metadataText: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.brand.metadataText,
    fontFamily: Typography.fontFamilyMonospace
  }
});

export class MessageHeader extends PureComponent<{msg: Msg}> {
  render() {
    const {msg} = this.props;

    const messageHeaderAuthorName = h(View, {style: styles.flexRow}, [
      h(
        Text,
        {
          numberOfLines: 1,
          ellipsizeMode: 'middle',
          style: styles.messageHeaderAuthorName
        },
        msg.value.author
      )
    ]);

    const messageHeaderTimestamp = h(View, {style: styles.flexRow}, [
      h(
        Text,
        {style: styles.messageHeaderTimestamp},
        String(msg.value.timestamp)
      )
    ]);

    return h(View, {style: styles.messageHeaderRow}, [
      h(View, {style: styles.messageAuthorImage}),
      h(View, {style: styles.messageHeaderAuthorColumn}, [
        messageHeaderAuthorName,
        messageHeaderTimestamp
      ])
    ]);
  }
}

export class Metadata extends PureComponent<{msg: any}> {
  render() {
    const {msg} = this.props;
    return h(View, {style: styles.metadataBox}, [
      h(Text, {style: styles.metadataText}, JSON.stringify(msg, null, 2))
    ]);
  }
}

export class MessageContainer extends PureComponent<{}> {
  render() {
    return h(View, {style: styles.messageWrapper}, [
      h(View, {style: styles.messageCard}, this.props.children as any)
    ]);
  }
}

export class UnknownMessage extends PureComponent<{msg: any}> {
  render() {
    const {msg} = this.props;
    return h(MessageContainer, [h(Metadata, {msg})]);
  }
}

export default class Message extends PureComponent<{msg: Msg}> {
  render() {
    const {msg} = this.props;
    if (!msg.key) {
      return h(UnknownMessage, {msg});
    }
    return h(MessageContainer, [h(MessageHeader, {msg}), h(Metadata, {msg})]);
  }
}
