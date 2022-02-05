//
// Copyright 2022 DXOS.org
//

import clsx from 'clsx';
import React, { useMemo } from 'react';

import { FullScreen, SvgContextProvider } from '@dxos/gem-core';

import {
  convertTreeToGraph,
  createTree, defaultGraphStyles,
  Graph, GraphNode,
  SVG,
  TestGraphModel,
  TestGraphModelAdapter,
  TestNode,
} from '../src';

export default {
  title: 'gem-x/Graph'
};

export const Primary = () => {
  const selected = useMemo(() => new Set(), []);
  const adapter = useMemo(
    () => new TestGraphModelAdapter(new TestGraphModel(convertTreeToGraph(createTree({ depth: 4 })))),
  []);

  // TODO(burdon): Selection, class names.
  // TODO(burdon): HOCs for Grid, Zoom, etc.
  return (
    <FullScreen>
      <SvgContextProvider>
        <SVG>
          <Graph
            className={clsx(defaultGraphStyles)}
            drag
            model={adapter}
            nodeClass={(node: GraphNode<TestNode>) => selected.has(node.id) ? 'selected' : undefined}
            onSelect={(node: GraphNode<TestNode>) => {
              if (selected.has(node.id)) {
                selected.delete(node.id);
              } else {
                selected.add(node.id);
              }

              adapter.model.update();
            }}
          />
        </SVG>
      </SvgContextProvider>
    </FullScreen>
  );
};
