// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import FWMD from 'fix-webm-duration';
const fixWebmDuration = require('fix-webm-duration') as typeof FWMD;
import {Command, Response} from './types';
import FS = require('fs');
import Path = require('path');
import OS = require('os');

interface MyAnalyser extends AnalyserNode {
  _kill(): void;
}

interface Recorder {
  mediaRecorder: MediaRecorder;
  mediaStreamSource: MediaStreamAudioSourceNode;
  analyser: MyAnalyser;
}

function setupMeterAnalyser(
  analyser: MyAnalyser,
  mediaStreamSource: MediaStreamAudioSourceNode,
  cb: (value: number, rawValue: number) => void,
) {
  const MID_VALUE = 128;
  const MAX_AMPLITUDE = 128;
  analyser.fftSize = 128;
  const bufferLength = analyser.frequencyBinCount;

  let interval = setInterval(() => {
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    let maxDeviation = 0;
    for (const x of dataArray) {
      const deviation = Math.abs(x - MID_VALUE);
      if (deviation > maxDeviation) maxDeviation = deviation;
    }
    const amp = maxDeviation / MAX_AMPLITUDE;
    // To mimic react-native-audio-toolkit, "rawValue" should be in
    // the range [0, 2**16)
    const rawValue = Math.round(amp * 2 ** 15);
    // `20*log10(amp)` is usually the formula to calculate decibels
    // but here we are cheating a bit to get closer to the values that
    // react-native-audio-toolkit gives us, which is the range [-64, 0)
    const value = Math.min(Math.max(-64, 28 * Math.log10(amp)), 0);
    cb(value, rawValue);
  }, 60);

  analyser._kill = () => {
    clearInterval(interval);
  };

  mediaStreamSource.connect(analyser);
}

export function makeRecorderDriver() {
  const audioContext: AudioContext = new window.AudioContext();
  const recs = new Map<string, Recorder>();
  const res$ = xs.create<Response>();

  if (!navigator.mediaDevices) {
    throw new Error('No media devices available for recorderDriver');
  }

  return function recorderDriver(sink$: Stream<Command>): Stream<Response> {
    sink$.addListener({
      next: async (cmd) => {
        if (cmd.type === 'prepare') {
          if (recs.has(cmd.filename)) {
            console.error('cannot prepare Recorder twice');
            return;
          }
          if (cmd.opts?.format !== 'webm') {
            throw new Error('only webm supported');
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const mimeType = 'audio/webm;codecs=opus';
          const mediaRecorder = new MediaRecorder(stream, {mimeType});
          const mediaStreamSource =
            audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser() as MyAnalyser;
          setupMeterAnalyser(analyser, mediaStreamSource, (value, rawValue) => {
            res$._n({type: 'meter', value, rawValue});
          });
          const path = Path.join(OS.tmpdir(), cmd.filename);
          recs.set(cmd.filename, {mediaRecorder, mediaStreamSource, analyser});

          let startTime = Date.now();
          let duration = 0;
          mediaRecorder.onerror = (event: any) => {
            res$._e(event);
          };
          mediaRecorder.onstart = () => {
            startTime = Date.now();
            res$._n({type: 'recording', filename: cmd.filename});
          };
          mediaRecorder.onstop = () => {
            duration = Date.now() - startTime;
          };
          mediaRecorder.ondataavailable = async (event: any) => {
            if (!duration) duration = Date.now() - startTime;
            const buggyBlob = event.data as Blob;
            try {
              const goodBlob = await fixWebmDuration(buggyBlob, duration, {
                logger: false,
              });
              const arrayBuffer = await goodBlob.arrayBuffer();
              const buf = Buffer.from(arrayBuffer);
              await FS.promises.writeFile(path, buf);
              res$._n({type: 'recorded', filename: cmd.filename});
            } catch (err) {
              res$._e(err);
            }
          };

          res$._n({type: 'prepared', filename: cmd.filename, path});
          return;
        }

        if (cmd.type === 'record') {
          if (!recs.has(cmd.filename)) {
            console.error(
              `cannot record ${cmd.filename} because we have not prepared it`,
            );
            return;
          }
          const rec = recs.get(cmd.filename)!;
          rec.mediaRecorder.start();
          return;
        }

        if (cmd.type === 'stop') {
          if (!recs.has(cmd.filename)) {
            console.error(
              `cannot stop ${cmd.filename} because we have not prepared it`,
            );
            return;
          }
          const rec = recs.get(cmd.filename)!;
          rec.mediaRecorder.stop();
          return;
        }

        if (cmd.type === 'destroy') {
          if (!recs.has(cmd.filename)) {
            console.warn(
              `cannot destroy ${cmd.filename} because we have not prepared it`,
            );
            return;
          }
          const rec = recs.get(cmd.filename)!;
          rec.analyser._kill();
          rec.analyser.disconnect();
          rec.mediaStreamSource.disconnect();
          rec.analyser = null as any;
          rec.mediaRecorder = null as any;
          rec.mediaStreamSource = null as any;
          recs.delete(cmd.filename);
          res$._n({type: 'destroyed', filename: cmd.filename});
          return;
        }
      },
    });

    return res$;
  };
}
