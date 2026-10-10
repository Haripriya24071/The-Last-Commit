/**
 * High-Performance Horror Audio Engine.
 * Uses Web Audio API synthesis for zero-latency, offline ambient horror, heartbeat, and jump scare sounds.
 */

let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export const AudioEngine = {
  unlock: () => {
    getAudioContext()
  },

  // 1. Low Thud / Heartbeat Pulse (Speeds up when near relics)
  playHeartbeat: (intensity = 1.0) => {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(55, ctx.currentTime) // Low A1
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.18)

    gain.gain.setValueAtTime(0.4 * intensity, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  },

  // 2. Relic Discovery Chime (High spectral resonance)
  playRelicFound: () => {
    const ctx = getAudioContext()
    if (!ctx) return

    const freqs = [523.25, 659.25, 783.99, 1046.50] // C major celestial chord
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08)

      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + idx * 0.08)
      osc.stop(ctx.currentTime + 1.3)
    })
  },

  // 3. Jump Scare Sounds
  playJumpScare: (type = 'door_slam') => {
    const ctx = getAudioContext()
    if (!ctx) return

    if (type === 'door_slam' || type === 'mirror_shatter') {
      // Noise burst + violent low impact
      const bufferSize = ctx.sampleRate * 0.6
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
      gain.gain.setValueAtTime(0.8, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noise.start(ctx.currentTime)
    } else {
      // High pitch spectral screech
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.2)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.7)

      gain.gain.setValueAtTime(0.6, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.85)
    }
  },

  // 4. Sarcastic Skeleton Voice via Web Speech API
  speakSkeletonRoast: (text) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel() // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.pitch = 0.65 // Deep raspy pitch
    utterance.rate = 0.85  // Slow ominous cadence
    utterance.volume = 0.9

    // Find English voice if available
    const voices = window.speechSynthesis.getVoices()
    const maleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George')))
    if (maleVoice) utterance.voice = maleVoice

    window.speechSynthesis.speak(utterance)
  }
}
