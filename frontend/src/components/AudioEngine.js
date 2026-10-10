/**
 * Comprehensive Web Audio Engine & Horror Soundscape Synthesizer.
 * Synthesizes ambient drone, door creaks, celestial chimes, heartbeat, jump scares,
 * and low-pitched sarcastic Skeleton TTS roasts.
 */

let audioCtx = null
let masterGain = null
let ambientOsc1 = null
let ambientOsc2 = null
let ambientGain = null
let isMuted = false
let currentVolume = 0.8

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
      masterGain = audioCtx.createGain()
      masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime)
      masterGain.connect(audioCtx.destination)
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export const AudioEngine = {
  init: () => {
    getAudioContext()
  },

  setVolume: (val) => {
    currentVolume = Math.max(0, Math.min(1, val))
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime)
    }
  },

  toggleMute: () => {
    isMuted = !isMuted
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime)
    }
    return isMuted
  },

  getIsMuted: () => isMuted,
  getVolume: () => currentVolume,

  // 1. Ambient Horror Drone per Room
  startAmbientDrone: () => {
    const ctx = getAudioContext()
    if (!ctx || ambientOsc1) return

    try {
      ambientGain = ctx.createGain()
      ambientGain.gain.setValueAtTime(0.08, ctx.currentTime)

      ambientOsc1 = ctx.createOscillator()
      ambientOsc1.type = 'sawtooth'
      ambientOsc1.frequency.setValueAtTime(45, ctx.currentTime) // Deep 45Hz drone

      ambientOsc2 = ctx.createOscillator()
      ambientOsc2.type = 'sine'
      ambientOsc2.frequency.setValueAtTime(48, ctx.currentTime) // Eerie 3Hz binaural beating

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(140, ctx.currentTime)

      ambientOsc1.connect(filter)
      ambientOsc2.connect(filter)
      filter.connect(ambientGain)
      ambientGain.connect(masterGain || ctx.destination)

      ambientOsc1.start()
      ambientOsc2.start()
    } catch (e) {
      console.warn('Ambient drone error:', e)
    }
  },

  stopAmbientDrone: () => {
    if (ambientOsc1) {
      try {
        ambientOsc1.stop()
        ambientOsc2.stop()
        ambientOsc1.disconnect()
        ambientOsc2.disconnect()
      } catch (e) {}
      ambientOsc1 = null
      ambientOsc2 = null
    }
  },

  // 2. Door Creak on Room Entry
  playDoorCreak: () => {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(120, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.25)
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.6)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(400, ctx.currentTime)
    filter.Q.setValueAtTime(6.0, ctx.currentTime)

    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain || ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.7)
  },

  // 3. Heartbeat Pulse (Accelerates as player approaches bugged objects)
  playHeartbeat: (intensity = 1.0) => {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(55, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.18)

    gain.gain.setValueAtTime(0.4 * intensity, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)

    osc.connect(gain)
    gain.connect(masterGain || ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  },

  // 4. Relic Cleansed Chime
  playRelicFound: () => {
    const ctx = getAudioContext()
    if (!ctx) return

    const freqs = [523.25, 659.25, 783.99, 1046.50]
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08)

      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)

      osc.connect(gain)
      gain.connect(masterGain || ctx.destination)

      osc.start(ctx.currentTime + idx * 0.08)
      osc.stop(ctx.currentTime + 1.3)
    })
  },

  // 5. Jump Scare Audio
  playJumpScare: (type = 'door_slam') => {
    const ctx = getAudioContext()
    if (!ctx) return

    if (type === 'door_slam' || type === 'mirror_shatter') {
      const bufferSize = ctx.sampleRate * 0.55
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = type === 'mirror_shatter' ? 'highpass' : 'lowpass'
      filter.frequency.value = type === 'mirror_shatter' ? 2400 : 350

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.75, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(masterGain || ctx.destination)

      noise.start(ctx.currentTime)
    } else {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.2)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.7)

      gain.gain.setValueAtTime(0.6, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)

      osc.connect(gain)
      gain.connect(masterGain || ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.85)
    }
  },

  // 6. Intro Jump Scare (Pale face flash audio)
  playIntroScare: () => {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.3)
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.8)

    gain.gain.setValueAtTime(0.7, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.85)

    osc.connect(gain)
    gain.connect(masterGain || ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.9)
  },

  // 7. Sarcastic Skeleton Voice via Browser Speech Synthesis
  speakSkeletonRoast: (category = 'decoy', role = 'ghost') => {
    if (!('speechSynthesis' in window)) return

    const lines = {
      decoy: [
        "A clean file! Did you really think it would be that easy?",
        "Decoy triggered! Another candle dies in the dark.",
        "That code was innocent. Your judgment, however, is not.",
        "You disturbed empty dust. The phantom laughs at you."
      ],
      relic: [
        "Ah, you severed the cursed line. Impressive... for a mortal.",
        "Corrupted relic purged! But the mansion still holds many horrors.",
        "One less foul defect in this rotten repo."
      ],
      game_over: [
        "Your candles have burned to ash. The house claims your soul.",
        "All light has vanished. Welcome to eternal maintenance.",
        "The repository remains forever cursed."
      ]
    }

    const available = lines[category] || lines.decoy
    const chosenText = available[Math.floor(Math.random() * available.length)]

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(chosenText)
      utterance.pitch = 0.55 // Deep raspy pitch
      utterance.rate = 0.82  // Slow sinister cadence
      utterance.volume = isMuted ? 0 : currentVolume

      const voices = window.speechSynthesis.getVoices()
      const maleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Natural')))
      if (maleVoice) utterance.voice = maleVoice

      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('TTS error:', err)
    }
  }
}
