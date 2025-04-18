'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ReactFlow, {
  type Edge,
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
  const isMobile = useMobile?.() ?? false
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
  const resetValidation = useCallback(
    (isValidating?: boolean) => {
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
      if (!isValidating) {
        setInputString('')
      }
    },
    [setNodes, setEdges]
  )

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
                ? nextIndex === inputString.length - 1 && node.data.isAccepting
                  ? `${node.data.originalLabel} (Final)`
                  : `${node.data.originalLabel} (Current)`
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

    resetValidation(true)
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

  // Trigger a fit view after a short delay to ensure proper rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      // This is just to trigger a re-render which helps with fitting the view
      setNodes((nds) => [...nds])
    }, 100)
    return () => clearTimeout(timer)
  }, [setNodes])

  return (
    <div className="w-full min-h-[screen] flex flex-col md:flex-row gap-4 bg-background p-2">
      {/* Password Validator - Full width on mobile, 1/4 width on desktop */}
      <div className="w-full md:w-1/4 md:min-w-[300px]">
        <div className="w-full p-2">
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle>Password Validator</CardTitle>
              <CardDescription>
                Enter an 8-character password to test against the NFA model.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex flex-col space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex flex-col space-y-2">
                    <Input
                      id="password"
                      value={inputString}
                      onChange={(e) => setInputString(e.target.value)}
                      placeholder="Enter an 8-character password"
                      disabled={isValidating}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={startValidation}
                        disabled={
                          (isValidating && !isPaused) ||
                          inputString.length === 0
                        }
                        className="flex-1"
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
                        onClick={() => resetValidation(false)}
                        disabled={!isValidating && currentIndex === -1}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
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
                      <div className="flex flex-wrap gap-1">
                        {visitedStates.map((state, idx) => (
                          <Badge key={idx} variant="outline">
                            {state}
                            {idx < visitedStates.length - 1 && ' →'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="font-medium">Input:</span>
                      <div className="flex flex-wrap gap-1">
                        {inputString.split('').map((char, idx) => (
                          <Badge
                            key={idx}
                            variant={
                              idx <= currentIndex ? 'default' : 'outline'
                            }
                          >
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-2">
              <div className="text-sm text-muted-foreground">
                Requirements: exactly 8 characters, at least one digit, one or
                more lowercase letter, and one or more uppercase letter.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* ReactFlow Visualization - Full width on mobile, 3/4 width on desktop */}
      <div className="w-full md:flex-1 h-[550px] md:h-[calc(100vh-120px)] mt-2">
        <ReactFlowProvider>
          <div className="h-full border rounded-md bg-background overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onReconnect={onReconnect}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.2}
              maxZoom={4}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            >
              <Background color="#aaa" gap={20} size={1} />
              <Controls />
              <Panel position="top-right">
                <div className="bg-background p-3 rounded-md shadow-sm border">
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
    </div>
  )
}
