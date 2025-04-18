import { Handle, Position, type NodeProps } from 'reactflow'
import { memo } from 'react'

function StateNode({ data, isConnectable }: NodeProps) {
  const { label, isActive, isAccepting, isRejecting, originalLabel } = data

  // Determine the node style based on its state
  const getNodeStyle = () => {
    if (isRejecting) {
      return 'bg-red-500'
    }
    if (isActive) {
      return 'bg-yellow-500'
    }
    if (isAccepting) {
      return 'bg-green-500'
    }
    return 'bg-white-500 border-gray-500'
  }

  return (
    <div className="relative">
      {data.isStart && (
        <div className="absolute left-[-30px] top-1/2 -translate-y-1/2 text-lg text-blue-600">
          <svg
            width="28"
            height="24"
            viewBox="0 0 28 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500"
          >
            <line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
              stroke="currentColor"
              strokeWidth="5"
            />
            <polygon points="22,6 28,12 22,18" fill="currentColor" />
          </svg>
        </div>
      )}
      <div
        className={`relative flex items-center justify-center w-16 h-16 rounded-full border-2 ${getNodeStyle()}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-2 h-2 bg-gray-400 border-none"
        />
        <div className="text-sm font-medium text-center absolute inset-0 flex items-center justify-center">
          {label}
        </div>
        {isAccepting && (
          <div className="absolute inset-0 rounded-full border-2 border-green-500 -m-1.5"></div>
        )}
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-2 h-2 bg-gray-400 border-none"
        />
      </div>
    </div>
  )
}

export default memo(StateNode)
