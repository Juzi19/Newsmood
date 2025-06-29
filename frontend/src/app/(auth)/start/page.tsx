import {Geist_Mono} from 'next/font/google';
import Link from 'next/link';

const geistmono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-geist-mono'
})
const geistmonobold = Geist_Mono({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-geist-mono'
})

export default function Start(){
    return(
        <div className='w-full flex flex-col items-center min-h-[90dvh]'>
            <h1 className={`text-center text-xl ${geistmono.className} pt-4`}>Behalten Sie die Stimmung der Berichterstattung im Blick</h1>
            <div className='m-4'>
              <img src="/newsmood.png" alt="Newsmood image" className='rounded-xl' />
            </div>
            <Link href="/searches" className={`bg-black ${geistmonobold.className} text-gray-50 text-center mb-4 px-2 py-2 rounded-xl hover:opacity-85`} id='rb-button'>Zu meinen Suchbegriffen</Link>
            <Link href="/settings" className={`bg-black ${geistmonobold.className} text-gray-50 text-center mb-4 px-2 py-2 rounded-xl hover:opacity-85`} >Einstellungen & Profil</Link>
        </div>
    )
}