import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Archivo, JetBrains_Mono } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        :root { --font-archivo: ${archivo.style.fontFamily}; --font-jetbrains: ${jetbrains.style.fontFamily}; }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
