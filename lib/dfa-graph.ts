import { type Node, type Edge, MarkerType } from 'reactflow'

export const createDFAGraph = () => {
  const initialNodes: Node[] = Array.from({ length: 43 }, (_, i) => ({
    id: `q${i}`,
    type: 'stateNode',
    position: { x: (i % 10) * 120, y: Math.floor(i / 10) * 120 },
    data: {
      label: `q${i}`,
      originalLabel: `q${i}`,
      isAccepting: i === 42, // This makes q42 the accepting state
      isActive: false,
      isRejecting: false,
    },
  }))

  const transitions: [number, [string, number][]][] = [
    [
      0,
      [
        ['a', 7],
        ['A', 19],
        ['0', 1],
      ],
    ],
    [
      1,
      [
        ['a', 9],
        ['A', 21],
        ['0', 2],
      ],
    ],
    [
      2,
      [
        ['a', 11],
        ['A', 23],
        ['0', 3],
      ],
    ],
    [
      3,
      [
        ['a', 13],
        ['A', 25],
        ['0', 4],
      ],
    ],
    [
      4,
      [
        ['a', 15],
        ['A', 27],
        ['0', 5],
      ],
    ],
    [
      5,
      [
        ['a', 17],
        ['A', 6],
        ['0', 29],
      ],
    ],
    [
      6,
      [
        ['a', 18],
        ['A', 30],
      ],
    ],
    [
      7,
      [
        ['a', 8],
        ['A', 31],
        ['0', 9],
      ],
    ],
    [
      8,
      [
        ['a', 10],
        ['A', 32],
        ['0', 11],
      ],
    ],
    [
      9,
      [
        ['a', 11],
        ['A', 33],
        ['0', 11],
      ],
    ],
    [
      10,
      [
        ['a', 12],
        ['A', 34],
        ['0', 13],
      ],
    ],
    [
      11,
      [
        ['a', 13],
        ['A', 35],
        ['0', 13],
      ],
    ],
    [
      12,
      [
        ['a', 14],
        ['A', 36],
        ['0', 15],
      ],
    ],
    [
      13,
      [
        ['a', 15],
        ['A', 37],
        ['0', 15],
      ],
    ],
    [
      14,
      [
        ['a', 16],
        ['A', 38],
        ['0', 17],
      ],
    ],
    [
      15,
      [
        ['a', 17],
        ['A', 39],
        ['0', 17],
      ],
    ],
    [
      16,
      [
        ['A', 40],
        ['0', 18],
      ],
    ],
    [
      17,
      [
        ['a', 18],
        ['A', 41],
        ['0', 18],
      ],
    ],
    [18, [['A', 42]]],
    [
      19,
      [
        ['a', 31],
        ['A', 20],
        ['0', 21],
      ],
    ],
    [
      20,
      [
        ['a', 32],
        ['A', 22],
        ['0', 23],
      ],
    ],
    [
      21,
      [
        ['a', 33],
        ['A', 23],
        ['0', 23],
      ],
    ],
    [
      22,
      [
        ['a', 34],
        ['A', 24],
        ['0', 25],
      ],
    ],
    [
      23,
      [
        ['a', 35],
        ['A', 25],
        ['0', 25],
      ],
    ],
    [
      24,
      [
        ['a', 36],
        ['A', 26],
        ['0', 27],
      ],
    ],
    [
      25,
      [
        ['a', 37],
        ['A', 27],
        ['0', 27],
      ],
    ],
    [
      26,
      [
        ['a', 38],
        ['A', 28],
        ['0', 29],
      ],
    ],
    [
      27,
      [
        ['a', 39],
        ['A', 29],
        ['0', 29],
      ],
    ],
    [
      28,
      [
        ['a', 40],
        ['0', 30],
      ],
    ],
    [
      29,
      [
        ['a', 41],
        ['A', 30],
        ['0', 30],
      ],
    ],
    [30, [['a', 42]]],
    [
      31,
      [
        ['a', 32],
        ['A', 32],
        ['0', 33],
      ],
    ],
    [
      32,
      [
        ['a', 34],
        ['A', 34],
        ['0', 35],
      ],
    ],
    [
      33,
      [
        ['a', 35],
        ['A', 35],
        ['0', 35],
      ],
    ],
    [
      34,
      [
        ['a', 36],
        ['A', 36],
        ['0', 37],
      ],
    ],
    [
      35,
      [
        ['a', 37],
        ['A', 37],
        ['0', 37],
      ],
    ],
    [
      36,
      [
        ['a', 38],
        ['A', 38],
        ['0', 39],
      ],
    ],
    [
      37,
      [
        ['a', 39],
        ['A', 39],
        ['0', 39],
      ],
    ],
    [
      38,
      [
        ['a', 40],
        ['A', 40],
        ['0', 41],
      ],
    ],
    [
      39,
      [
        ['a', 41],
        ['A', 41],
        ['0', 41],
      ],
    ],
    [40, [['0', 42]]],
    [
      41,
      [
        ['a', 42],
        ['A', 42],
        ['0', 42],
      ],
    ],
  ]

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
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        offset: 5,
      },
    })
  )

  return { initialNodes, initialEdges }
}
