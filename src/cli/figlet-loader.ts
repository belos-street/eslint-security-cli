export const createSimpleBanner = (text: string): string => {
  const lines = ['╔' + '═'.repeat(text.length + 2) + '╗', '║ ' + text + ' ║', '╚' + '═'.repeat(text.length + 2) + '╝']
  return lines.join('\n')
}
