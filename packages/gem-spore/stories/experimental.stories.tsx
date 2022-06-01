//
// Copyright 2022 DXOS.org
//

import { css } from '@emotion/css';
import * as d3 from 'd3';
import faker from 'faker';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Knobs, KnobsProvider, useButton } from '@dxos/esbuild-book-knobs';
import {
  D3Selection,
  FullScreen,
  Grid,
  SVG,
  SVGContextProvider,
  useZoom,
  useSvgContext,
  SVGContext,
  Fraction
} from '@dxos/gem-core';

export default {
  title: 'gem-spore/experimental'
};

// TODO(burdon): Generator for Kube/Bot data structure with dynamic mutation.
// TODO(burdon): Hierarchical layout.
// TODO(burdon): Illustrate swarm.

type Kube = {
  id: string
  bots: {
    id: string
  }[]
}

const styles = {
  svg: css`
    circle {
      stroke: #333;
      stroke-width: 0.5px;
    }

    g.kube {
      circle {
        fill: #FAFAFA;
      }
    }

    g.bot {
      circle {
        fill: lightblue;
      }
      text {
        font-size: 5px;
        font-family: monospace;
        fill: #666;
      }
    }
  `,

  knobs: css`
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 8px;
    border: 1px solid #CCC;
  `
};

/**
 * Arranges group elements in a circle.
 */
class CircularLayout {
  // Map of previous positions.
  private _map = new Map<string, number>();
  private _radius: Fraction = [1, 1];

  constructor (
    private readonly _context: SVGContext,
    private readonly _duraction = 1000
  ) {}

  get layout () {
    return this.doLayout.bind(this);
  }

  initialize (radius: Fraction) {
    this._radius = radius;
    return this;
  }

  doLayout (groups) {
    const objects = groups.data();
    const a = 2 * Math.PI / objects.length;
    const r = this._context.scale.model.toValue(this._radius);

    // Remove stale objects.
    const map = new Map<string, number>();
    objects.forEach(obj => map.set(obj.id, this._map.get(obj.id)));
    this._map = map;

    return groups.each((d, i, nodes) => {
      const previous = this._map.get(d.id) ?? i * a;
      d3.select(nodes[i])
        .transition()
        .duration(this._duraction)
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

// TODO(burdon): Factor out.
export class SuperMap<K, V> extends Map<K, V> {
  constructor (
    private readonly _factory: () => V
  ) {
    super();
  }

  get (k: K) {
    let value = super.get(k);
    if (!value) {
      value = this._factory();
      super.set(k, value);
    }

    return value;
  }
}

// TODO(burdon): Tween radius.
// TODO(burdon): Layout for bots.
// TODO(burdon): Create class.
class KubeRenderer {
  private _radius: Fraction = [3, 1];
  private readonly _kubeLayouts = new Map<string, CircularLayout>();

  constructor (
    private readonly _context: SVGContext
  ) {}

  get render () {
    return this.doRender.bind(this);
  }

  initialize (radius: Fraction) {
    this._radius = radius;
    return this;
  }

  doRender (group: D3Selection) {
    const r2 = this._context.scale.model.toValue(this._radius);

    // TODO(burdon): Factor out pattern?
    group
      .selectAll('circle.main')
      .data(d => [d])
      .join('circle')
      .attr('class', 'main')
      .attr('r', r2);

    // Draw bots.
    group
      .each((d, i, nodes) => {
        // TODO(burdon): Map util.
        let layout = this._kubeLayouts.get(d.id);
        if (!layout) {
          layout = new CircularLayout(this._context, 500).initialize(this._radius);
          this._kubeLayouts.set(d.id, layout);
        }

        d3.select(nodes[i])
          .selectAll<SVGGElement, Kube>('g.bot')
          .data((d: Kube) => d.bots, d => d.id)
          .join(
            enter => enter
              .append('g')
              .attr('class', 'bot'),
            update => update,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            remove => remove
              .call(el => el.selectAll('text').remove())
              .transition()
              .duration(500)
              .attr('transform', 'translate(0,0)')
              .attrTween('opacity', () => d3.interpolate(1, 0))
              .remove()
          )

          .call(layout.layout)

          .call(el => {
            const left = false;

            // TODO(burdon): Get left/right.
            // NOTE: getBoundingClientRect not available under rendered (attached to DOM).
            // console.log(el.node().getBoundingClientRect());
            // console.log(el.node().parentNode.getBBox());

            el.selectAll('circle')
              .data(d => [d])
              .join('circle')
              .attr('r', 2);

            el.selectAll('text')
              .data(d => [d])
              .join('text')
              .attr('dx', left ? -4 : 4)
              .style('text-anchor', left ? 'end' : 'start')
              .style('dominant-baseline', 'central')
              .text(d => d.id.substring(0, 4));
          });
      });
  }
}

const createObjects = (n = 5): Kube[] => Array.from({ length: n }).map(() => ({
  id: `kube-${faker.datatype.uuid()}`,
  bots: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }).map(() => ({ id: faker.datatype.uuid() }))
}));

const Container = () => {
  const context = useSvgContext();
  const zoom = useZoom({ extent: [1, 8], zoom: 4 });
  const groupRef = useRef();

  const layout = useMemo(() => new CircularLayout(context).initialize([2, 1]), []);
  const renderer = useMemo(() => new KubeRenderer(context).initialize([3, 5]), []);
  const [objects, setObjects] = useState<Kube[]>(() => createObjects(5));

  useButton('Reset', () => setObjects([]));
  useButton('Add', () => setObjects(objects => [...objects, ...createObjects(1)]));
  useButton('Remove', () =>
    setObjects(objects => objects.map(obj => faker.datatype.boolean() ? obj : undefined).filter(Boolean)));
  useButton('Mutate', () => {
    setObjects(objects => objects.map(({ bots, ...rest }) => ({
      bots: faker.datatype.boolean() ? bots : [
        // ...bots,
        ...bots.map(bot => faker.datatype.number(10) > 7 ? bot : undefined).filter(Boolean),
        ...Array.from({ length: faker.datatype.number(4) }).map(() => ({ id: faker.datatype.uuid() }))
      ],
      ...rest
    })));
  });

  useEffect(() => {
    // console.log(JSON.stringify(objects, undefined, 2));

    // Note: Don't do transitions inside join.
    // TODO(burdon): Wrap with class.
    d3.select(groupRef.current)
      .selectAll<SVGGElement, Kube>('g.kube')
      .data(objects, (d: Kube) => d.id)
      .join(
        enter => enter
          .append('g')
          .attr('class', 'kube')
          .call(renderer.render)
          // TODO(burdon): Change eslint config for D3.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .call(el => el
            .selectAll('*')
            .transition()
            .duration(1000)
            .attrTween('opacity', () => d3.interpolate(0, 1))),
        update => update
          .call(renderer.render),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        remove => remove
          .transition()
          .duration(1000)
          .attrTween('opacity', () => d3.interpolate(1, 0))
          .remove()
      )
      .call(layout.layout);
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
