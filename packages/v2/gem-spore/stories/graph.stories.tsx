//
// Copyright 2020 DXOS.org
//

import * as d3 from 'd3';
import React, { useEffect, useMemo, useRef } from 'react';

import { useButton, useKnobs } from '@dxos/esbuild-book-knobs';
import { FullScreen, SvgContainer, SvgContext, useGrid, useStateRef, useZoom } from '@dxos/gem-core';

import { GraphForceProjector, GraphRenderer, Part, Surface, Scene } from '../src';
import { styles } from './helpers';

import {
  TestModel,
  createModel,
  graphMapper,
  updateModel
} from './helpers';

export default {
  title: 'gem-x/Graph'
};

export const Primary = () => {
  const context = useMemo(() => new SvgContext(), []);
  const gridRef = useGrid(context, { axis: false });
  const zoomRef = useZoom(context);

  const statsRef = useRef<SVGSVGElement>();
  const model = useMemo(() => createModel(2), []);
  const [scene, setScene, sceneRef] = useStateRef<Scene<TestModel>>();
  const Knobs = useKnobs();

  useButton('Test', () => {
    updateModel(model);
    sceneRef.current.update(model);
  });

  useEffect(() => {
    const scene = new Scene<TestModel>([
      new Part<TestModel, any, any>(
        new GraphForceProjector(graphMapper),
        new GraphRenderer(new Surface(context.svg, d3.select(zoomRef.current).node()))
      )
    ]);

    const interval = setInterval(() => {
      if (model.items.length < 200) {
        updateModel(model);
        scene.update(model);
      }
    }, 10);

    scene.start();
    setScene(scene);

    return () => {
      clearInterval(interval);
      scene.stop();
    }
  }, []);

  return (
    <FullScreen>
      <SvgContainer context={context}>
        <g ref={gridRef} className={styles.grid} />
        <g ref={zoomRef} className={styles.graph} />
        <g ref={statsRef} className={styles.stats} />
      </SvgContainer>

      <Knobs className={styles.knobs} />
    </FullScreen>
  );
}
