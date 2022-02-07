//
// Copyright 2022 DXOS.org
//

import faker from 'faker';

import { GraphBuilder } from './model';
import { TestNode } from '../testing';

describe('GraphModel tests.', () => {
  test('builder', () => {
    const model = new GraphBuilder<TestNode>()
      .addNode({ id: faker.datatype.uuid() })
      .addNode({ id: faker.datatype.uuid() })
      .addNode({ id: faker.datatype.uuid() })
      .addNode({ id: faker.datatype.uuid() });

    expect(model.graph.nodes).toHaveLength(4);

    model.createLink(
      model.getNode(model.graph.nodes[0].id),
      model.getNode(model.graph.nodes[1].id)
    );
    model.createLink(
      model.getNode(model.graph.nodes[0].id),
      model.getNode(model.graph.nodes[2].id)
    );
    model.createLink(
      model.getNode(model.graph.nodes[2].id),
      model.getNode(model.graph.nodes[3].id)
    );

    expect(model.graph.links).toHaveLength(2);

    const targetLinks = model.getLinks(model.graph.nodes[0].id);
    expect(targetLinks).toHaveLength(2);

    const sourceLinks = model.getLinks(model.graph.nodes[2].id, false, true);
    expect(sourceLinks).toHaveLength(1);

    const allLinks = model.getLinks(model.graph.nodes[2].id, true, true);
    expect(allLinks).toHaveLength(2);
  });
});
