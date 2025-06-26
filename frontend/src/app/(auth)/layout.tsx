import {Geist_Mono, Sansita} from 'next/font/google';
import Link from 'next/link';

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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <header className="w-full flex justify-start min-h-[8vh] border-b-2 border-gray-200 items-center px-2">
          <Link href='/start'>
            <h1 className={`${sansita.className} text-xl`}>newsmood</h1>
          </Link>
          
            <form method="POST" action="/api/auth/logout" className="ml-auto">
                <input type="submit" value="Logout" className={`${geistmono.className} px-2 py-1 bg-amber-300 my-1 rounded-xl hover:opacity-80`}/>
            </form>
        </header>
        <main>
            {children}  
        </main>
        <footer>
            
        </footer>
    </>
          

  );
}
