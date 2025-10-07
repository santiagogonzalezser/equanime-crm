import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill TextEncoder/TextDecoder for jsPDF in Node environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder