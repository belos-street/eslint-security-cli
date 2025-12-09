import { CONFIG_DEFAULT } from '@/config'
import figlet from 'figlet'

export const printFiglet = () => console.log(figlet.textSync(CONFIG_DEFAULT.name) + '\n')
