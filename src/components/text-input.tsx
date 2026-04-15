// src/components/text-input.tsx

"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: TextInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onChange(localValue);
    }
  }, [localValue, onChange]);

  const handleBlur = useCallback(() => {
    onChange(localValue);
  }, [localValue, onChange]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
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
