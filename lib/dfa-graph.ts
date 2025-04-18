import { type Node, type Edge, MarkerType } from 'reactflow'

export const createDFAGraph = () => {
  const transitions: [number, [string, number][]][] = [
    [
      0,
      [
        ['[a-z]', 7],
        ['[A-Z]', 19],
        ['[0-9]', 1],
      ],
    ],
    [
      1,
      [
        ['[a-z]', 9],
        ['[A-Z]', 21],
        ['[0-9]', 2],
      ],
    ],
    [
      2,
      [
        ['[a-z]', 11],
        ['[A-Z]', 23],
        ['[0-9]', 3],
      ],
    ],
    [
      3,
      [
        ['[a-z]', 13],
        ['[A-Z]', 25],
        ['[0-9]', 4],
      ],
    ],
    [
      4,
      [
        ['[a-z]', 15],
        ['[A-Z]', 27],
        ['[0-9]', 5],
      ],
    ],
    [
      5,
      [
        ['[a-z]', 17],
        ['[A-Z]', 6],
        ['[0-9]', 29],
      ],
    ],
    [
      6,
      [
        ['[a-z]', 18],
        ['[A-Z]', 30],
      ],
    ],
    [
      7,
      [
        ['[a-z]', 8],
        ['[A-Z]', 31],
        ['[0-9]', 9],
      ],
    ],
    [
      8,
      [
        ['[a-z]', 10],
        ['[A-Z]', 32],
        ['[0-9]', 11],
      ],
    ],
    [
      9,
      [
        ['[a-z]', 11],
        ['[A-Z]', 33],
        ['[0-9]', 11],
      ],
    ],
    [
      10,
      [
        ['[a-z]', 12],
        ['[A-Z]', 34],
        ['[0-9]', 13],
      ],
    ],
    [
      11,
      [
        ['[a-z]', 13],
        ['[A-Z]', 35],
        ['[0-9]', 13],
      ],
    ],
    [
      12,
      [
        ['[a-z]', 14],
        ['[A-Z]', 36],
        ['[0-9]', 15],
      ],
    ],
    [
      13,
      [
        ['[a-z]', 15],
        ['[A-Z]', 37],
        ['[0-9]', 15],
      ],
    ],
    [
      14,
      [
        ['[a-z]', 16],
        ['[A-Z]', 38],
        ['[0-9]', 17],
      ],
    ],
    [
      15,
      [
        ['[a-z]', 17],
        ['[A-Z]', 39],
        ['[0-9]', 17],
      ],
    ],
    [
      16,
      [
        ['[A-Z]', 40],
        ['[0-9]', 18],
      ],
    ],
    [
      17,
      [
        ['[a-z]', 18],
        ['[A-Z]', 41],
        ['[0-9]', 18],
      ],
    ],
    [18, [['[A-Z]', 42]]],
    [
      19,
      [
        ['[a-z]', 31],
        ['[A-Z]', 20],
        ['[0-9]', 21],
      ],
    ],
    [
      20,
      [
        ['[a-z]', 32],
        ['[A-Z]', 22],
        ['[0-9]', 23],
      ],
    ],
    [
      21,
      [
        ['[a-z]', 33],
        ['[A-Z]', 23],
        ['[0-9]', 23],
      ],
    ],
    [
      22,
      [
        ['[a-z]', 34],
        ['[A-Z]', 24],
        ['[0-9]', 25],
      ],
    ],
    [
      23,
      [
        ['[a-z]', 35],
        ['[A-Z]', 25],
        ['[0-9]', 25],
      ],
    ],
    [
      24,
      [
        ['[a-z]', 36],
        ['[A-Z]', 26],
        ['[0-9]', 27],
      ],
    ],
    [
      25,
      [
        ['[a-z]', 37],
        ['[A-Z]', 27],
        ['[0-9]', 27],
      ],
    ],
    [
      26,
      [
        ['[a-z]', 38],
        ['[A-Z]', 28],
        ['[0-9]', 29],
      ],
    ],
    [
      27,
      [
        ['[a-z]', 39],
        ['[A-Z]', 29],
        ['[0-9]', 29],
      ],
    ],
    [
      28,
      [
        ['[a-z]', 40],
        ['[0-9]', 30],
      ],
    ],
    [
      29,
      [
        ['[a-z]', 41],
        ['[A-Z]', 30],
        ['[0-9]', 30],
      ],
    ],
    [30, [['[a-z]', 42]]],
    [
      31,
      [
        ['[a-z]', 32],
        ['[A-Z]', 32],
        ['[0-9]', 33],
      ],
    ],
    [
      32,
      [
        ['[a-z]', 34],
        ['[A-Z]', 34],
        ['[0-9]', 35],
      ],
    ],
    [
      33,
      [
        ['[a-z]', 35],
        ['[A-Z]', 35],
        ['[0-9]', 35],
      ],
    ],
    [
      34,
      [
        ['[a-z]', 36],
        ['[A-Z]', 36],
        ['[0-9]', 37],
      ],
    ],
    [
      35,
      [
        ['[a-z]', 37],
        ['[A-Z]', 37],
        ['[0-9]', 37],
      ],
    ],
    [
      36,
      [
        ['[a-z]', 38],
        ['[A-Z]', 38],
        ['[0-9]', 39],
      ],
    ],
    [
      37,
      [
        ['[a-z]', 39],
        ['[A-Z]', 39],
        ['[0-9]', 39],
      ],
    ],
    [
      38,
      [
        ['[a-z]', 40],
        ['[A-Z]', 40],
        ['[0-9]', 41],
      ],
    ],
    [
      39,
      [
        ['[a-z]', 41],
        ['[A-Z]', 41],
        ['[0-9]', 41],
      ],
    ],
    [40, [['[0-9]', 42]]],
    [
      41,
      [
        ['[a-z]', 42],
        ['[A-Z]', 42],
        ['[0-9]', 42],
      ],
    ],
  ]

  // Build adjacency map
  const adjacencyMap = new Map<number, Set<number>>()
  transitions.forEach(([source, trans]) => {
    if (!adjacencyMap.has(source)) adjacencyMap.set(source, new Set())
    for (const [, target] of trans) {
      adjacencyMap.get(source)!.add(target)
    }
  })

  // Layout using BFS to determine layers
  const visited = new Set<number>()
  const nodePositions = new Map<number, { x: number; y: number }>()
  const nodesPerLayer = new Map<number, number[]>() // depth -> node IDs

  const queue: { id: number; depth: number }[] = [{ id: 0, depth: 0 }]
  visited.add(0)

  while (queue.length) {
    const { id, depth } = queue.shift()!

    // Add node to its layer
    if (!nodesPerLayer.has(depth)) {
      nodesPerLayer.set(depth, [])
    }
    nodesPerLayer.get(depth)!.push(id)

    // Process neighbors
    for (const neighbor of adjacencyMap.get(id) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push({ id: neighbor, depth: depth + 1 })
      }
    }
  }

  // Assign positions centered per layer
  nodesPerLayer.forEach((nodeIds, depth) => {
    nodeIds.sort((a, b) => a - b) // Sort nodes for consistent layout
    const count = nodeIds.length
    const layerWidth = (count - 1) * 160 // Total width needed
    const startX = -layerWidth / 2 // Center alignment

    nodeIds.forEach((id, index) => {
      const x = startX + index * 160
      nodePositions.set(id, { x, y: depth * 160 })
    })
  })

  // Fallback for disconnected nodes (keep existing code)
  const fallbackStart = 1000
  let fallbackOffset = 0
  const initialNodes: Node[] = Array.from({ length: 43 }, (_, i) => {
    const pos = nodePositions.get(i) ?? {
      x: fallbackStart + fallbackOffset++ * 100,
      y: fallbackStart,
    }
    return {
      id: `q${i}`,
      type: 'stateNode',
      position: pos,
      data: {
        label: `q${i}`,
        originalLabel: `q${i}`,
        isStart: i === 0,
        isAccepting: i === 42,
        isActive: false,
        isRejecting: false,
      },
    }
  })

  // Build edges
  const edgeMap = new Map<
    string,
    { source: string; target: string; labels: string[] }
  >()
  transitions.forEach(([source, trans]) => {
    trans.forEach(([label, target]) => {
      const key = `${source}-${target}`
      if (!edgeMap.has(key)) {
        edgeMap.set(key, {
          source: `q${source}`,
          target: `q${target}`,
          labels: [label],
        })
      } else {
        edgeMap.get(key)!.labels.push(label)
      }
    })
  })

  const initialEdges: Edge[] = Array.from(edgeMap.values()).map(
    ({ source, target, labels }, i) => ({
      id: `e-${source}-${target}-${i}`,
      source,
      target,
      label: labels.join(', '),
      type: 'straight',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        offset: 5,
      },
    })
  )

  return { initialNodes, initialEdges }
}
