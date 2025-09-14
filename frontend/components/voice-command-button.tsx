"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceCommands } from "@/hooks/use-voice-commands";

interface VoiceCommandButtonProps {
  onTranscript?: (transcript: string) => void;
  onCommand?: (command: string) => void;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  commands?: Array<{
    command: string;
    pattern: RegExp;
    action: () => void;
    description: string;
  }>;
}

export function VoiceCommandButton({
  onTranscript,
  onCommand,
  className,
  size = "icon",
  variant = "outline",
  commands = [],
}: VoiceCommandButtonProps) {
  const [showCommands, setShowCommands] = useState(false);

  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    addCommand,
    clearCommands,
  } = useVoiceCommands({
    onResult: (transcript) => {
      onTranscript?.(transcript);
    },
    onError: (error) => {
      console.error(" Voice command error:", error);
    },
  });

  useEffect(() => {
    clearCommands();
    commands.forEach((cmd) => {
      addCommand({
        command: cmd.command,
        pattern: cmd.pattern,
        action: () => {
          cmd.action();
          onCommand?.(cmd.command);
        },
        description: cmd.description,
      });
    });
  }, [commands, addCommand, clearCommands, onCommand]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={toggleListening}
        variant={variant}
        size={size}
        className={cn(
          "transition-all duration-200",
          isListening &&
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive",
          className
        )}
        onMouseEnter={() => setShowCommands(true)}
        onMouseLeave={() => setShowCommands(false)}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {size !== "icon" && (
          <span className="ml-2">{isListening ? "Stop" : "Voice"}</span>
        )}
      </Button>

      {isListening && transcript && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-48">
          <div className="flex items-center space-x-2 mb-2">
            <Volume2 className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium">Listening...</span>
          </div>
          <p className="text-xs text-muted-foreground">{transcript}</p>
        </div>
      )}

      {showCommands && commands.length > 0 && !isListening && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-background border border-border rounded-lg shadow-lg z-[9999] min-w-64">
          <div className="flex items-center space-x-2 mb-2">
            <Mic className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium">Voice Commands</span>
          </div>
          <div className="space-y-1">
            {commands.slice(0, 4).map((cmd, index) => (
              <div key={index} className="text-xs">
                <Badge variant="secondary" className="text-xs mr-2">
                  "{cmd.command}"
                </Badge>
                <span className="text-muted-foreground">{cmd.description}</span>
              </div>
            ))}
            {commands.length > 4 && (
              <p className="text-xs text-muted-foreground">
                +{commands.length - 4} more commands...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
