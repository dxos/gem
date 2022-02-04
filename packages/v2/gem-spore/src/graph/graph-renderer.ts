//
// Copyright 2021 DXOS.org
//

import * as d3 from 'd3';
import clsx from 'clsx';

import { D3Callable, Point } from '@dxos/gem-core';

import { Renderer } from '../scene';
import { trigger } from './bullets';
import { Graph, GraphLink, GraphNode } from './defs';
import { getCircumferencePoints } from './util';

const line = d3.line();

export type GraphLayout = {
  graph: Graph
  guides?: {
    circles?: {
      cx: number
      cy: number
      r: number
    }[]
  }
}

export type GraphRendererOptions = {
  drag?: D3Callable
  label?: (node: GraphNode<any>) => string
  bullets?: boolean
  arrows?: {
    start?: boolean
    end?: boolean
  }
  nodeClass?: (node: GraphNode<any>) => string
  linkClass?: (link: GraphLink) => string
}

/**
 * Renders the Graph layout.
 */
export class GraphRenderer extends Renderer<GraphLayout, GraphRendererOptions> {

  // TODO(burdon): Factor out?
  updateLink (source?: GraphNode<any>, target?: GraphNode<any>, point?: Point) {
    const root = d3.select(this.root);

    root.selectAll('g.linker')
      .data([{ id: 'linker' }])
      .join('g')
      .attr('class', 'linker')

      .selectAll<SVGPathElement, any>('path')
      .data(source ? [{ id: 'link' }] : [])
      .join('path')
      .attr('marker-end', () => target ? 'url(#marker-arrow-end)' : 'url(#marker-dot)')
      .attr('d', d => {
        return line(
          getCircumferencePoints(
            [source.x, source.y],
            target ? [target.x, target.y] : point,
            source.r,
            target ? target.r : 1
          )
        );
      });
  }

  update (layout: GraphLayout) {
    const { graph, guides } = layout || {};
    const root = d3.select(this.root);

    //
    // Guides
    //

    root.selectAll('g.guides')
      .data([{ id: 'guides' }])
      .join('g')
      .attr('class', 'guides')

      .selectAll<SVGCircleElement, { cx: number, cy: number, r: number }>('circle')
        .data(guides?.circles || [])
        .join('circle')
        .attr('cx', d => d.cx)
        .attr('cy', d => d.cy)
        .attr('r', d => d.r);

    //
    // Links
    //

    const linkGroup = root.selectAll('g.links')
      .data([{ id: 'links' }])
      .join('g')
      .attr('class', 'links');

    // Create links.
    const links = linkGroup.selectAll<SVGPathElement, GraphLink>('path.link')
      .data(graph?.links || [], d => d.id)
      .join('path')
      .attr('class', d => clsx('link', this.options.linkClass?.(d)))
      .attr('d', d => {
        if (!d.source.initialized || !d.target.initialized) {
          return;
        }

        return line(
          getCircumferencePoints(
            [d.source.x, d.source.y],
            [d.target.x, d.target.y],
            d.source.r,
            d.target.r
          )
        );
      });

    if (this.options.arrows?.start) {
      links.attr('marker-start', () => 'url(#marker-arrow-start)');
    }
    if (this.options.arrows?.end) {
      links.attr('marker-end', () => 'url(#marker-arrow-end)');
    }

    //
    // Nodes
    //

    const nodeGroup = root.selectAll('g.nodes')
      .data([{ id: 'nodes' }])
      .join('g')
      .attr('class', 'nodes');

    // Create nodes.
    const nodes = nodeGroup.selectAll<SVGCircleElement, GraphNode<any>>('g.node')
      .data(graph?.nodes || [], d => d.id)
      .join(
        enter => {
          const g = enter.append('g');

          const circle = g.append('circle');
          if (this.options.drag) {
            circle.call(this.options.drag);
          }

          if (this.options.label) {
            g.append('text');
          }

          return g;
        },
        update => update,
        exit => {
          exit.remove();
        }
      )
      .attr('class', d => clsx('node', this.options.nodeClass?.(d)));

    // Update labels.
    if (this.options.label) {
      nodes.selectAll<SVGTextElement, GraphNode<any>>('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .style('text-anchor', d => (d.x >= 0) ? 'start' : 'end')
        .style('dominant-baseline', 'central')
        .attr('dx', d => (d.r + 4) * (d.x >= 0 ? 1 : -1))
        .text(d => this.options.label(d));
    }

    // Update circles.
    const circles = nodes.selectAll<SVGCircleElement, GraphNode<any>>('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r);

    // Fire bullets.
    // TODO(burdon): Factor out.
    if (this.options.bullets) {
      circles.on('click', function () {
        const node = d3.select<SVGGElement, GraphNode<any>>(this as SVGGElement);
        // TODO(burdon): Create group for bullets.
        linkGroup.call(trigger(root.node(), node.datum().id));
      });
    }
  }
}
