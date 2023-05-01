import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      zlib: 'export default {}',
    },
  },
  define: {
    'process.env.ENV': JSON.stringify(process.env.ENV ?? 'localhost'),
    'process.env.VOTING_CONTRACT': JSON.stringify(process.env.VOTING_CONTRACT),
    'process.env.DIRECTORY_CONTRACT': JSON.stringify(process.env.DIRECTORY_CONTRACT),
    'process.env.MULTICALL_CONTRACT': JSON.stringify(process.env.MULTICALL_CONTRACT),
    'process.env.TOKEN_CONTRACT': JSON.stringify(process.env.TOKEN_CONTRACT),
  },
  plugins: [react()],
})
