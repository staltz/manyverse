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

import {Component} from 'react';

/**
 * Use this interface to setup your React component for periodic forced
 * rendering.
 */
export interface PeriodicRendering {
  periodicRenderingInterval: any;
}

type PeriodicallyRenderedComponent = Component<any, any> & PeriodicRendering;

/**
 * Attach periodic rendering logic to a React component. Call this function in
 * `componentDidMount`.
 *
 * @param that React component instance (`this` keyword, when inside
 * `componentDidMount`)
 * @param period the period in milliseconds (default: 30 seconds)
 */
export function attachPeriodicRendering(
  that: PeriodicallyRenderedComponent,
  period: number = 30e3,
) {
  that.periodicRenderingInterval = setInterval(
    () => that.forceUpdate(),
    period,
  );
}

/**
 * Detach periodic rendering logic from a React component. Call this function in
 * `componentWillUnmount`.
 *
 * @param that React component instance (`this` keyword, when inside
 * `componentWillUnmount`)
 */
export function detachPeriodicRendering(that: PeriodicallyRenderedComponent) {
  clearInterval(that.periodicRenderingInterval);
}
