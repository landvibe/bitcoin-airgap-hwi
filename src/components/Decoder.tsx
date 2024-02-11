"use client";

import { ResultText } from "@/components/ResultText";
import { Button } from "@/components/ui/button";
import { CryptoPSBT, URRegistryDecoder } from "@keystonehq/bc-ur-registry";
import QrScanner from "qr-scanner";
import { useRef, useState } from "react";

export function Decoder() {
  const [rawSignedTransaction, setRawSignedTransaction] = useState("");
  const [signedPsbt, setSignedPsbt] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [scanningProgress, setScanningProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleScanQrCode = () => {
    if (videoRef.current) {
      setSignedPsbt("");
      setErrorMsg("");
      setScanningProgress(0);
      const urRegistryDecoder = new URRegistryDecoder();
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (result.data) {
            urRegistryDecoder.receivePart(result.data);
            setScanningProgress(urRegistryDecoder.getProgress());
            if (urRegistryDecoder.isComplete()) {
              try {
                const cryptoPSBT = urRegistryDecoder.resultRegistryType();
                if (isPSBT(cryptoPSBT)) {
                  const hex = cryptoPSBT.getPSBT().toString("hex");
                  const signedPsbt = hexToBase64(hex);
                  setSignedPsbt(signedPsbt);

                  /**
                   * TODO: Resolve bloew error
                   * Error: Can not finalize input #0
                   */
                  // import { Psbt } from "bitcoinjs-lib";
                  // const psbt = Psbt.fromHex(hex).finalizeAllInputs();
                  // setRawSignedTransaction(psbt.extractTransaction().toHex());
                } else {
                  setErrorMsg("invalid PSBT");
                }
              } catch (e: any) {
                setErrorMsg(e.toString());
              }
              qrScanner.stop();
            }
          }
        },
        { highlightScanRegion: true, highlightCodeOutline: true }
      );
      qrScanner.start();
    }
  };
  return (
    <div className="space-y-8">
      <div className="flex gap-4 items-center">
        <Button onClick={handleScanQrCode}>Scan signed PSBT</Button>
        {!!scanningProgress && (
          <div className="font-bold">
            {`scanning progress: ${scanningProgress * 100}%`}
          </div>
        )}
      </div>
      <video ref={videoRef}></video>
      {errorMsg && <div className="text-destructive">{errorMsg}</div>}
      {signedPsbt && (
        <ResultText
          desc="This is signed PSBT. You should call finalizepsbt to get raw transaction."
          text={signedPsbt}
        />
      )}
      {rawSignedTransaction && (
        <ResultText
          desc="This is rawSignedTransaction of the signed PSBT."
          text={rawSignedTransaction}
        />
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
