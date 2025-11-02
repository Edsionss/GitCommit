import { FunctionTool } from '@sharedType/ai'
import { StockFunctionTool } from './stock'
import { BaseFunctionTool } from './base'
export { StockFunctionTool, BaseFunctionTool }
export const FunctionRepo: FunctionTool[] = [...StockFunctionTool, ...BaseFunctionTool]
export default FunctionRepo
