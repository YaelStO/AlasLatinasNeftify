// Simple in-memory data store for Vercel (you should migrate to a real database)
// For now, this will reset on each deployment but works for testing

let appData = {
  users: [],
  destinations: [],
  reservations: []
}

export async function readData() {
  return appData
}

export async function writeData(data) {
  appData = data
  return true
}
