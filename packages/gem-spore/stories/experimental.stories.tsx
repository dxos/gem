//
// Copyright 2022 DXOS.org
//

import { css } from '@emotion/css';
import * as d3 from 'd3';
import faker from 'faker';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Knobs, KnobsProvider, useButton } from '@dxos/esbuild-book-knobs';
import {
  D3Callable,
  D3Selection,
  FullScreen,
  Grid,
  SVG,
  SVGContextProvider,
  useZoom,
  useSvgContext,
  SVGContext,
  Fraction,
} from '@dxos/gem-core';

export default {
  title: 'gem-spore/experimental'
};

// TODO(burdon): Generator for Kube/Bot data structure with dynamic mutation.
// TODO(burdon): Hierarchical layout.
// TODO(burdon): Illustrate swarm.

type Obj = {
  id: string
  bots: string[]
}

const createObjects = (n = 5): Obj[] => Array.from({ length: n }).map(() => ({
  id: faker.datatype.uuid(),
  bots: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }).map(() => faker.datatype.uuid())
}));

// TODO(burdon): Factor out.
const createOne = (type: string, className: string, update: D3Callable) => (group) => {
  group
    .selectAll(`${type}.${className}`)
    .data([1])
    .join(type)
    .attr('class', className)
    .call(update);
};

const styles = {
  svg: css`
    circle {
      stroke: #333;
      stroke-width: 0.5px;
    }
    circle.kube {
      fill: #FAFAFA;
    }
    circle.bot {
      fill: lightblue;
    }
    text {
      font-size: 8px;
      font-family: monospace;
    }
  `,

  knobs: css`
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 8px;
    border: 1px solid gray;
  `
};

// TODO(burdon): Tween radius.
// TODO(burdon): Layout for bots.
const drawKube: D3Callable = (group: D3Selection, context, r, fade) => {
  const fadeIn = (d = 2000) => el => el
    .transition()
    .duration(d)
    .attrTween('opacity', () => d3.interpolate(0, 1));

  group
    .call(createOne('circle', 'kube', el => el.attr('r', r)));

  group
    .selectAll('circle.bot')
    .data(d => d.bots)
    .join('circle')
    .attr('class', 'bot')
    .attr('cx', (d, i, j) => {
      const a = i * Math.PI * 2 / j.length;
      return Math.sin(a) * r;
    })
    .attr('cy', (d, i, j) => {
      const a = i * Math.PI * 2 / j.length;
      return -Math.cos(a) * r;
    })
    .attr('r', 2);

  // TODO(burdon): Label.
  // group
  //   .call(createOne('text', 'kube', el => el
  //     .text(d => d.id)
  //     .attr('dy', 2)
  //     .style('text-anchor', 'middle')
  //   ));

  group
    .selectAll('circle')
    .call(el => el.call(fadeIn(fade ? 1000 : 0)));
};

/**
 * Arranges group elements in a circle.
 */
class CircularLayout {
  // Map of previous positions.
  private _map = new Map<string, number>();
  private _radius: Fraction = [1, 1];

  constructor (
    private readonly _context: SVGContext
  ) {}

  initialize (radius: Fraction) {
    this._radius = radius;
    return this;
  }

  layout (group) {
    const objects = group.data();
    const a = 2 * Math.PI / objects.length;
    const r = this._context.scale.model.toValue(this._radius);

    // Remove stale objects.
    const map = new Map<string, number>();
    objects.forEach(obj => map.set(obj.id, this._map.get(obj.id)));
    this._map = map;

    return group.each((d, i, nodes) => {
      const previous = this._map.get(d.id) ?? i * a;
      d3.select(nodes[i])
        .transition()
        .duration(1000)
        .attrTween('transform', () => {
          const arc = d3.interpolateNumber(previous, i * a);
          return t => {
            const a = arc(t);
            this._map.set(d.id, a);
            const x = Math.sin(a) * r;
            const y = Math.cos(a) * r;
            return `translate(${x},${-y})`;
          };
        });
    });
  }
}

const Container = () => {
  const context = useSvgContext();
  const zoom = useZoom({ extent: [1, 8], zoom: 4 });
  const groupRef = useRef();

  // TODO(burdon): Hierarchical layouts (separate from data structure).
  const layout = useMemo(() => new CircularLayout(context).initialize([2, 1]), []);
  const [objects, setObjects] = useState<Obj[]>(() => createObjects(5));

  useButton('Reset',
    () => setObjects([]));
  useButton('Add',
    () => setObjects(objects => [...objects, ...createObjects(1)]));
  useButton('Remove',
    () => setObjects(objects => objects.map(obj => faker.datatype.boolean() ? obj : undefined).filter(Boolean)));

  useEffect(() => {
    // TODO(burdon): Based on number of kubes.
    const r = context.scale.model.toValue([1, 3]);

    d3.select(groupRef.current)
      .selectAll<SVGGElement, Obj>('g.obj')
      .data(objects, (d: Obj) => d.id)
      .join(
        enter => enter
          .append('g')
          .attr('class', 'obj')
          .call(drawKube, context, r, true),
        update => update
          .call(drawKube, context, r),
        remove => remove
          .transition()
          .duration(1000)
          .attrTween('opacity', () => d3.interpolate(1, 0))
          .remove()
      )
      .call(layout.layout.bind(layout));
  }, [objects]);

  return (
    <g ref={zoom.ref}>
      <g ref={groupRef} className={styles.svg} />
    </g>
  );
};

export const Primary = () => {
  return (
    <FullScreen>
      <KnobsProvider>
        <SVGContextProvider>
          <SVG>
            <Grid axis />
            <Container />
          </SVG>
        </SVGContextProvider>
        <Knobs className={styles.knobs} />
      </KnobsProvider>
    </FullScreen>
  );
};
