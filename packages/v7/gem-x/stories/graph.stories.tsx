//
// Copyright 2020 DXOS.org
//

import * as d3 from 'd3';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { css } from '@emotion/css';

import {
  FullScreen,
  GraphForceProjector,
  GraphRenderer,
  Part,
  Surface,
  Scene,
  StatsProjector,
  StatsRenderer,
  SvgContainer,
  useScale
} from '../src';

import {
  TestModel,
  createModel,
  graphMapper,
  statsMapper,
  updateModel
} from './helpers';

export default {
  title: 'gem-x/Graph'
};

const styles = {
  stats: css`
    text {
      font-family: monospace;
      font-size: 18px;
      fill: #999;
    }
  `,

  graph: css`
    circle {
      stroke: seagreen;
      fill: #FFF;
    }
    path {
      stroke: orange;
      fill: none;
    }
  `
};

export const Primary = () => {
  const ref = useRef<SVGSVGElement>();
  const graphRef = useRef<SVGSVGElement>();
  const statsRef = useRef<SVGSVGElement>();
  const model = useMemo(() => createModel(2), []);
  const [scene, setScene] = useState<Scene<TestModel>>();
  const scale = useScale({ gridSize: 32 });

  useEffect(() => {
    const svg = ref.current;

    const scene = new Scene<TestModel>([
      new Part<TestModel, any>(
        new GraphForceProjector(graphMapper),
        new GraphRenderer(new Surface(svg, d3.select(graphRef.current).node()))),
      new Part<TestModel, any>(
        new StatsProjector(statsMapper),
        new StatsRenderer(new Surface(svg, d3.select(statsRef.current).node())))
    ]);

    const interval = setInterval(() => {
      if (model.items.length < 200) {
        updateModel(model);
        scene.update(model);
      }
    }, 50);

    scene.start();
    setScene(scene);

    return () => {
      clearInterval(interval);
      scene.stop();
    }
  }, [ref]);

  return (
    <FullScreen style={{ backgroundColor: '#F9F9F9' }}>
      <SvgContainer
        ref={ref}
        grid
        zoom={[1/4, 8]}
        zoomRoot={graphRef}
        scale={scale}
      >
        <g className={styles.graph} ref={graphRef} />
        <g className={styles.stats} ref={statsRef} />
      </SvgContainer>
    </FullScreen>
  );
}
