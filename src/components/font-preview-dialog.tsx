"use client";
import { useState, useEffect } from "react";
import * as Dialog from "@/components/ui/dialog";
import type { FontMeta } from "@/lib/figlet/fonts-meta";
import figlet from "figlet";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface FontPreviewDialogProps {
  open: boolean;
  font: FontMeta | null;
  text: string;
  onClose: () => void;
}

export function FontPreviewDialog({ open, font, text, onClose }: FontPreviewDialogProps) {
  const [ascii, setAscii] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !font) return;
    figlet.text(text || " ", { font: font.id }, (err, data) => {
      if (err) { setAscii("Error rendering font"); return; }
      setAscii(data ?? "");
    });
  }, [open, font, text]);

  const handleCopy = async () => {
    if (!ascii) return;
    await navigator.clipboard.writeText(ascii);
    setCopied(true);
    toast.success(`Copied ${font?.name}!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-auto bg-background border-card-border">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle className="text-xl font-bold text-accent">
            {font?.name}
          </Dialog.DialogTitle>
          <Dialog.DialogDescription className="text-muted">
            Double-click to copy • Press ESC to close
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="relative cursor-pointer" onDoubleClick={handleCopy}>
          <pre className="ascii-text text-accent text-sm leading-tight overflow-auto whitespace-pre font-mono">
            {ascii || "Loading..."}
          </pre>
          {copied && (
            <div className="absolute top-2 right-2 bg-accent text-background px-2 py-1 rounded text-xs">
              Copied!
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:opacity-90 transition-opacity"
          >
            <Copy size={16} />
            Copy ASCII Art
          </button>
        </div>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}