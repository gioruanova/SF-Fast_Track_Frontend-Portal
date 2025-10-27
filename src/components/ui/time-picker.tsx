"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  disabledTimes?: string[];
  placeholder?: string;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  disabledTimes = [],
  placeholder = "Seleccionar hora",
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Generar horas del día (00:00 a 23:30 en intervalos de 30 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatTime = (time: string) => {
    if (!time) return placeholder;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const min = parseInt(minutes);
    
    if (hour === 0 && min === 0) return "12:00 AM";
    if (hour === 12 && min === 0) return "12:00 PM";
    if (hour < 12) return `${hour}:${minutes} AM`;
    return `${hour - 12}:${minutes} PM`;
  };

  const isTimeDisabled = (time: string) => {
    return disabledTimes.includes(time);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTime(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="max-h-60 overflow-y-auto p-2">
          <div className="grid grid-cols-2 gap-1">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={value === time ? "default" : "ghost"}
                size="sm"
                disabled={isTimeDisabled(time)}
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
                className={cn(
                  "justify-start text-xs",
                  isTimeDisabled(time) && "opacity-50 cursor-not-allowed"
                )}
              >
                {formatTime(time)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
