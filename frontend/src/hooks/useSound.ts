'use client'

import { useEffect, useRef } from 'react'
import { Howl } from 'howler'

export function useSound() {
  const timerBeepRef = useRef<Howl | null>(null)

  useEffect(() => {
    // Initialize the timer beep sound
    timerBeepRef.current = new Howl({
      src: ['/timer-beep.mp3'],
      volume: 0.7,
      preload: true,
    })

    // Cleanup on unmount
    return () => {
      if (timerBeepRef.current) {
        timerBeepRef.current.unload()
      }
    }
  }, [])

  const playTimerBeep = () => {
    if (timerBeepRef.current) {
      timerBeepRef.current.play().catch((error) => {
        console.warn('Could not play sound:', error)
        // Fallback: try to play a simple beep using Web Audio API
        playFallbackBeep()
      })
    }
  }

  const playTimerBeepSequence = () => {
    if (timerBeepRef.current) {
      // Play 3 quick beeps for timer completion
      timerBeepRef.current.play().catch((error) => {
        console.warn('Could not play sound sequence:', error)
        // Fallback: play 3 beeps using Web Audio API
        playFallbackBeep()
        setTimeout(() => playFallbackBeep(), 200)
        setTimeout(() => playFallbackBeep(), 400)
      })
      
      setTimeout(() => timerBeepRef.current?.play().catch(() => {}), 200)
      setTimeout(() => timerBeepRef.current?.play().catch(() => {}), 400)
    }
  }

  const playFallbackBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Fallback beep failed:', error)
    }
  }

  return {
    playTimerBeep,
    playTimerBeepSequence,
  }
}
