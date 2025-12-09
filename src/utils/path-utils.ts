import { resolve, isAbsolute } from 'path'

/**
 * 标准化路径为绝对路径
 */
export const normalizeToAbsolutePath = (inputPath: string): string => {
  if (isAbsolute(inputPath)) {
    return inputPath
  }
  return resolve(process.cwd(), inputPath)
}

/**
 * 验证路径是否为绝对路径
 */
export const validateAbsolutePath = (inputPath: string): boolean => {
  return isAbsolute(inputPath)
}

/**
 * 获取路径的友好显示名称
 */
export const getPathDisplayName = (path: string): string => {
  const homeDir = process.env.HOME || process.env.USERPROFILE
  if (homeDir && path.startsWith(homeDir)) {
    return path.replace(homeDir, '~')
  }
  return path
}