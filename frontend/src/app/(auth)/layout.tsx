import {Sansita} from 'next/font/google';
import Link from 'next/link';
import Logout from '@/components/Logout';


const sansita = Sansita({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-geist-mono'
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <header className="w-full flex justify-start min-h-[8dvh] border-b-2 border-gray-200 items-center px-2">
          <Link href='/start'>
            <h1 className={`${sansita.className} text-xl`}>newsmood</h1>
          </Link>
          <Logout></Logout>
        </header>
        <main>
            {children}  
        </main>
        <footer>
            
        </footer>
    </>
          

  );
}
