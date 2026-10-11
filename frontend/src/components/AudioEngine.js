/**
 * AudioEngine — Sound effects silenced as requested.
 * All procedural sound effects disabled.
 */

let isMuted = true
let currentVolume = 0

export const ROLE_VOICE_LINES = {
  ghost: { name: 'THE GHOST', color: '#38bdf8' },
  reaper: { name: 'THE REAPER', color: '#ef4444' },
  skeleton: { name: 'THE SKELETON', color: '#fbbf24' }
}

export const AudioEngine = {
  init: () => {},
  unlock: () => {},
  setVolume: () => {},
  toggleMute: () => true,
  getIsMuted: () => true,
  getVolume: () => 0,

  startAmbientDrone: () => {},
  stopAmbientDrone: () => {},
  playFootstep: () => {},
  playDoorCreak: () => {},
  playHeartbeat: () => {},
  playRelicFound: () => {},
  playJumpScare: () => {},
  playUiClick: () => {},
  playUiHover: () => {},
  speakVoiceLine: () => {}
}
