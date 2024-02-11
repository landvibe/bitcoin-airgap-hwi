import { Decoder } from "@/components/Decoder";
import { Encoder } from "@/components/Encoder";
import { IconGithub } from "@/components/IconGithub";
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-3xl">Bitcoin Air-Gap Interface</h1>
        <Link
          href="https://github.com/landvibe/bitcoin-airgap-hwi"
          target="_blank"
        >
          <IconGithub />
        </Link>
      </div>
      <Encoder />
      <Decoder />
    </main>
  );
}
