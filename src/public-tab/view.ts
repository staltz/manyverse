import xs, {Stream} from 'xstream';
import {PureComponent} from 'react';
import {View, FlatList, Text, TouchableHighlight} from 'react-native';
import {h} from '@cycle/native-screen';
import {Palette} from '../global-styles/palette';
import Message from '../components/Message';
import {Msg} from '../types';

export default function view(feed$: Stream<Msg>) {
  const vdom$ = feed$
    .fold((arr, msg) => arr.concat(msg), [] as Array<Msg>)
    .map(arr => arr.slice().reverse())
    .map(feed =>
      h(FlatList, {
        data: feed,
        keyExtractor: (item: any, index: number) => item.key || String(index),
        renderItem: ({item}: {item: Msg}) => h(Message, {msg: item})
      })
    );

  return vdom$;
}
