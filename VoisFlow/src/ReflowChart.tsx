/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Canvas,
  Edge,
  ElkNodeLayoutOptions,
  Label,
  MarkerArrow,
  Node,
  NodeProps,
  useSelection,
} from 'reaflow';
import graphData from './data.json';
import './Chart.css';

// Define types for nodes and edges
interface NodeData {
  id: string;
  text: string;
  parent?: string;
  className?: string;
  data?: string;
  layoutOptions?: ElkNodeLayoutOptions;
}

interface EdgeData {
  id: string;
  from: string;
  to: string;
}

interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

// Convert graph data to reaflow format
const nodes = (graphData as GraphData).nodes.map((node) => {
  return {
    id: node.id,
    text: node.text,
    parent: node.parent,
    className: node.className,
    data: node.data,
    layoutOptions: node.parent
      ? {
          'elk.algorithm': 'rectpacking',
          'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',
        }
      : {
          'elk.algorithm': 'radial',
          'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',
          'elk.radial.nodePlacement.strategy': 'BREADTH_FIRST',
        },
  };
});

const edges = (graphData as GraphData).edges.map((edge) => ({
  id: edge.id,
  from: edge.from,
  to: edge.to,
}));

const GraphComponent: React.FC = () => {
  const [localNodes, setNodes] = useState<NodeData[]>(nodes);
  const [localEdges, setEdges] = useState<EdgeData[]>(edges);
  const [selectedNode, setSelectedNode] = useState<NodeData | undefined>(
    undefined
  );

  const { selections, onCanvasClick, onClick, onKeyDown } = useSelection({
    localNodes,
    localEdges,
    onDataChange: (n, e) => {
      console.info('Data changed', n, e);
      setNodes(n);
      setEdges(e);
    },
    onSelection: (s) => {
      console.info('Selection', s);
    },
  });

  const onLocalClick = (ev: any, data: any) => {
    if (onClick) {
      console.info('Local click', ev);
      onClick(ev, data);
    }
  };

  useEffect(() => {
    // Update selected node based on current selections
    if (selections.length > 0) {
      const selectedNodeId = selections[0];
      const node = localNodes.find((node) => node.id === selectedNodeId);
      setSelectedNode(node);
    } else {
      setSelectedNode(undefined); // Clear selection if no nodes are selected
    }
  }, [selections, localNodes]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        style={{ width: '80%', height: '100%' }}
        className="canvas-container"
      >
        <Canvas
          nodes={localNodes}
          edges={localEdges}
          panType="drag"
          zoomable
          onCanvasClick={onCanvasClick}
          selections={selections}
          node={(node: NodeProps) => (
            <Node
              {...node}
              rx={20}
              ry={20}
              onClick={onLocalClick}
              onKeyDown={onKeyDown}
              className="node"
              selectable={true}
              linkable={false}
              label={
                <Label
                  style={{ fill: 'black', transform: 'translateY(25px)' }}
                />
              }
            />
          )}
          arrow={<MarkerArrow className="marker-arrow" />}
          edge={<Edge className="edge" />}
          layoutOptions={{
            'elk.algorithm': 'radial',
            'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
            'elk.direction': 'RIGHT',
            '	org.eclipse.elk.radial.centerOnRoot': 'true',
            'elk.layered.feedbackEdges': 'true',
            'elk.radial.center': '1',
            'elk.nodeLabels.placement': 'INSIDE V_TOP H_RIGHT',
            'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',
          }}
        />
      </div>
      <div
        style={{
          width: '20%',
          padding: '20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
        className="side-panel"
      >
        {selectedNode ? (
          <div className="information">
            <h2>Node Information</h2>
            <p>
              <strong>ID:</strong> {selectedNode.id}
            </p>
            <p>
              <strong>Label:</strong> {selectedNode.data}
            </p>
            {/* Add more details as needed */}
          </div>
        ) : (
          <p className="node-details">Select a node to see details</p>
        )}
      </div>
    </div>
  );
};

export default GraphComponent;
