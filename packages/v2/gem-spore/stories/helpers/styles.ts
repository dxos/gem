//
// Copyright 2020 DXOS.org
//

import { css } from '@emotion/css';

export const styles = {
  knobs: css`
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 8px;
  `,

  // TODO(burdon): Factor out.
  markers: css`
    marker {
      &.arrow path {
        stroke: orange;
        stroke-width: 1px;
        fill: none;
      }
      &.dot circle {
        stroke: orange;
        stroke-width: 2px;
        fill: #FFF;
      }
    }
  `,

  // TODO(burdon): Factor out.
  linker: css`
    .linker {
      path {
        stroke: orange;
        stroke-dasharray: 10, 5;
      }
    }
  `
};
