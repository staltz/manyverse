import {run} from '@cycle/run';
import {makeScreenDriver} from '@cycle/native-screen';
import {main} from './lib/main';
import onionify from 'cycle-onionify';
import {statusBarDriver} from './lib/drivers/statusBarAndroid';

run(onionify(main), {
  screen: makeScreenDriver('MMMMM'),
  statusBarAndroid: statusBarDriver
});
