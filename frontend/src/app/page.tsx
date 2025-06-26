import Link from "next/link";
import Image from "next/image";
import {Geist_Mono, Sansita} from 'next/font/google';

const geistmono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-geist-mono'
})

const sansita = Sansita({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-geist-mono'
})


export default function Home() {
  return (
    <div>
      {/* Header homepage*/}
      <div className={`flex bg-white h-[10vh] items-center border-b-2 border-gray-200 ${geistmono.className}`}>
        <Link href='/' className="ml-3 text-2xl text-black">NewsMood</Link>
        <Link href='/login' className="bg-black font-bold text-l text-white rounded-2xl mr-2 px-3 py-1 ml-auto hover:opacity-80">Login</Link>
      </div>
      {/* Main homepage*/}
      <div className={`${sansita.className}`}>
        <div className={`bg-yellow-400 my-[4vh] mx-[5vw] px-[4vw] py-[3vh] rounded-xl`}>
          <h1 className="text-2xl">Beobachte immer die aktuelle Lage deiner Reportings</h1>
          <h2 className="mt-2">Scanne News schnell mit unseren umfangreichen Quellen</h2>
          <h2>Verfolge die Stimmung der News</h2>
          <h2>Scanne nach Keywörtern</h2>
          <h2>Erstelle nützliche Übersichten</h2>
          <h2>Exportiere deine Daten to Excel</h2>
        </div>

        <div className="my-[4vh] mx-[5vw] px-[4vw] py-[3vh] bg-gray-950 rounded-xl text-white">
          <h1 className="text-2xl">Dein Produktivitäts-Boost</h1>
          <h2 className="mb-2">Ab 0 $</h2>
          <img src="/bulb.jpg" alt="Homepage Image"  className="mb-4"/>
          <Link href={'./signup'} className="bg-gray-50 text-gray-950 py-1 px-2 rounded-2xl hover:opacity-95">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
