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
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, XCircle, RotateCcw, Pause, Play } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

// Define validation result type
type ValidationResult = {
  input: string
  isAccepted: boolean
  path: string[]
  transitions: string[]
}

export default function DFAVisualizer() {
  const isMobile = useMobile?.() ?? false
  const [inputString, setInputString] = useState('')
  const [multipleInputs, setMultipleInputs] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [currentState, setCurrentState] = useState('q0')
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null)
  const [visitedStates, setVisitedStates] = useState<string[]>(['q0'])
  const [activeTransitions, setActiveTransitions] = useState<string[]>([])
  const [validationSpeed, setValidationSpeed] = useState(100) // Fast by default
  const [simulationMode, setSimulationMode] = useState<'fast' | 'batch'>('fast')
  const [multipleResults, setMultipleResults] = useState<ValidationResult[]>([])
  const [currentInputIndex, setCurrentInputIndex] = useState(0)
  const [inputQueue, setInputQueue] = useState<string[]>([])
  const [isProcessingBatch, setIsProcessingBatch] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [fastModeSpeed, setFastModeSpeed] = useState(300) // Slower for fast mode

  // Initialize the DFA graph
  const { initialNodes, initialEdges } = createDFAGraph()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<CustomEdge>(initialEdges)

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

  // Process next input in the batch
  const processNextBatchInput = useCallback(() => {
    if (!isProcessingBatch || currentInputIndex >= inputQueue.length - 1) {
      setIsProcessingBatch(false)
      return
    }

    const nextInputIndex = currentInputIndex + 1
    setCurrentInputIndex(nextInputIndex)
    setInputString(inputQueue[nextInputIndex])

    // Reset for next input but keep batch processing
    setCurrentIndex(-1)
    setCurrentState('q0')
    setIsAccepted(null)
    setVisitedStates(['q0'])

    // Clear previous transitions
    setActiveTransitions([])

    // Reset edge styles
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: false,
        style: { stroke: '#888', strokeWidth: 1.5 },
      }))
    )

    // Keep transitions highlighted
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isActive: node.id === 'q0',
          isRejecting: false,
        },
      }))
    )

    // Start validating the next input
    setIsValidating(true)
  }, [isProcessingBatch, currentInputIndex, inputQueue, setNodes, setEdges])

  // Process the next character in the input string
  const processNextChar = useCallback(() => {
    if (currentIndex >= inputString.length - 1 || !isValidating) return

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
      setIsPaused(false)

      // If we're in batch mode, add result and process next input
      if (isProcessingBatch) {
        // Add current result to results
        setMultipleResults((prev) => [
          ...prev,
          {
            input: inputString,
            isAccepted: false,
            path: visitedStates,
            transitions: activeTransitions,
          },
        ])

        // Process next input after a delay
        batchTimeoutRef.current = setTimeout(processNextBatchInput, 500)
      }

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
        setActiveTransitions((prev) => {
          // Keep previous transitions and add the new one
          if (!prev.includes(transitionEdge.id)) {
            return [...prev, transitionEdge.id]
          }
          return prev
        })

        // Highlight the active edge - keep previous highlighted edges
        setEdges((eds) =>
          eds.map((edge) => ({
            ...edge,
            animated:
              edge.id === transitionEdge.id ||
              activeTransitions.includes(edge.id),
            style: {
              stroke:
                activeTransitions.includes(edge.id) ||
                edge.id === transitionEdge.id
                  ? '#10b981'
                  : '#888',
              strokeWidth:
                activeTransitions.includes(edge.id) ||
                edge.id === transitionEdge.id
                  ? 3
                  : 1.5,
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
        setIsPaused(false)

        // If we're in batch mode, add result and process next input
        if (isProcessingBatch) {
          // Add current result to results
          setMultipleResults((prev) => [
            ...prev,
            {
              input: inputString,
              isAccepted: accepting,
              path: [...visitedStates, finalState],
              transitions: activeTransitions,
            },
          ])

          // Process next input after a delay
          batchTimeoutRef.current = setTimeout(processNextBatchInput, 500)
        }
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
      setIsPaused(false)

      // If we're in batch mode, add result and process next input
      if (isProcessingBatch) {
        // Add current result to results
        setMultipleResults((prev) => [
          ...prev,
          {
            input: inputString,
            isAccepted: false,
            path: visitedStates,
            transitions: activeTransitions,
          },
        ])

        // Process next input after a delay
        batchTimeoutRef.current = setTimeout(processNextBatchInput, 500)
      }
    }
  }, [
    currentIndex,
    inputString,
    isValidating,
    currentState,
    getCharType,
    getNextState,
    edges,
    setEdges,
    setNodes,
    nodes,
    validationSpeed,
    visitedStates,
    activeTransitions,
    isProcessingBatch,
    processNextBatchInput,
  ])

  // Reset the validation state
  const resetValidation = useCallback(
    (isValidating?: boolean, clearBatchInput = false) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
        batchTimeoutRef.current = null
      }

      setIsValidating(false)
      setIsPaused(false)
      setCurrentIndex(-1)
      setCurrentState('q0')
      setIsAccepted(null)
      setVisitedStates(['q0'])
      setActiveTransitions([])
      setCurrentInputIndex(0)
      setInputQueue([])
      setIsProcessingBatch(false)

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

      // Always clear multiple results
      setMultipleResults([])

      // Only clear batch input if explicitly requested
      if (clearBatchInput && simulationMode === 'batch') {
        setMultipleInputs('')
      }
    },
    [setNodes, setEdges, simulationMode]
  )

  // Toggle pause/resume validation
  const togglePause = useCallback(() => {
    if (isValidating) {
      if (isPaused) {
        setIsPaused(false)
        // Use different speeds based on mode
        const speed =
          simulationMode === 'fast' ? fastModeSpeed : validationSpeed
        timeoutRef.current = setTimeout(processNextChar, speed)
      } else {
        setIsPaused(true)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }, [
    isValidating,
    isPaused,
    processNextChar,
    validationSpeed,
    fastModeSpeed,
    simulationMode,
  ])

  // Start the validation process for a single input
  const startValidation = useCallback(() => {
    if (inputString.length === 0) return

    resetValidation(true) // Keep input string when starting validation
    setIsValidating(true)
  }, [inputString, resetValidation])

  // Start batch validation
  const startBatchValidation = useCallback(() => {
    if (!multipleInputs.trim()) return

    // Parse multiple inputs
    const inputs = multipleInputs
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (inputs.length === 0) return

    // Reset and prepare for batch validation
    resetValidation(true) // Keep input string when starting validation
    setMultipleResults([])
    setInputQueue(inputs)
    setInputString(inputs[0])
    setCurrentInputIndex(0)
    setIsProcessingBatch(true)
    setIsValidating(true)
  }, [multipleInputs, resetValidation])

  // Process the next character when validation state changes
  useEffect(() => {
    if (isValidating && !isPaused) {
      // Use different speeds based on mode
      const speed = simulationMode === 'fast' ? fastModeSpeed : validationSpeed
      timeoutRef.current = setTimeout(processNextChar, speed)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [
    isValidating,
    isPaused,
    processNextChar,
    validationSpeed,
    fastModeSpeed,
    simulationMode,
  ])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
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
          <Card className="shadow-sm border-2">
            <CardHeader className="p-4 pb-2">
              <CardTitle>Password Validator</CardTitle>
              <CardDescription>
                Enter a password to test against the NFA model or use multiple
                inputs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Tabs
                defaultValue="fast"
                onValueChange={(value) =>
                  setSimulationMode(value as 'fast' | 'batch')
                }
                className="w-full"
              >
                <TabsList className="flex w-full mb-4 border-2 rounded-full p-1 items-center">
                  <TabsTrigger
                    value="fast"
                    className="rounded-full flex-1 flex items-center justify-center py-1.5"
                  >
                    Fast Mode
                  </TabsTrigger>
                  <TabsTrigger
                    value="batch"
                    className="rounded-full flex-1 flex items-center justify-center py-1.5"
                  >
                    Batch Mode
                  </TabsTrigger>
                </TabsList>

                {/* Fast Mode */}
                <TabsContent value="fast" className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="password-fast">Password</Label>
                    <div className="flex flex-col space-y-2">
                      <Input
                        id="password-fast"
                        value={inputString}
                        onChange={(e) => setInputString(e.target.value)}
                        placeholder="Enter an 8-character password"
                        className="border-2"
                        disabled={isValidating}
                      />
                      <div className="flex space-x-2">
                        {!isValidating ? (
                          <Button
                            onClick={startValidation}
                            disabled={isValidating || inputString.length === 0}
                            className="flex-1"
                          >
                            Validate
                          </Button>
                        ) : (
                          <Button onClick={togglePause} className="flex-1">
                            {isPaused ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </>
                            ) : (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => resetValidation(false, true)}
                          disabled={!isValidating && currentIndex === -1}
                          className="border-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Batch Mode */}
                <TabsContent value="batch" className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="multiple-inputs">
                      Multiple Test Strings
                    </Label>
                    <Textarea
                      id="multiple-inputs"
                      value={multipleInputs}
                      onChange={(e) => setMultipleInputs(e.target.value)}
                      placeholder="Enter multiple strings (one per line)..."
                      className="min-h-[100px] border-2"
                      disabled={isValidating || isProcessingBatch}
                    />
                    <div className="flex space-x-2 mt-2">
                      {!isValidating ? (
                        <Button
                          onClick={startBatchValidation}
                          disabled={
                            isValidating ||
                            isProcessingBatch ||
                            !multipleInputs.trim()
                          }
                          className="flex-1"
                        >
                          Run All
                        </Button>
                      ) : (
                        <Button onClick={togglePause} className="flex-1">
                          {isPaused ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => resetValidation(false, true)}
                        disabled={
                          !isProcessingBatch &&
                          multipleResults.length === 0 &&
                          currentIndex === -1
                        }
                        className="border-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {multipleResults.length > 0 && (
                    <div className="space-y-2 mt-4 border-2 p-3 rounded-md">
                      <h3 className="text-sm font-medium">Results:</h3>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {multipleResults.map((result, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm border-2 p-2 rounded-md"
                          >
                            {result.isAccepted ? (
                              <CheckCircle className="h-5 w-5 min-w-5 min-h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 min-w-5 min-h-5 text-red-500 flex-shrink-0" />
                            )}
                            <span className="font-mono">{result.input}</span>
                            <span className="ml-auto">
                              {result.isAccepted ? 'Accepted' : 'Rejected'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {isAccepted !== null && simulationMode === 'fast' && (
                <Alert
                  variant={isAccepted ? 'default' : 'destructive'}
                  className="mt-4 border-2"
                >
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

              {currentIndex >= 0 && simulationMode === 'fast' && (
                <div className="space-y-2 mt-4 border-2 p-3 rounded-md">
                  <div className="flex flex-wrap gap-2">
                    <span className="font-medium">Current State:</span>
                    <Badge variant="outline" className="border-2">
                      {currentState}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="font-medium">Path:</span>
                    <div className="flex flex-wrap gap-1">
                      {visitedStates.map((state, idx) => (
                        <Badge key={idx} variant="outline" className="border-2">
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
                          variant={idx <= currentIndex ? 'default' : 'outline'}
                          className="border-2"
                        >
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isProcessingBatch && (
                <div className="mt-4 p-3 border-2 rounded-md bg-blue-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Processing batch...</span>
                    <Badge variant="outline" className="border-2">
                      {currentInputIndex + 1}/{inputQueue.length}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm">
                    Current input:{' '}
                    <span className="font-mono">{inputString}</span>
                  </div>
                </div>
              )}
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
          <div className="h-full border-2 rounded-md bg-background overflow-hidden">
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
                <div className="bg-background p-3 rounded-md shadow-sm border-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">q0 - Initial State</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm">Final State</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Current State</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm">Rejected State</span>
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
