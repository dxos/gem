//
// Copyright 2020 DXOS.org
//

import faker from 'faker';
import times from 'lodash.times';
import React, { useState } from 'react';
import useResizeAware from 'react-resize-aware';

import { FullScreen, SVG, Grid, useGrid, createLink } from '@dxos/gem-core';

import Stack from './stack/components/Stack';

export default {
  title: 'Stack'
};

/**
 * Grid component.
 */
export const withStack = () => {
  const [resizeListener, size] = useResizeAware();
  const grid = useGrid({ ...size, zoom: 1 });
  const { width, height } = size;

  const options = {
    points: 6,
    numValidators: 6,
    numFull: 5,
    numIpfs: 4,
    numSignal: 3
  };

  // TODO(burdon): Pass in model, incl. animation state (e.g., open, closed).
  const [data] = useState(() => {
    const nodes = [
      { type: 'root', id: faker.random.uuid() },

      ...times(options.numValidators, (i) => ({
        type: 'validator',
        id: faker.random.uuid(),
        pos: { x: 1, i, n: options.points }
      })),

      ...times(options.numFull, (i) => ({
        type: 'full',
        id: faker.random.uuid(),
        pos: { x: 2, i, n: options.points }
      })),

      ...times(options.numIpfs, (i) => ({
        type: 'ipfs',
        id: faker.random.uuid(),
        pos: { x: 3, i, n: options.points }
      })),

      ...times(options.numSignal, (i) => ({
        type: 'signal',
        id: faker.random.uuid(),
        pos: { x: 4, i, n: options.points }
      })),
    ];

    return {
      nodes,
      links: nodes.map(node => node.type === 'validator' && createLink(nodes[0], node)).filter(Boolean)
    };
  });

  return (
    <FullScreen>
      {resizeListener}
      <SVG width={width} height={height}>
        <Grid grid={grid} showGrid={true} />
        <Stack grid={grid} data={data} />
      </SVG>
    </FullScreen>
  );
};
