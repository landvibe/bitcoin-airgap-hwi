"use client";

import { Button } from "@/components/ui/button";
import { CryptoPSBT, URRegistryDecoder } from "@keystonehq/bc-ur-registry";
import QrScanner from "qr-scanner";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function Decoder() {
  const [signedPsbt, setSignedPsbt] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleScanQrCode = () => {
    if (videoRef.current) {
      setSignedPsbt("");
      setErrorMsg("");
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (result.data) {
            const ur = result.data;
            try {
              const urRegistryDecoder = new URRegistryDecoder();
              urRegistryDecoder.receivePart(ur);
              const cryptoPSBT = urRegistryDecoder.resultRegistryType();
              if (isPSBT(cryptoPSBT)) {
                const hex = cryptoPSBT.getPSBT().toString("hex");
                const signedPsbt = hexToBase64(hex);
                setSignedPsbt(signedPsbt);
              } else {
                setErrorMsg("invalid PSBT");
              }
            } catch (e: any) {
              setErrorMsg(e.toString());
            }
            qrScanner.stop();
          }
        },
        {}
      );
      qrScanner.start();
    }
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(signedPsbt);
      toast("success to copy");
    } catch {}
  };
  return (
    <div>
      <Button onClick={handleScanQrCode}>Scan signed PSBT</Button>
      <div className="h-8" />
      <video ref={videoRef}></video>
      {errorMsg && <div className="text-destructive">{errorMsg}</div>}
      {signedPsbt && (
        <div>
          <div className="font-bold">
            This is signed PSBT. You should call finalizepsbt to get raw
            transaction.
          </div>
          <div className="h-1" />
          <div className="flex gap-4">
            <div className="break-all">{signedPsbt}</div>
            <Button onClick={handleCopy}>Copy to clipboard</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function isPSBT(params: any): params is CryptoPSBT {
  return "getPSBT" in params;
}

function hexToBase64(hex: string) {
  const bytes = new Uint8Array(
    hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  );
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ""
  );
  return btoa(binary);
}
