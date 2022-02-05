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

  stats: css`
    text {
      font-family: monospace;
      font-size: 18px;
      fill: #999;
    }
  `,

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

  linker: css`
    .linker {
      path {
        stroke: orange;
        stroke-dasharray: 10, 5;
      }
    }
  `,

  grid: css`
    path.axis {
      stroke: #BBB;
    }
    path.major {
      stroke: #F0F0F0;
    }
    path.minor {
      stroke: #F5F5F5;
    }
  `,

  graph: css`
    .guides {
      circle {
        fill: #FAFAFA;
        stroke: coral;
        stroke-width: 4px;
        stroke-dasharray: 15, 5;
        opacity: 0.2;
      }
    }

    circle.bullet {
      stroke: none;
      fill: #999;
    }

    g.node {
      &.selected {
        circle {
          stroke: darkblue;
          fill: cornflowerblue;
        }
      }

      circle {
        stroke: seagreen;
        fill: #F5F5F5;
      }
      text {
        fill: #666
      }
    }

    path.link {
      stroke: orange;
      fill: none;
    }
  `
};
