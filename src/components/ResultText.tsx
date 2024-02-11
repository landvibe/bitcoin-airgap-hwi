"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  desc: string;
  text: string;
}

export function ResultText({ desc, text }: Props) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied successfully");
    } catch {}
  };
  return (
    <div>
      <div className="font-bold">{desc}</div>
      <div className="h-1" />
      <div className="flex gap-4">
        <div className="break-all">{text}</div>
        <Button onClick={handleCopy}>Copy to clipboard</Button>
      </div>
    </div>
  );
}
