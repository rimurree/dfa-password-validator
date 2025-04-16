import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"

interface StateNodeData {
  label: string
  originalLabel: string
  isAccepting: boolean
  isActive: boolean
  isRejecting: boolean
}

function StateNode({ data, isConnectable }: NodeProps<StateNodeData>) {
  const { label, isAccepting, isActive, isRejecting } = data

  // Determine the node style based on its state
  const getBgColor = () => {
    if (isRejecting) return "bg-red-500"
    if (isActive) return "bg-yellow-500"
    return "bg-blue-100"
  }

  const getBorderStyle = () => {
    if (isAccepting) {
      return "border-4 border-green-500"
    }
    return "border-2 border-gray-400"
  }

  return (
    <div className={`px-4 py-2 rounded-full ${getBgColor()} ${getBorderStyle()} shadow-md min-w-[80px] text-center`}>
      {isAccepting && <div className="absolute inset-0 rounded-full border-2 border-green-500 -m-2"></div>}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-gray-700" />
      <div className="font-medium">{label}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-gray-700" />
    </div>
  )
}

export default memo(StateNode)
