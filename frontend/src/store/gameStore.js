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
  // Screen Flow: 'landing' | 'welcome' | 'repo_input' | 'role_select' | 'map' | 'room'
  currentScreen: 'landing',
  playerName: 'Investigator',
  repoUrl: 'sample',
  scanProgressMessage: 'Awakening ancient detectors...',

  // Game navigation state
  currentView: 'map', // 'map' | 'room'
  scanId: null,
  role: 'ghost',
  currentRoom: 'library',
  isScanning: false,
  isDevMode: true,
  lowQuality: false,
  reduceScares: false,

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
  rolePresence: { ghost: 'strong', reaper: 'strong', skeleton: 'strong' },
  roomData: null,
  isLoadingRoom: false,

  // Audio Context State
  audioUnlocked: false,
  isPointerLocked: false,

  // Settings & Accessibility
  brightness: 1.2, // Default slightly brighter
  enableSkeletonVoice: true,
  volume: 0.8,
  isMuted: false,
  healthError: null,
  fallbackReason: null,
  activeSubtitle: null,

  // Screen Actions
  setScreen: (screen) => set({ currentScreen: screen }),
  setPlayerName: (name) => set({ playerName: name || 'Investigator' }),
  setRepoUrl: (url) => set({ repoUrl: url }),
  setRole: (role) => set({ role }),
  setView: (view) => set({ currentView: view }),
  setBrightness: (val) => set({ brightness: val }),
  setVolume: (val) => {
    AudioEngine.setVolume(val)
    set({ volume: val })
  },
  toggleMute: () => {
    const muted = AudioEngine.toggleMute()
    set({ isMuted: muted })
  },
  toggleSkeletonVoice: () => set((s) => ({ enableSkeletonVoice: !s.enableSkeletonVoice })),
  toggleQuality: () => set((state) => ({ lowQuality: !state.lowQuality })),
  toggleDevMode: () => set((state) => ({ isDevMode: !state.isDevMode })),
  toggleReduceScares: () => set((state) => ({ reduceScares: !state.reduceScares })),
  unlockAudio: () => set({ audioUnlocked: true }),
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),
  setSubtitle: (subtitle) => set({ activeSubtitle: subtitle }),
  clearSubtitle: () => set({ activeSubtitle: null }),

  // Check Backend /health on load
  checkBackendHealth: async () => {
    try {
      const res = await fetch('/health')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      set({ healthError: null })
      return true
    } catch (err) {
      console.error('Backend health check failed:', err)
      set({ healthError: 'Backend server is unreachable on http://127.0.0.1:8000. Please start the FastAPI server.' })
      return false
    }
  },

  // Set active scan session from API
  setScanSession: (mapData) => set({
    scanId: mapData.scan_id,
    role: mapData.role,
    mansionMap: mapData.rooms,
    rolePresence: mapData.role_presence || { ghost: 'strong', reaper: 'strong', skeleton: 'strong' },
    lifelines: mapData.lifelines_left ?? 4,
    lanternVisitsLeft: mapData.lantern_visits_left ?? 4,
    showReport: false
  }),

  // Execute scan with animated spooky ritual messages
  runScanRitual: async (repoInput) => {
    const targetUrl = repoInput || get().repoUrl || 'sample'
    set({ isScanning: true, scanProgressMessage: 'Summoning git shallow clone...' })

    // Progressive spooky status updates
    const timer1 = setTimeout(() => {
      set({ scanProgressMessage: 'Consulting the dark AST syntax trees...' })
    }, 1200)

    const timer2 = setTimeout(() => {
      set({ scanProgressMessage: 'Detecting buried security flaws & code rot...' })
    }, 2400)

    const timer3 = setTimeout(() => {
      set({ scanProgressMessage: 'Binding corrupted lines to mansion rooms...' })
    }, 3600)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: targetUrl, role: get().role })
      })
      const data = await res.json()

      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)

      set({
        scanId: data.scan_id,
        role: data.role,
        mansionMap: data.rooms,
        rolePresence: data.role_presence || { ghost: 'strong', reaper: 'strong', skeleton: 'strong' },
        lifelines: data.lifelines_left ?? 4,
        lanternVisitsLeft: data.lantern_visits_left ?? 4,
        isScanning: false,
        currentScreen: 'role_select'
      })
      return data
    } catch (err) {
      console.error('Error scanning repo:', err)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      set({ isScanning: false })
    }
  },

  // Fetch Mansion Map via /api/map/{scanId}
  fetchMansionMap: async (repoUrl = 'sample') => {
    set({ isScanning: true })
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, role: get().role })
      })
      const data = await res.json()
      set({
        scanId: data.scan_id,
        role: data.role,
        mansionMap: data.rooms,
        rolePresence: data.role_presence || { ghost: 'strong', reaper: 'strong', skeleton: 'strong' },
        lifelines: data.lifelines_left ?? 4,
        lanternVisitsLeft: data.lantern_visits_left ?? 4,
        isScanning: false
      })
      return data
    } catch (err) {
      console.error('Error scanning repo:', err)
      set({ isScanning: false })
    }
  },

  // Enter a room by spending 1 Lantern Visit via POST /api/enter-room
  enterRoom: async (roomName) => {
    let { scanId, role } = get()
    set({ isLoadingRoom: true })

    try {
      if (!scanId) {
        const mapData = await get().fetchMansionMap('sample')
        scanId = mapData.scan_id
      }

      const res = await fetch('/api/enter-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_id: scanId, room_name: roomName })
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Cannot enter room.')
        set({ isLoadingRoom: false })
        return
      }

      const data = await res.json()
      set({
        currentRoom: roomName,
        roomData: data.room,
        lanternVisitsLeft: data.lantern_visits_left,
        lifelines: data.lifelines_left,
        isGameOver: data.game_over || false,
        currentScreen: 'room',
        currentView: 'room',
        isLoadingRoom: false
      })
    } catch (err) {
      console.error('Error entering room:', err)
      set({ isLoadingRoom: false })
    }
  },

  // Return to Map (Esc / door click) without spending a lantern visit
  returnToMap: () => {
    set({ currentScreen: 'map', currentView: 'map', isPointerLocked: false })
  },

  // Update player position warmth via POST /api/warmth
  updateWarmth: async (x, y, z) => {
    const { scanId, currentRoom, isGameOver, currentView } = get()
    if (!scanId || isGameOver || currentView !== 'room') return

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
    const { scanId, currentRoom, isGameOver, lastScareType, enableSkeletonVoice, role } = get()
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
        AudioEngine.speakVoiceLine('relic', role, get().setSubtitle, enableSkeletonVoice)
      } else {
        const availableScares = SCARE_TYPES.filter(s => s !== lastScareType)
        const nextScare = availableScares[Math.floor(Math.random() * availableScares.length)]

        set({
          lifelines: result.lifelines_left,
          isGameOver: result.game_over || false,
          activeScare: nextScare,
          lastScareType: nextScare
        })
        if (result.game_over) {
          AudioEngine.speakVoiceLine('game_over', role, get().setSubtitle, enableSkeletonVoice)
        } else {
          AudioEngine.speakVoiceLine('decoy', role, get().setSubtitle, enableSkeletonVoice)
        }
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

  // Play Again: Re-light candles and reset to map with 0 score
  resetGame: () => {
    const { repoUrl, role } = get()
    set({
      lifelines: 4,
      score: 0,
      lanternVisitsLeft: 4,
      foundRelics: [],
      isGameOver: false,
      activeRelicModal: null,
      activeScare: null,
      showReport: false,
      hauntingReport: null,
      currentScreen: 'map',
      currentView: 'map'
    })
    get().fetchMansionMap(repoUrl || 'sample')
  },

  // New Repo: Reset everything and go back to repo input screen
  startNewRepo: () => {
    set({
      scanId: null,
      lifelines: 4,
      score: 0,
      lanternVisitsLeft: 4,
      foundRelics: [],
      isGameOver: false,
      activeRelicModal: null,
      activeScare: null,
      showReport: false,
      hauntingReport: null,
      mansionMap: null,
      currentScreen: 'repo_input',
      currentView: 'map'
    })
  }
}))


