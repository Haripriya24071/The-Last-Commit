import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  // Game state
  scanId: null,
  role: 'ghost',
  currentRoom: 'library',
  isScanning: false,
  isDevMode: true, // Enabled for instant audition room testing & dev preview
  lowQuality: false, // Low-quality toggle (disables shadows and postfx for 60fps on all laptops)

  // Player state
  lifelines: 4,
  score: 0,
  lanternVisitsLeft: 4,
  foundRelics: [],
  isGameOver: false,
  activeRelicModal: null,
  activeScare: null,

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
  unlockAudio: () => set({ audioUnlocked: true }),
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),

  // Set active scan
  setScanSession: (mapData) => set({
    scanId: mapData.scan_id,
    role: mapData.role,
    mansionMap: mapData.rooms,
    lifelines: mapData.lifelines_left ?? 4,
    lanternVisitsLeft: mapData.lantern_visits_left ?? 4,
    currentRoom: 'library'
  }),

  // Fetch room data from API (/api/room/{scan_id}/{room_name})
  fetchRoom: async (scanId, roomName) => {
    set({ isLoadingRoom: true, currentRoom: roomName })
    try {
      // If no active scanId yet, initiate a fast sample scan
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

  // Handle Object Click via POST /api/check
  checkObject: async (objectId) => {
    const { scanId, currentRoom, lifelines, isGameOver } = get()
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
        set({
          lifelines: result.lifelines_left,
          isGameOver: result.game_over || false,
          activeScare: result.jump_scare_type || 'door_slam'
        })
      }
      return result
    } catch (err) {
      console.error('Check object failed:', err)
    }
  },

  clearScare: () => set({ activeScare: null }),
  clearRelicModal: () => set({ activeRelicModal: null }),

  resetGame: () => set({
    lifelines: 4,
    score: 0,
    lanternVisitsLeft: 4,
    foundRelics: [],
    isGameOver: false,
    activeRelicModal: null,
    activeScare: null
  })
}))
