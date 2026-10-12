import { create } from 'zustand'
import { AudioEngine } from '../components/AudioEngine'

const SCARE_TYPES = [
  'door_slam',
  'ghost_face',
  'lights_out',
  'skeleton_pop',
  'mirror_shatter',
  'eerie_laughter'
]

const loadSavedSettings = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('the_last_commit_settings')
      if (raw) {
        return JSON.parse(raw)
      }
    }
  } catch (e) {
    console.warn("Could not load saved settings:", e)
  }
  return {
    volume: 0,
    brightness: 1.2,
    reduceScares: false,
    enableSkeletonVoice: false,
    lowQuality: false,
    isMuted: true
  }
}

const saveSettings = (newSettings) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('the_last_commit_settings', JSON.stringify(newSettings))
    }
  } catch (e) {
    console.warn("Could not persist settings:", e)
  }
}


const initialSettings = loadSavedSettings()

export const useGameStore = create((set, get) => ({
  // Screen Flow: 'room' | 'map' | 'landing'
  currentScreen: 'room',
  playerName: 'Investigator',
  repoUrl: 'sample',
  scanProgressMessage: 'Awakening ancient detectors...',

  // Game navigation state
  currentView: 'room', // 'map' | 'room'
  scanId: null,
  role: 'ghost',
  currentRoom: 'library',
  isScanning: false,
  isDevMode: true,
  lowQuality: initialSettings.lowQuality ?? false,
  reduceScares: initialSettings.reduceScares ?? false,

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
  focusedObject: null,

  // Warmth & Proximity (driven by /api/warmth)
  warmth: 0.0,
  hasRelicsRemaining: true,

  // Map & Room data from API
  mansionMap: null,
  roomData: {
    room_name: 'library',
    title: 'The Grand Library',
    description: 'Towering bookshelves, antique mahogany tables, and corrupted code relics.',
    theme_color: '#38bdf8',
    objects: [
      { id: 'obj_library_1', filename: 'cache.py', display_name: 'cache.py', model_type: 'tome', position: [-6.9, 0.48, 4.6], glow_color: '#38bdf8' },
      { id: 'obj_library_2', filename: 'config.py', display_name: 'config.py', model_type: 'chest', position: [-9.2, 0.0, 7.0], glow_color: '#38bdf8' },
      { id: 'obj_library_3', filename: 'server.py', display_name: 'server.py', model_type: 'portrait', position: [-6.4, 0.9, 2.8], glow_color: '#38bdf8' },
      { id: 'obj_library_4', filename: 'models.py', display_name: 'models.py', model_type: 'skull', position: [-5.6, 0.5, 6.9], glow_color: '#38bdf8' },
    ]
  },
  isLoadingRoom: false,

  // Audio Context State
  audioUnlocked: false,
  isPointerLocked: false,
  focusedObject: null, // Crosshair aimed object in 3D space

  setFocusedObject: (obj) => set({ focusedObject: obj }),
  interactFocusedObject: async () => {
    const { focusedObject, checkObject, isGameOver } = get()
    if (!focusedObject || isGameOver) return null
    return await checkObject(focusedObject.id)
  },

  // Settings & Accessibility
  brightness: initialSettings.brightness ?? 1.2,
  enableSkeletonVoice: initialSettings.enableSkeletonVoice ?? true,
  volume: 0,
  isMuted: true,
  healthError: null,
  fallbackReason: null,
  activeSubtitle: null,

  // Screen Actions
  setScreen: (screen) => set({ currentScreen: screen }),
  setPlayerName: (name) => set({ playerName: name || 'Investigator' }),
  setRepoUrl: (url) => set({ repoUrl: url }),
  setRole: (role) => set({ role }),
  setView: (view) => set({ currentView: view }),
  setBrightness: (val) => {
    saveSettings({ ...get(), brightness: val })
    set({ brightness: val })
  },
  setVolume: (val) => {
    AudioEngine.setVolume(val)
    saveSettings({ ...get(), volume: val })
    set({ volume: val })
  },
  toggleMute: () => {
    const muted = AudioEngine.toggleMute()
    saveSettings({ ...get(), isMuted: muted })
    set({ isMuted: muted })
  },
  toggleSkeletonVoice: () => set((s) => {
    const nextVal = !s.enableSkeletonVoice
    saveSettings({ ...get(), enableSkeletonVoice: nextVal })
    return { enableSkeletonVoice: nextVal }
  }),
  toggleQuality: () => set((state) => {
    const nextVal = !state.lowQuality
    saveSettings({ ...get(), lowQuality: nextVal })
    return { lowQuality: nextVal }
  }),
  toggleDevMode: () => set((state) => ({ isDevMode: !state.isDevMode })),
  toggleReduceScares: () => set((state) => {
    const nextVal = !state.reduceScares
    saveSettings({ ...get(), reduceScares: nextVal })
    return { reduceScares: nextVal }
  }),
  unlockAudio: () => set({ audioUnlocked: true }),
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),
  setSubtitle: (subtitle) => set({ activeSubtitle: subtitle }),
  clearSubtitle: () => set({ activeSubtitle: null }),
  setFocusedObject: (obj) => set({ focusedObject: obj }),
  interactFocusedObject: () => {
    const { focusedObject, checkObject, isGameOver } = get()
    if (!focusedObject || isGameOver) return
    checkObject(focusedObject.id)
  },


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
  runScanRitual: async (repoInput, roleOverride) => {
    const targetUrl = repoInput || get().repoUrl || 'sample'
    const targetRole = roleOverride || get().role || 'ghost'
    set({
      isScanning: true,
      scanProgressMessage: 'Summoning git shallow clone...',
      role: targetRole,
      repoUrl: targetUrl
    })

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
        body: JSON.stringify({ repo_url: targetUrl, role: targetRole })
      })
      const data = await res.json()

      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)

      set({
        scanId: data.scan_id,
        role: data.role || targetRole,
        mansionMap: data.rooms,
        rolePresence: data.role_presence || { ghost: 'strong', reaper: 'strong', skeleton: 'strong' },
        lifelines: data.lifelines_left ?? 4,
        lanternVisitsLeft: data.lantern_visits_left ?? 4,
        isScanning: false,
        currentScreen: 'map',
        currentView: 'map'
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
        AudioEngine.playRelicFound()
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
        AudioEngine.playJumpScare(result.jump_scare_type || nextScare)
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


