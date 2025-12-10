import { getStore } from "@netlify/blobs"

// Simple helper to read/write a single JSON blob named 'app-data'
// Note: This runs inside Netlify Functions / Edge runtime where the Blobs API is available.

const STORE_NAME = process.env.NETLIFY_BLOBS_STORE || 'alas-latinas-app'
const KEY = 'app-data'

export const getAppStore = () => getStore(STORE_NAME)

export async function readData() {
  const store = getAppStore()
  const entry = await store.get(KEY)
  if (!entry) return { users: [], destinations: [], reservations: [] }

  // entry may be a File-like object in the Functions runtime: try to read as text
  try {
    if (typeof entry.text === 'function') {
      const txt = await entry.text()
      return JSON.parse(txt)
    }

    if (entry instanceof Uint8Array || entry instanceof ArrayBuffer) {
      const txt = new TextDecoder().decode(entry)
      return JSON.parse(txt)
    }

    // fallback: if it's already JSON-like
    if (typeof entry === 'string') return JSON.parse(entry)
    return entry
  } catch (err) {
    console.error('Failed to parse blob entry', err)
    return { users: [], destinations: [], reservations: [] }
  }
}

export async function writeData(data) {
  const store = getAppStore()
  const json = JSON.stringify(data)
  // create a Blob if available (browser-like runtime)
  try {
    if (typeof Blob !== 'undefined') {
      const blob = new Blob([json], { type: 'application/json' })
      await store.set(KEY, blob)
      return true
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback: set raw string
  await store.set(KEY, json)
  return true
}
