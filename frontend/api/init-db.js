import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'server', 'data', 'db.json')

// Ensure db directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const defaultDB = {
  users: [{
    id: '1',
    name: 'User Demo',
    email: 'demo@example.com',
    password: 'password123',
    phone: '+1234567890',
    birthDate: '1990-01-01',
    gender: 'other',
    wallet_address: null,
    createdAt: new Date().toISOString()
  }],
  destinations: [
    { id: 'dest-1', name: 'Machu Picchu', location: 'Cusco, Peru', address: 'Km 112 Ferrocarril Cusco-Aguas Calientes', description: 'Maravilla del mundo antiguo. La ciudadela inca mejor preservada.', image: 'https://images.unsplash.com/photo-1587595431973-160ef0d6470a?w=400&h=300&fit=crop', rating: 4.9, createdAt: new Date().toISOString() },
    { id: 'dest-2', name: 'Playa Tamarindo', location: 'Guanacaste, Costa Rica', address: 'Santa Cruz, Guanacaste Province', description: 'Playa paradisíaca con excelente clima y olas para surfear.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', rating: 4.7, createdAt: new Date().toISOString() },
    { id: 'dest-3', name: 'Galápagos Islands', location: 'Ecuador', address: 'Archipielago de Galápagos', description: 'Destino único con fauna y flora endémica. Avistamiento de tortugas gigantes.', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop', rating: 4.8, createdAt: new Date().toISOString() },
    { id: 'dest-4', name: 'Atacama Desert', location: 'Chile', address: 'Región de Antofagasta', description: 'El desierto más árido del mundo con paisajes lunares espectaculares.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', rating: 4.6, createdAt: new Date().toISOString() },
    { id: 'dest-5', name: 'Pyongyang Tour', location: 'Pyongyang, North Korea', address: 'Pyongyang', description: 'Visita guiada por lugares emblemáticos de Corea del Norte (requiere permisos especiales).', image: 'https://images.unsplash.com/photo-1520763185298-1b434c919eba?w=400&h=300&fit=crop', rating: 3.8, createdAt: new Date().toISOString() },
    { id: 'dest-6', name: 'Castillo de Bran', location: 'Bran, Romania', address: 'Strada General Traian Moșoiu', description: 'El famoso "Castillo de Drácula" y paisajes de Transilvania.', image: 'https://images.unsplash.com/photo-1587595431973-160ef0d6470a?w=400&h=300&fit=crop', rating: 4.3, createdAt: new Date().toISOString() },
    { id: 'dest-7', name: 'Persepolis', location: 'Shiraz, Iran', address: 'Marvdasht', description: 'Ruinas arqueológicas de la antigua Persia, sitio patrimonio de la humanidad.', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop', rating: 4.5, createdAt: new Date().toISOString() },
    { id: 'dest-8', name: 'Samarkand', location: 'Samarkand, Uzbekistan', address: 'Región de Samarcanda', description: 'Ruta de la seda: arquitectura islámica, mausoleos y mercados tradicionales.', image: 'https://images.unsplash.com/photo-1571632635475-241cebb221cb?w=400&h=300&fit=crop', rating: 4.6, createdAt: new Date().toISOString() },
    { id: 'dest-9', name: 'Great Wall (Badaling)', location: 'Beijing, China', address: 'Badaling', description: 'Tramo emblemático de la Gran Muralla aproximadamente a 1 hora de Beijing.', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop', rating: 4.7, createdAt: new Date().toISOString() },
    { id: 'dest-10', name: 'Tokyo - Shibuya', location: 'Tokyo, Japan', address: 'Shibuya Crossing', description: 'Cultura pop, gastronomía y vida nocturna en el corazón de Tokio.', image: 'https://images.unsplash.com/photo-1540959375944-7049f642e9cc?w=400&h=300&fit=crop', rating: 4.8, createdAt: new Date().toISOString() },
    { id: 'dest-11', name: 'Seoul Highlights', location: 'Seoul, South Korea', address: 'Jongno-gu', description: 'Palacios históricos, mercados y tecnología de vanguardia en Corea del Sur.', image: 'https://images.unsplash.com/photo-1540959375944-7049f642e9cc?w=400&h=300&fit=crop', rating: 4.7, createdAt: new Date().toISOString() },
    { id: 'dest-12', name: 'Berlin City Tour', location: 'Berlin, Germany', address: 'Mitte', description: 'Historia contemporánea, museos y vida urbana en la capital alemana.', image: 'https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=400&h=300&fit=crop', rating: 4.6, createdAt: new Date().toISOString() },
    { id: 'dest-13', name: 'Oaxaca de Juárez', location: 'Oaxaca, Mexico', address: 'Centro Histórico, Oaxaca de Juárez', description: 'Cultura, gastronomía y artesanías en el corazón de Oaxaca.', image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&h=300&fit=crop', rating: 4.9, createdAt: new Date().toISOString() },
    { id: 'dest-14', name: 'Huatulco Beaches', location: 'Huatulco, Mexico', address: 'Bahías de Huatulco', description: 'Playas vírgenes y bahías para descanso y deportes acuáticos.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', rating: 4.7, createdAt: new Date().toISOString() },
    { id: 'dest-15', name: 'Campeche Colonial', location: 'Campeche, Mexico', address: 'Centro Histórico de Campeche', description: 'Ciudad fortificada con arquitectura barroca y vistas al Golfo.', image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&h=300&fit=crop', rating: 4.6, createdAt: new Date().toISOString() },
    { id: 'dest-16', name: 'Chichén Itzá', location: 'Yucatán, Mexico', address: 'Cuzamá - Chichén Itzá', description: 'Una de las nuevas maravillas del mundo, sitio arqueológico maya.', image: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=400&h=300&fit=crop', rating: 4.9, createdAt: new Date().toISOString() },
    { id: 'dest-17', name: 'Cabo San Lucas', location: 'Baja California, Mexico', address: 'Cabo San Lucas', description: 'Playas, avistamiento de ballenas y vida nocturna en Baja California.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', rating: 4.5, createdAt: new Date().toISOString() }
  ],
  reservations: []
}

// Initialize database
function initDB() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(defaultDB, null, 2))
      console.log('✅ Database initialized with default destinations')
    } else {
      // Load existing and ensure destinations exist
      const existing = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      if (!existing.destinations || existing.destinations.length === 0) {
        existing.destinations = defaultDB.destinations
        fs.writeFileSync(dbPath, JSON.stringify(existing, null, 2))
        console.log('✅ Destinations added to existing database')
      }
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    // Create with defaults anyway
    fs.writeFileSync(dbPath, JSON.stringify(defaultDB, null, 2))
  }
}

initDB()
