"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Ecc, QrCode } from "@/util/qrcodegen";
import { CryptoPSBT } from "@keystonehq/bc-ur-registry";
import { useEffect, useRef, useState } from "react";

export function Encoder() {
  const [psbt, setPsbt] = useState("");
  const [qrList, setQrList] = useState<QrCode[]>([]);
  const [qrScale, setQrScale] = useState(6);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (qrList.length) {
      let index = 0;
      const id = setInterval(() => {
        index++;
        if (index === qrList.length) {
          index = 0;
        }
        const qr = qrList[index];
        if (ref.current) {
          drawCanvas({
            qr,
            scale: qrScale,
            border: 0,
            lightColor: "#FFFFFF",
            darkColor: "#000000",
            canvas: ref.current,
          });
        }
      }, 1000);
      return () => clearInterval(id);
    }
  }, [qrList, qrScale]);

  const handleEncode = () => {
    const MAX_QR_LENGTH = 600;

    // cbor reference: https://github.com/BlockchainCommons/crypto-commons/blob/master/Docs/ur-4-psbt.md#prbts-crypto-psbt
    const hex = base64ToHex(psbt);
    const size = hex.length / 2;
    const prefix = "59" + numberToHex(size);
    const cbor = prefix + hex;
    const cryptoPSBT = CryptoPSBT.fromCBOR(Buffer.from(cbor, "hex"));
    const encoder = cryptoPSBT.toUREncoder(MAX_QR_LENGTH);

    const newQrList: QrCode[] = [];
    for (let i = 0; i < encoder.fragmentsLength; i++) {
      newQrList.push(
        QrCode.encodeText(encoder.nextPart().toLocaleUpperCase(), Ecc.LOW)
      );
    }
    setQrList(newQrList);
  };

  return (
    <div>
      <div className="font-bold">
        This is unsigned PSBT (ex. result of walletcreatefundedpsbt)
      </div>
      <div className="h-1" />
      <div className="flex gap-3">
        <Input
          value={psbt}
          onChange={(e) => setPsbt(e.currentTarget.value)}
          placeholder="Input PSBT"
        />
        <Button onClick={handleEncode}>Generate QR</Button>
      </div>
      <div className="h-8" />
      {!!qrList.length && (
        <>
          <div>QR Size</div>
          <Slider
            defaultValue={[6]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setQrScale(value[0])}
          />
        </>
      )}
      <div className="h-8" />
      <div className="flex justify-center">
        <canvas ref={ref} />
      </div>
    </div>
  );
}

// reference: https://github.com/nayuki/QR-Code-generator/blob/master/typescript-javascript/qrcodegen-output-demo.ts
function drawCanvas({
  qr,
  scale,
  border,
  lightColor,
  darkColor,
  canvas,
}: {
  qr: QrCode;
  scale: number;
  border: number;
  lightColor: string;
  darkColor: string;
  canvas: HTMLCanvasElement;
}): void {
  if (scale <= 0 || border < 0) throw new RangeError("Value out of range");
  const width: number = (qr.size + border * 2) * scale;
  canvas.width = width;
  canvas.height = width;
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  for (let y = -border; y < qr.size + border; y++) {
    for (let x = -border; x < qr.size + border; x++) {
      ctx.fillStyle = qr.getModule(x, y) ? darkColor : lightColor;
      ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
    }
  }
}

function numberToHex(number: number) {
  const hex = number.toString(16);
  return hex.length % 2 ? "0" + hex : hex;
}
function base64ToHex(base64: string) {
  const binaryString = atob(base64);
  return Array.from(binaryString)
    .map((byte) => byte.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}
