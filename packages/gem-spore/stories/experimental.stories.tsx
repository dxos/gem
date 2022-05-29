//
// Copyright 2022 DXOS.org
//

import { css } from '@emotion/css';
import * as d3 from 'd3';
import React, { FC, useEffect, useMemo, useRef } from 'react';

import {
  D3Callable, D3Selection, FullScreen, Grid, SVG, SVGContextProvider, useZoom, useSvgContext
} from '@dxos/gem-core';

export default {
  title: 'gem-spore/experimental'
};

// TODO(burdon): Zoom.
// TODO(burdon): Layout.
// TODO(burdon): Reentrant create and update shapes.
// TODO(burdon): Shape polymorphism; anchor position/connection points.

const one = (type: string, className: string, callable: D3Callable) => (group) => {
  group
    .selectAll(`${type}.${className}`)
    .data([1])
    .join(type)
    .attr('class', className)
    .call(callable);
};

const styles = css`
  circle.connector {
    fill: orange;
    stroke: #333;
    stroke-width: 0.5px;
    opacity: 0.8;
  }   
  circle {
    fill: none;
    stroke: #333;
    stroke-width: 0.5px;
  }
  rect {
    fill: #FFF;
    stroke: #333;
    stroke-width: 0.5px;
  }
`;

const drawRect: D3Callable = (group: D3Selection, context, object) => {
  const connectors = ['n', 's', 'w', 'e'];

  const [x, y] = context.scale.model.toPoint(object);
  const [width, height] = context.scale.model.toPoint({
    x: [1, 2],
    y: [-1, 2]
  });

  const pos = d => {
    return {
      'n': [0, -1],
      's': [0, 1],
      'w': [-1, 0],
      'e': [1, 0]
    }[d] ?? [0, 0];
  };

  group
    .selectAll('circle.root')
    .data([1])
    .join('rect')
    .attr('class', 'root')
    .attr('x', x - width / 2)
    .attr('y', y - height / 2)
    .attr('width', width)
    .attr('height', height);

  group
    .selectAll('circle.connector')
    .data(connectors)
    .join('circle')
    .attr('class', 'connector')
    .attr('cx', d => x + pos(d)[1] * width / 2)
    .attr('cy', d => y + pos(d)[0] * height / 2)
    .attr('r', 2);
};

const Surface: FC<{
  objects: any[]
}> = ({
  objects = []
}) => {
  const context = useSvgContext();
  const zoom = useZoom({ extent: [1, 8], zoom: 4 });
  const groupRef = useRef();

  useEffect(() => {
    d3.select(groupRef.current)
      .selectAll('g')
      .data(objects)
      .join('g')
      .each((object, i, nodes) => {
        const el = d3.select(nodes[i]);
        el.call(drawRect, context, object);
      });
  }, []);

  return (
    <g ref={zoom.ref}>
      <g ref={groupRef} className={styles} />
    </g>
  );
};

const createObjects = (n = 3) => {
  const objects = [];
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      objects.push({
        x: [x - Math.floor(n / 2), 1],
        y: [y - Math.floor(n / 2), 1]
      });
    }
  }

  return objects;
};

export const Primary = () => {
  const objects = useMemo(() => createObjects(5), []);

  return (
    <FullScreen>
      <SVGContextProvider>
        <SVG>
          <Grid axis />
          <Surface
            objects={objects}
          />
        </SVG>
      </SVGContextProvider>
    </FullScreen>
  );
};
