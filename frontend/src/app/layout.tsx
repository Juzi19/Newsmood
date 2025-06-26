import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "newsmood",
  description: "Track the sentiment of your news",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        {children}        
      </body>
    </html>
  );
}
