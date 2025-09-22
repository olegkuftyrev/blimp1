'use client'

import { useEffect, useRef } from 'react'
import { Howl } from 'howler'

export function useSound() {
  const timerBeepRef = useRef<Howl | null>(null)
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLoopingRef = useRef<boolean>(false)

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
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current)
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
    console.log('🔊 playTimerBeepSequence called')
    console.log('🔊 Current time:', new Date().toISOString())
    
    if (timerBeepRef.current) {
      console.log('🔊 Playing timer beep sequence with Howl')
      try {
        // Play 3 quick beeps for timer completion
        const playResult = timerBeepRef.current.play()
        
        // Check if play() returns a Promise
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch((error) => {
            console.warn('Could not play sound sequence with Howl:', error)
            console.log('🔊 Falling back to Web Audio API')
            // Fallback: play 3 beeps using Web Audio API
            playFallbackBeep()
            setTimeout(() => playFallbackBeep(), 200)
            setTimeout(() => playFallbackBeep(), 400)
          })
        }
        
        setTimeout(() => {
          try {
            const playResult2 = timerBeepRef.current?.play()
            if (playResult2 && typeof playResult2.catch === 'function') {
              playResult2.catch((error) => {
                console.warn('Could not play second beep:', error)
              })
            }
          } catch (error) {
            console.warn('Could not play second beep:', error)
          }
        }, 200)
        
        setTimeout(() => {
          try {
            const playResult3 = timerBeepRef.current?.play()
            if (playResult3 && typeof playResult3.catch === 'function') {
              playResult3.catch((error) => {
                console.warn('Could not play third beep:', error)
              })
            }
          } catch (error) {
            console.warn('Could not play third beep:', error)
          }
        }, 400)
        
      } catch (error) {
        console.warn('🔊 Error playing with Howl, falling back to Web Audio API:', error)
        playFallbackBeep()
        setTimeout(() => playFallbackBeep(), 200)
        setTimeout(() => playFallbackBeep(), 400)
      }
    } else {
      console.warn('🔊 Timer beep ref is null, using fallback')
      playFallbackBeep()
      setTimeout(() => playFallbackBeep(), 200)
      setTimeout(() => playFallbackBeep(), 400)
    }
  }

  const playFallbackBeep = () => {
    try {
      console.log('🔊 Playing fallback beep with Web Audio API')
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
      console.log('🔊 Fallback beep played successfully')
    } catch (error) {
      console.warn('🔊 Fallback beep failed:', error)
    }
  }

  const startTimerBeepLoop = () => {
    if (isLoopingRef.current) {
      console.log('🔊 Timer beep loop already running')
      return
    }
    
    console.log('🔊 Starting timer beep loop')
    isLoopingRef.current = true
    
    const playBeep = () => {
      if (!isLoopingRef.current) return
      
      try {
        if (timerBeepRef.current) {
          const playResult = timerBeepRef.current.play()
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch((error) => {
              console.warn('Could not play beep in loop:', error)
              // Fallback to Web Audio API
              playFallbackBeep()
            })
          }
        } else {
          // Fallback to Web Audio API
          playFallbackBeep()
        }
      } catch (error) {
        console.warn('Error playing beep in loop:', error)
        playFallbackBeep()
      }
      
      // Schedule next beep in 2 seconds
      loopTimeoutRef.current = setTimeout(playBeep, 2000)
    }
    
    // Start the loop
    playBeep()
  }

  const stopTimerBeepLoop = () => {
    if (!isLoopingRef.current) {
      console.log('🔊 Timer beep loop not running')
      return
    }
    
    console.log('🔊 Stopping timer beep loop')
    isLoopingRef.current = false
    
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current)
      loopTimeoutRef.current = null
    }
  }

  const isTimerBeepLooping = () => {
    return isLoopingRef.current
  }

  return {
    playTimerBeep,
    playTimerBeepSequence,
    startTimerBeepLoop,
    stopTimerBeepLoop,
    isTimerBeepLooping,
  }
}
