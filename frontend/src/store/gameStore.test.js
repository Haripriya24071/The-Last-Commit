import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

describe('Zustand GameStore Tests', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.setState({
      currentScreen: 'landing',
      playerName: 'Investigator',
      repoUrl: 'sample',
      role: 'ghost',
      currentView: 'map',
      lifelines: 4,
      score: 0,
      lanternVisitsLeft: 4,
      foundRelics: [],
      isGameOver: false,
      reduceScares: false,
      volume: 0.8
    })
  })

  it('initializes with default starting state', () => {
    const state = useGameStore.getState()
    expect(state.currentScreen).toBe('landing')
    expect(state.lifelines).toBe(4)
    expect(state.lanternVisitsLeft).toBe(4)
    expect(state.score).toBe(0)
    expect(state.isGameOver).toBe(false)
  })

  it('updates player name and navigation screen', () => {
    const { setPlayerName, setScreen } = useGameStore.getState()
    setPlayerName('Detective Ada')
    setScreen('welcome')

    const updated = useGameStore.getState()
    expect(updated.playerName).toBe('Detective Ada')
    expect(updated.currentScreen).toBe('welcome')
  })

  it('toggles reduce scares mode', () => {
    const { toggleReduceScares } = useGameStore.getState()
    expect(useGameStore.getState().reduceScares).toBe(false)

    toggleReduceScares()
    expect(useGameStore.getState().reduceScares).toBe(true)

    toggleReduceScares()
    expect(useGameStore.getState().reduceScares).toBe(false)
  })

  it('correctly sets scan session payload', () => {
    const { setScanSession } = useGameStore.getState()
    setScanSession({
      scan_id: 'mansion_test123',
      role: 'reaper',
      rooms: { library: { name: 'The Grand Library' } },
      role_presence: { ghost: 'strong', reaper: 'strong', skeleton: 'faint' },
      lifelines_left: 3,
      lantern_visits_left: 2
    })

    const updated = useGameStore.getState()
    expect(updated.scanId).toBe('mansion_test123')
    expect(updated.role).toBe('reaper')
    expect(updated.lifelines).toBe(3)
    expect(updated.lanternVisitsLeft).toBe(2)
  })

  it('handles subtitle updates and clearing', () => {
    const { setSubtitle, clearSubtitle } = useGameStore.getState()
    setSubtitle({ speaker: 'Ghost', text: 'You disturb our resting place...' })

    expect(useGameStore.getState().activeSubtitle.speaker).toBe('Ghost')
    expect(useGameStore.getState().activeSubtitle.text).toContain('disturb')

    clearSubtitle()
    expect(useGameStore.getState().activeSubtitle).toBeNull()
  })
})
