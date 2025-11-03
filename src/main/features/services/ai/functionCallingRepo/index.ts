import { FunctionTool, FunctionLibrary } from '@sharedType/ai'
import { StockFunctionTool, StockFunctionLibrary } from './stock'
import { BaseFunctionTool, BaseFunctionLibrary } from './base'
export { StockFunctionTool, BaseFunctionTool, StockFunctionLibrary, BaseFunctionLibrary }
export const FunctionRepo: FunctionTool[] = [...StockFunctionTool, ...BaseFunctionTool]
export const FunctionLibraryRepo: FunctionLibrary[] = [
  ...StockFunctionLibrary,
  ...BaseFunctionLibrary
]
export default { FunctionRepo, FunctionLibraryRepo }
