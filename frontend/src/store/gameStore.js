import { create } from 'zustand'

const SCARE_TYPES = [
  'door_slam',
  'ghost_face',
  'lights_out',
  'skeleton_pop',
  'mirror_shatter',
  'eerie_laughter'
]

export const useGameStore = create((set, get) => ({
  // Game state
  scanId: null,
  role: 'ghost',
  currentRoom: 'library',
  isScanning: false,
  isDevMode: true,
  lowQuality: false,
  reduceScares: false, // Accessibility toggle

  // Player state
  lifelines: 4,
  score: 0,
  lanternVisitsLeft: 4,
  foundRelics: [],
  isGameOver: false,
  activeRelicModal: null,
  activeScare: null,
  lastScareType: null,
  showReport: false,
  hauntingReport: null,

  // Warmth & Proximity (driven by /api/warmth)
  warmth: 0.0,
  hasRelicsRemaining: true,

  // Map & Room data from API
  mansionMap: null,
  roomData: null,
  isLoadingRoom: false,

  // Audio Context State
  audioUnlocked: false,
  isPointerLocked: false,

  // Actions
  setRole: (role) => set({ role }),
  toggleQuality: () => set((state) => ({ lowQuality: !state.lowQuality })),
  toggleDevMode: () => set((state) => ({ isDevMode: !state.isDevMode })),
  toggleReduceScares: () => set((state) => ({ reduceScares: !state.reduceScares })),
  unlockAudio: () => set({ audioUnlocked: true }),
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),

  // Set active scan session
  setScanSession: (mapData) => set({
    scanId: mapData.scan_id,
    role: mapData.role,
    mansionMap: mapData.rooms,
    lifelines: mapData.lifelines_left ?? 4,
    lanternVisitsLeft: mapData.lantern_visits_left ?? 4,
    currentRoom: 'library',
    showReport: false
  }),

  // Fetch room data from API (/api/room/{scan_id}/{room_name})
  fetchRoom: async (scanId, roomName) => {
    set({ isLoadingRoom: true, currentRoom: roomName, showReport: false })
    try {
      let targetScanId = scanId
      if (!targetScanId) {
        const scanRes = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repo_url: 'sample', role: get().role })
        })
        const scanData = await scanRes.json()
        targetScanId = scanData.scan_id
        set({
          scanId: targetScanId,
          mansionMap: scanData.rooms,
          lifelines: scanData.lifelines_left,
          lanternVisitsLeft: scanData.lantern_visits_left
        })
      }

      const res = await fetch(`/api/room/${targetScanId}/${roomName}`)
      if (!res.ok) throw new Error('Failed to fetch room')
      const data = await res.json()
      set({ roomData: data.room, isLoadingRoom: false })
    } catch (err) {
      console.error('Error fetching room data:', err)
      set({ isLoadingRoom: false })
    }
  },

  // Update player position warmth via POST /api/warmth
  updateWarmth: async (x, y, z) => {
    const { scanId, currentRoom, isGameOver } = get()
    if (!scanId || isGameOver) return

    try {
      const res = await fetch('/api/warmth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          room_name: currentRoom,
          x,
          y: y || 1.6,
          z
        })
      })
      if (res.ok) {
        const data = await res.json()
        set({
          warmth: data.warmth ?? 0.0,
          hasRelicsRemaining: data.has_relics ?? false
        })
      }
    } catch (err) {
      // Non-blocking
    }
  },

  // Handle Object Click via POST /api/check
  checkObject: async (objectId) => {
    const { scanId, currentRoom, lifelines, isGameOver, lastScareType } = get()
    if (!scanId || isGameOver) return

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          room_name: currentRoom,
          object_id: objectId
        })
      })
      const result = await res.json()

      if (result.is_real) {
        set((state) => ({
          score: result.current_score,
          foundRelics: [...state.foundRelics, result.relic],
          activeRelicModal: result.relic
        }))
      } else {
        // Select next jump scare never repeating the last one
        const availableScares = SCARE_TYPES.filter(s => s !== lastScareType)
        const nextScare = availableScares[Math.floor(Math.random() * availableScares.length)]

        set({
          lifelines: result.lifelines_left,
          isGameOver: result.game_over || false,
          activeScare: nextScare,
          lastScareType: nextScare
        })
      }
      return result
    } catch (err) {
      console.error('Check object failed:', err)
    }
  },

  // Fetch Comprehensive Haunting Report
  fetchReport: async () => {
    const { scanId } = get()
    if (!scanId) return
    try {
      const res = await fetch(`/api/report/${scanId}`)
      if (res.ok) {
        const data = await res.json()
        set({ hauntingReport: data, showReport: true })
      }
    } catch (err) {
      console.error('Error fetching haunting report:', err)
    }
  },

  clearScare: () => set({ activeScare: null }),
  clearRelicModal: () => set({ activeRelicModal: null }),
  closeReport: () => set({ showReport: false }),

  resetGame: () => set({
    lifelines: 4,
    score: 0,
    lanternVisitsLeft: 4,
    foundRelics: [],
    isGameOver: false,
    activeRelicModal: null,
    activeScare: null,
    showReport: false,
    hauntingReport: null
  })
}))

