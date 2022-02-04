//
// Copyright 2020 DXOS.org
//

import clsx from 'clsx';
import * as d3 from 'd3';
import React, { useEffect, useMemo, useRef } from 'react';

import { Knobs, KnobsProvider, useButton } from '@dxos/esbuild-book-knobs';
import { FullScreen, SvgContextProvider, useGrid, useSvgContext, useZoom } from '@dxos/gem-core';

import { GraphForceProjector, GraphNode, GraphRenderer, createMarkers, createSimulationDrag } from '../src';
import { styles, TestItem } from './helpers';

import {
  TestModel,
  createModel,
  graphMapper,
  updateModel
} from './helpers';

export default {
  title: 'gem-x/Graph'
};

// TODO(burdon): Dynamic classname for nodes (e.g., based on selection).
// TODO(burdon): Create links.
// TODO(burdon): Delete nodes (alt-click).

interface ComponentProps {
  model: TestModel
}

const PrimaryComponent = ({ model }: ComponentProps) => {
  const context = useSvgContext();
  const grid = useGrid();
  const zoom = useZoom();

  const { projector, renderer } = useMemo(() => ({
    projector: new GraphForceProjector(context, graphMapper),
    renderer: new GraphRenderer(context, zoom.ref)
  }), []);

  useEffect(() => {
    projector.updated.on(({ layout }) => {
      renderer.update(layout);
    });

    projector.update(model);
    projector.start();

    const interval = setInterval(() => {
      if (model.items.length < 200) {
        updateModel(model); // TODO(burdon): Subscription.
        projector.update(model);
      }
    }, 10);

    return () => {
      clearInterval(interval);
      projector.stop();
    }
  }, []);

  return (
    <svg ref={context.ref}>
      <g ref={grid.ref} className={styles.grid} />
      <g ref={zoom.ref} className={styles.graph} />
    </svg>
  );
};

const SecondaryComponent = ({ model }: ComponentProps) => {
  const context = useSvgContext();
  const grid = useGrid();
  const zoom = useZoom({ extent: [1, 2] });
  const markersRef = useRef<SVGGElement>();

  useButton('Test', () => {
    updateModel(model); // TODO(burdon): Subscription.
    projector.update(model);
  });

  const { projector, renderer } = useMemo(() => {
    const projector = new GraphForceProjector(context, graphMapper, {
      guides: true,
      forces: {
        manyBody: {
          strength: (count: number) => -100 -(count * 30)
        },
        center: true,
        link: {
          distance: 60
        }
      }
    });

    // TODO(burdon): Create class?
    const drag = createSimulationDrag(context, projector._simulation, {
      onSelect: (target) => {
        console.log('select', target);
      },
      onDrag: (source, target, point) => {
        renderer.updateLink(source, target, point);
      },
      onDrop: (source, target) => {
        renderer.updateLink();
        if (target) {
          const parent = model.items.find(item => item.id === source.id);
          const child = model.items.find(item => item.id === target.id);
          parent.children.push(target.id);
          child.parent = parent.id;
          projector.update(model);
        }
      }
    });

    const renderer = new GraphRenderer(context, zoom.ref, {
      drag,
      label: node => node.id.substring(0, 4),
      nodeClass: (n: GraphNode<TestItem>) => n.data.type === 'org' ? 'selected' : undefined,
      bullets: true,
      arrows: {
        end: true
      }
    });

    return {
      projector,
      renderer
    };
  }, []);

  useEffect(() => {
    projector.updated.on(({ layout }) => {
      renderer.update(layout);
    });

    projector.update(model);
    projector.start();

    return () => {
      projector.stop();
    }
  }, []);

  useEffect(() => {
    projector.update(model);
  }, [model]);

  useEffect(() => {
    d3.select(markersRef.current).call(createMarkers());
  }, [markersRef]);

  return (
    <svg ref={context.ref}>
      <g ref={markersRef} className={styles.markers} />
      <g ref={grid.ref} className={styles.grid} />
      <g ref={zoom.ref} className={clsx(styles.graph, styles.linker)} />
    </svg>
  );
};

export const Primary = () => {
  const model = useMemo(() => createModel(3), []);

  return (
    <FullScreen>
      <SvgContextProvider>
        <PrimaryComponent model={model} />
      </SvgContextProvider>
    </FullScreen>
  );
}

export const Secondary = () => {
  const model = useMemo(() => createModel(3), []);

  return (
    <FullScreen>
      <KnobsProvider>
        <SvgContextProvider>
          <SecondaryComponent model={model} />
        </SvgContextProvider>
        <Knobs className={styles.knobs} />
      </KnobsProvider>
    </FullScreen>
  );
}
