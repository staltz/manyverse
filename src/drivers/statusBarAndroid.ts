import {Stream} from 'xstream';
const StatusBarAndroid = require('react-native-android-statusbar');

export function statusBarDriver(color$: Stream<string>): void {
  color$.addListener({
    next: (color: string) => {
      StatusBarAndroid.setHexColor(color);
    }
  });
}
