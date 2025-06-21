import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-600 flex justify-center items-center" >
      Click <Link href={"/documents/124"} className="underline mx-1 text-blue-500">here</Link>to go to documentId
    </div>
  );
}

