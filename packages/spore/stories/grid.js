//
// Copyright 2020 DXOS.org
//

import React from 'react';
import useResizeAware from 'react-resize-aware';

import { FullScreen, SVG, Grid, useGrid } from '@dxos/gem-core';

export default {
  title: 'Grid'
};

/**
 * Grid component.
 */
export const withGrid = () => {
  const [resizeListener, size] = useResizeAware();
  const grid = useGrid(size);
  const { width, height } = size;

  return (
    <FullScreen>
      {resizeListener}
      <SVG width={width} height={height}>
        <Grid grid={grid} showAxis={true} showGrid={true} />
      </SVG>
    </FullScreen>
  );
};
