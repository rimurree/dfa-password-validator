'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import ReactFlow, {
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
  addEdge,
  reconnectEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, XCircle, Play, Pause, RotateCcw } from 'lucide-react'
import StateNode from '@/components/state-node'
import { createDFAGraph } from '@/lib/dfa-graph'
import { useMobile } from '@/hooks/use-mobile'

type CustomEdge = Omit<Edge, 'label'> & {
  label: string
  data: {
    offset: number
    transitionLabels: string[]
  }
}
// Register custom node types
const nodeTypes = {
  stateNode: StateNode,
}

export default function DFAVisualizer() {
  const isMobile = useMobile()
  const [inputString, setInputString] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [currentState, setCurrentState] = useState('q0')
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null)
  const [visitedStates, setVisitedStates] = useState<string[]>(['q0'])
  const [activeTransitions, setActiveTransitions] = useState<string[]>([])
  const [validationSpeed, setValidationSpeed] = useState(500)
  const [isPaused, setIsPaused] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize the DFA graph
  const { initialNodes, initialEdges } = createDFAGraph()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<CustomEdge>(initialEdges)

  // Reset the validation state
  const resetValidation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setIsValidating(false)
    setCurrentIndex(-1)
    setCurrentState('q0')
    setIsAccepted(null)
    setVisitedStates(['q0'])
    setActiveTransitions([])

    // Reset node styles
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isActive: node.id === 'q0',
          isAccepting: node.data.isAccepting,
          isRejecting: false,
          label: node.data.originalLabel,
        },
      }))
    )

    // Reset edge styles
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: false,
        style: { stroke: '#888', strokeWidth: 1.5 },
      }))
    )
  }, [setNodes, setEdges])

  // Determine the character type
  const getCharType = useCallback((char: string) => {
    if (/[0-9]/.test(char)) return '[0-9]'
    if (/[a-z]/.test(char)) return '[a-z]'
    if (/[A-Z]/.test(char)) return '[A-Z]'
    return null
  }, [])

  // Get the next state based on the current state and input character
  const getNextState = useCallback(
    (state: string, charType: string | null) => {
      if (!charType) return null

      // Find edge where label includes the charType
      const transition = edges.find(
        (edge) =>
          edge.source === state &&
          charType &&
          (edge.label as string).split(', ').includes(charType)
      )

      return transition ? transition.target : null
    },
    [edges]
  )

  // Process the next character in the input string
  const processNextChar = useCallback(() => {
    if (currentIndex >= inputString.length - 1 || !isValidating || isPaused)
      return

    const nextIndex = currentIndex + 1
    const char = inputString[nextIndex]
    const charType = getCharType(char)
    const nextState = getNextState(currentState, charType)

    // Handle invalid characters immediately
    if (!charType) {
      setIsAccepted(false)
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isRejecting: node.id === currentState,
          },
        }))
      )
      setIsValidating(false)
      return
    }

    if (nextState) {
      // Find the edge ID for highlighting
      const transitionEdge = edges.find(
        (edge) =>
          edge.source === currentState &&
          edge.target === nextState &&
          (edge.label as string).split(', ').includes(charType)
      )

      if (transitionEdge) {
        setActiveTransitions([transitionEdge.id])

        // Highlight the active edge
        setEdges((eds) =>
          eds.map((edge) => ({
            ...edge,
            animated: edge.id === transitionEdge.id,
            style: {
              stroke: edge.id === transitionEdge.id ? '#10b981' : '#888',
              strokeWidth: edge.id === transitionEdge.id ? 3 : 1.5,
            },
          }))
        )
      }

      // Update the current state and visited states
      setCurrentState(nextState)
      setVisitedStates((prev) => [...prev, nextState])

      // Update node styles to show the active state
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isActive: node.id === nextState,
            label:
              node.id === nextState
                ? `${node.data.originalLabel} (Current)`
                : node.data.originalLabel,
          },
        }))
      )

      setCurrentIndex(nextIndex)

      // Check if we've reached the end of the input
      if (nextIndex === inputString.length - 1) {
        const finalState = nextState
        const accepting =
          nodes.find((node) => node.id === finalState)?.data.isAccepting ||
          false

        setIsAccepted(accepting)

        // Update node styles to show acceptance/rejection
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: {
              ...node.data,
              isActive: node.id === finalState,
              isRejecting: node.id === finalState && !accepting,
            },
          }))
        )

        setIsValidating(false)
      } else {
        // Schedule the next character processing
        timeoutRef.current = setTimeout(processNextChar, validationSpeed)
      }
    } else {
      // No valid transition found - reject
      setIsAccepted(false)

      // Update node styles to show rejection
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isRejecting: node.id === currentState,
          },
        }))
      )

      setIsValidating(false)
    }
  }, [
    currentIndex,
    inputString,
    isValidating,
    isPaused,
    currentState,
    getCharType,
    getNextState,
    edges,
    setEdges,
    setNodes,
    nodes,
    validationSpeed,
  ])

  // Start the validation process
  const startValidation = useCallback(() => {
    if (inputString.length === 0) return

    resetValidation()
    setIsValidating(true)
    setIsPaused(false)
  }, [inputString, resetValidation])

  // Toggle pause/resume validation
  const togglePause = useCallback(() => {
    if (isValidating) {
      if (isPaused) {
        setIsPaused(false)
        timeoutRef.current = setTimeout(processNextChar, validationSpeed)
      } else {
        setIsPaused(true)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }, [isValidating, isPaused, processNextChar, validationSpeed])

  // Process the next character when validation state changes
  useEffect(() => {
    if (isValidating && !isPaused) {
      timeoutRef.current = setTimeout(processNextChar, validationSpeed)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isValidating, isPaused, processNextChar, validationSpeed])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  // gets called after end of edge gets dragged to another source or target
  const onReconnect = (oldEdge: any, newConnection: any) =>
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
  const onConnect = (params: any) => setEdges((eds) => addEdge(params, eds))

  return (
    <div className="w-full h-[calc(100vh-200px)] min-h-[600px]">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Password Validator</CardTitle>
          <CardDescription>
            Enter an 8-character password to test against the NFA model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="flex space-x-2">
                <Input
                  id="password"
                  value={inputString}
                  onChange={(e) => setInputString(e.target.value)}
                  placeholder="Enter an 8-character password"
                  disabled={isValidating}
                  className="flex-1"
                />
                <Button
                  onClick={startValidation}
                  disabled={
                    (isValidating && !isPaused) || inputString.length === 0
                  }
                >
                  Validate
                </Button>
                {isValidating && (
                  <Button variant="outline" onClick={togglePause}>
                    {isPaused ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={resetValidation}
                  disabled={!isValidating && currentIndex === -1}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isAccepted !== null && (
              <Alert variant={isAccepted ? 'default' : 'destructive'}>
                {isAccepted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {isAccepted ? 'Password Accepted' : 'Password Rejected'}
                </AlertTitle>
                <AlertDescription>
                  {isAccepted
                    ? 'The password meets all requirements.'
                    : 'The password does not meet the requirements.'}
                </AlertDescription>
              </Alert>
            )}

            {currentIndex >= 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="font-medium">Current State:</span>
                  <Badge variant="outline">{currentState}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="font-medium">Path:</span>
                  {visitedStates.map((state, idx) => (
                    <Badge key={idx} variant="outline">
                      {state}
                      {idx < visitedStates.length - 1 && ' →'}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="font-medium">Input:</span>
                  {inputString.split('').map((char, idx) => (
                    <Badge
                      key={idx}
                      variant={idx <= currentIndex ? 'default' : 'outline'}
                    >
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Requirements: exactly 8 characters, at least one digit, one ore more
            lowercase letter, and one or more uppercase letter.
          </div>
        </CardFooter>
      </Card>

      <ReactFlowProvider>
        <div className="h-full border rounded-md">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={4}
          >
            <Background />
            <Controls />
            <Panel position="top-left">
              <div className="bg-background p-2 rounded-md shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-black"></div>
                  <span className="text-sm">a = a - z</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-black"></div>
                  <span className="text-sm">A = A - Z</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-black"></div>
                  <span className="text-sm">0 = 0 - 9</span>
                </div>
              </div>
            </Panel>
            <Panel position="top-right">
              <div className="bg-background p-2 rounded-md shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">q0 - Initial State</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Final State</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Current State</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  )
}
