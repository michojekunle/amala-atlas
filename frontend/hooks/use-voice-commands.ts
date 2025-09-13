"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface VoiceCommand {
  command: string
  pattern: RegExp
  action: (matches: RegExpMatchArray) => void
  description: string
}

interface UseVoiceCommandsOptions {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
  continuous?: boolean
  language?: string
}

export function useVoiceCommands(options: UseVoiceCommandsOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [commands, setCommands] = useState<VoiceCommand[]>([])

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const { onResult, onError, onStart, onEnd, continuous = false, language = "en-US" } = options

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()

        const recognition = recognitionRef.current
        recognition.continuous = continuous
        recognition.interimResults = true
        recognition.lang = language
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
          console.log("[v0] Voice recognition started")
          setIsListening(true)
          onStart?.()
        }

        recognition.onresult = (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          const fullTranscript = finalTranscript || interimTranscript
          setTranscript(fullTranscript)

          if (finalTranscript) {
            console.log("[v0] Voice command received:", finalTranscript)
            processVoiceCommand(finalTranscript)
            onResult?.(finalTranscript)
          }
        }

        recognition.onerror = (event: any) => {
          console.error("[v0] Voice recognition error:", event.error)
          setIsListening(false)
          onError?.(event.error)
        }

        recognition.onend = () => {
          console.log("[v0] Voice recognition ended")
          setIsListening(false)
          onEnd?.()
        }
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [continuous, language, onResult, onError, onStart, onEnd])

  const processVoiceCommand = useCallback(
    (transcript: string) => {
      const lowerTranscript = transcript.toLowerCase().trim()

      for (const command of commands) {
        const matches = lowerTranscript.match(command.pattern)
        if (matches) {
          console.log("[v0] Voice command matched:", command.command)
          command.action(matches)
          return
        }
      }

      console.log("[v0] No voice command matched for:", transcript)
    },
    [commands],
  )

  const startListening = useCallback(() => {
    if (recognitionRef.current && isSupported && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("[v0] Failed to start voice recognition:", error)
        onError?.("Failed to start voice recognition")
      }
    }
  }, [isSupported, isListening, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const addCommand = useCallback((command: VoiceCommand) => {
    setCommands((prev) => [...prev, command])
  }, [])

  const removeCommand = useCallback((commandText: string) => {
    setCommands((prev) => prev.filter((cmd) => cmd.command !== commandText))
  }, [])

  const clearCommands = useCallback(() => {
    setCommands([])
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    commands,
    startListening,
    stopListening,
    addCommand,
    removeCommand,
    clearCommands,
  }
}
