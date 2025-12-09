import { existsSync, statSync } from 'fs'
import { dirname } from 'path'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * 验证目录是否存在且为目录
 */
export const validateDirectory = (dirPath: string): ValidationResult => {
  if (!existsSync(dirPath)) {
    return {
      isValid: false,
      error: `目录不存在：${dirPath}`
    }
  }
  
  const stat = statSync(dirPath)
  if (!stat.isDirectory()) {
    return {
      isValid: false,
      error: `指定路径不是目录：${dirPath}`
    }
  }
  
  return { isValid: true }
}

/**
 * 验证文件是否存在且为文件
 */
export const validateFile = (filePath: string): ValidationResult => {
  if (!existsSync(filePath)) {
    return {
      isValid: false,
      error: `文件不存在：${filePath}`
    }
  }
  
  const stat = statSync(filePath)
  if (!stat.isFile()) {
    return {
      isValid: false,
      error: `指定路径不是文件：${filePath}`
    }
  }
  
  return { isValid: true }
}

/**
 * 验证文件扩展名
 */
export const validateFileExtension = (filePath: string, expectedExtension: string): ValidationResult => {
  if (!filePath.endsWith(expectedExtension)) {
    return {
      isValid: false,
      error: `文件必须是${expectedExtension}格式：${filePath}`
    }
  }
  
  return { isValid: true }
}

/**
 * 验证输出文件目录是否存在
 */
export const validateOutputDirectory = (outputPath: string): ValidationResult => {
  const outputDir = dirname(outputPath)
  
  if (!existsSync(outputDir)) {
    return {
      isValid: false,
      error: `输出文件目录不存在：${outputDir}`
    }
  }
  
  const stat = statSync(outputDir)
  if (!stat.isDirectory()) {
    return {
      isValid: false,
      error: `输出路径父级不是目录：${outputDir}`
    }
  }
  
  return { isValid: true }
}