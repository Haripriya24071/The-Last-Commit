/**
 * AudioEngine — Comprehensive Web Audio API sound engine for The Last Commit.
 * Procedural synthesizers for binaural horror drone, dynamic heartbeat radar,
 * footstep thuds, relic discovery chimes, jump scare stingers, and Web Speech TTS.
 */

let audioCtx = null
let isMuted = false
let masterVolume = 0.75

// Ambient drone nodes
let droneOsc1 = null
let droneOsc2 = null
let droneFilter = null
let droneGain = null

// Heartbeat interval
let heartbeatTimer = null
let lastHeartbeatTime = 0

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export const ROLE_VOICE_LINES = {
  ghost: { name: 'THE GHOST', color: '#38bdf8' },
  reaper: { name: 'THE REAPER', color: '#ef4444' },
  skeleton: { name: 'THE SKELETON', color: '#fbbf24' }
}

export const AudioEngine = {
  init: () => {
    getAudioContext()
  },

  unlock: () => {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  },

  setVolume: (val) => {
    masterVolume = Math.max(0, Math.min(1, val))
    if (droneGain && audioCtx) {
      droneGain.gain.setTargetAtTime(isMuted ? 0 : masterVolume * 0.25, audioCtx.currentTime, 0.1)
    }
  },

  toggleMute: () => {
    isMuted = !isMuted
    if (droneGain && audioCtx) {
      droneGain.gain.setTargetAtTime(isMuted ? 0 : masterVolume * 0.25, audioCtx.currentTime, 0.1)
    }
    return isMuted
  },

  getIsMuted: () => isMuted,
  getVolume: () => masterVolume,

  // 1. Procedural 45Hz Ambient Binaural Drone
  startAmbientDrone: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      if (droneGain) return // Already running

      droneGain = ctx.createGain()
      droneGain.gain.setValueAtTime(0.001, ctx.currentTime)
      droneGain.gain.exponentialRampToValueAtTime(masterVolume * 0.25, ctx.currentTime + 2.0)
      droneGain.connect(ctx.destination)

      droneFilter = ctx.createBiquadFilter()
      droneFilter.type = 'lowpass'
      droneFilter.frequency.setValueAtTime(95, ctx.currentTime)
      droneFilter.connect(droneGain)

      // Osc 1: 46Hz Sawtooth
      droneOsc1 = ctx.createOscillator()
      droneOsc1.type = 'sawtooth'
      droneOsc1.frequency.setValueAtTime(46, ctx.currentTime)
      droneOsc1.connect(droneFilter)
      droneOsc1.start()

      // Osc 2: 44Hz Sine (2Hz binaural beat difference)
      droneOsc2 = ctx.createOscillator()
      droneOsc2.type = 'sine'
      droneOsc2.frequency.setValueAtTime(44, ctx.currentTime)
      droneOsc2.connect(droneFilter)
      droneOsc2.start()
    } catch (e) {
      // Audio context policy guard
    }
  },

  stopAmbientDrone: () => {
    const ctx = audioCtx
    if (droneGain && ctx) {
      try {
        droneGain.gain.setTargetAtTime(0.001, ctx.currentTime, 0.5)
        setTimeout(() => {
          try {
            droneOsc1?.stop()
            droneOsc2?.stop()
            droneOsc1?.disconnect()
            droneOsc2?.disconnect()
            droneFilter?.disconnect()
            droneGain?.disconnect()
          } catch (e) {}
          droneGain = null
          droneFilter = null
          droneOsc1 = null
          droneOsc2 = null
        }, 600)
      } catch (e) {}
    }
  },

  // 2. Procedural Footstep Thud (Stone flagstone impact)
  playFootstep: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(75, now)
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.08)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(140, now)

      gain.gain.setValueAtTime(masterVolume * 0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.1)
    } catch (e) {}
  },

  // 3. Heartbeat Radar ("lub-dub" pulse driven by /api/warmth)
  playHeartbeat: (warmth = 0.0) => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    if (now - lastHeartbeatTime < 0.25) return
    lastHeartbeatTime = now

    const playThump = (time, freq, vol) => {
      try {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, time)
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.12)

        gain.gain.setValueAtTime(vol * masterVolume, time)
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(time)
        osc.stop(time + 0.15)
      } catch (e) {}
    }

    const intensity = Math.max(0.2, warmth)
    // Lub
    playThump(now, 68 + intensity * 25, 0.35 + intensity * 0.35)
    // Dub
    playThump(now + 0.12, 54 + intensity * 20, 0.25 + intensity * 0.25)
  },

  // 4. Creaking Iron Door Synth
  playDoorCreak: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(110, now)
      osc.frequency.linearRampToValueAtTime(160, now + 0.4)
      osc.frequency.linearRampToValueAtTime(95, now + 0.9)

      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(450, now)
      filter.Q.setValueAtTime(5.0, now)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(masterVolume * 0.2, now + 0.2)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 1.2)
    } catch (e) {}
  },

  // 5. Celestial Relic Cleansed Chime (Harmonic Minor Discovery Chord)
  playRelicFound: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      // F# minor chime: F#5 (740Hz), A5 (880Hz), C#6 (1108Hz), F#6 (1480Hz)
      const freqs = [740, 880, 1108, 1480]

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const startTime = now + i * 0.08

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.001, startTime)
        gain.gain.exponentialRampToValueAtTime(masterVolume * 0.28, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 1.5)
      })
    } catch (e) {}
  },

  // 6. Terrifying Decoy Jump Scare Stinger
  playJumpScare: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime

      // Harsh dissonant cluster
      const freqs = [185, 220, 246, 370, 740, 920]
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, now)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.7)

        gain.gain.setValueAtTime(masterVolume * 0.45, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.85)
      })

      // White noise explosion blast
      const bufferSize = ctx.sampleRate * 0.6
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.setValueAtTime(800, now)

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(masterVolume * 0.5, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(ctx.destination)

      noise.start(now)
      noise.stop(now + 0.65)
    } catch (e) {}
  },

  playUiClick: () => {
    if (isMuted) return
    const ctx = getAudioContext()
    if (!ctx) return
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05)
      gain.gain.setValueAtTime(masterVolume * 0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.07)
    } catch (e) {}
  },

  playUiHover: () => {},

  // 7. Web Speech API Character TTS Voice Lines
  speakVoiceLine: (type, role = 'ghost', setSubtitle, enabled = true) => {
    if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return

    const lines = {
      relic: {
        ghost: "A forgotten function emerges from the mist. Cleansed at last.",
        reaper: "A fatal security wound uncovered. The rot recedes.",
        skeleton: "Bloated complexity extracted from the marrow."
      },
      decoy: {
        ghost: "The lady of the staircase laughs. You reached into the void!",
        reaper: "Fools rush into shadows! Another candle dies.",
        skeleton: "Crunch! You touched dead stone. One flame snuffed!"
      },
      game_over: {
        ghost: "Your light has expired. The mansion claims another soul.",
        reaper: "Darkness claims your mortal code. Game over.",
        skeleton: "All four candles snuffed! You belong to the estate now."
      }
    }

    const text = lines[type]?.[role] || "The house remembers..."

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.88
      utterance.pitch = role === 'reaper' ? 0.6 : role === 'skeleton' ? 1.3 : 0.9

      if (setSubtitle) {
        setSubtitle({
          speaker: role.toUpperCase(),
          text
        })
        setTimeout(() => setSubtitle(null), 4500)
      }

      window.speechSynthesis.speak(utterance)
    } catch (e) {}
  }
}
