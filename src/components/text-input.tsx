// src/components/text-input.tsx

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: TextInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync localValue when prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const scheduleOnChange = useCallback((newValue: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      onChange(localValue);
    }
  }, [localValue, onChange]);

  const handleBlur = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onChange(localValue);
  }, [localValue, onChange]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Input
        type="text"
        value={localValue}
        onChange={(e) => {
          handleChange(e);
          scheduleOnChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="输入任意文本，浏览全部字体效果..."
        className="text-center text-lg"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}