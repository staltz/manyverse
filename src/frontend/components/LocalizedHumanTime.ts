/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {t} from '../drivers/localization';

type Measure = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'now';

function human(seconds: number | Date): [number, Measure, boolean] {
  let sec: number = seconds as number;
  if (seconds instanceof Date) {
    sec = Math.round((Date.now() - seconds.getTime()) / 1000);
  }
  const inTheFuture = sec < 0;
  sec = Math.abs(sec);

  const measures: Array<Measure> = [
    'year',
    'month',
    'week',
    'day',
    'hour',
    'minute',
    'now',
  ];
  const times = [
    sec / 60 / 60 / 24 / 365, // years
    sec / 60 / 60 / 24 / 31, // months
    sec / 60 / 60 / 24 / 7, // weeks
    sec / 60 / 60 / 24, // days
    sec / 60 / 60, // hours
    sec / 60, // minutes
    sec, // seconds
  ];

  for (let i = 0; i < measures.length; i++) {
    const time = Math.floor(times[i]);
    const measure: Measure = measures[i];
    if (time >= 1) return [time, measure, inTheFuture];
  }
  return [0, 'now', false];
}

export type Props = {
  time: number;
  period?: number;
};

export type State = {
  formattedTime: string;
};

export default class LocalizedHumanTime extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  private _timer: any;

  private translateTime(time: number): string {
    const [count, m, inTheFuture] = human(new Date(time));
    const x = {count};
    if (inTheFuture) {
      if (m === 'year') return t('date.relative.future.years', x);
      if (m === 'month') return t('date.relative.future.months', x);
      if (m === 'week') return t('date.relative.future.weeks', x);
      if (m === 'day') return t('date.relative.future.days', x);
      if (m === 'hour') return t('date.relative.future.hours', x);
      if (m === 'minute') return t('date.relative.future.minutes', x);
      if (m === 'now') return t('date.relative.future.now');
    } else {
      if (m === 'year') return t('date.relative.past.years', x);
      if (m === 'month') return t('date.relative.past.months', x);
      if (m === 'week') return t('date.relative.past.weeks', x);
      if (m === 'day') return t('date.relative.past.days', x);
      if (m === 'hour') return t('date.relative.past.hours', x);
      if (m === 'minute') return t('date.relative.past.minutes', x);
      if (m === 'now') return t('date.relative.past.now');
    }
    return '';
  }

  private getStateFromProps(props: Props) {
    return {
      formattedTime: this.translateTime(props.time),
    };
  }

  public componentDidMount() {
    this._timer = setInterval(
      () => this.setState(this.getStateFromProps(this.props)),
      this.props.period || 30e3,
    );
  }

  public UNSAFE_componentWillUnmount() {
    clearInterval(this._timer);
  }

  public render() {
    return this.state.formattedTime as any;
  }
}
