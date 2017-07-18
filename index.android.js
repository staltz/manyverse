import {run} from '@cycle/run';
import {makeScreenDriver} from '@cycle/native-screen';
import {main} from './lib/main';
import onionify from 'cycle-onionify';

run(onionify(main), {
  Screen: makeScreenDriver('MMMMM')
});
