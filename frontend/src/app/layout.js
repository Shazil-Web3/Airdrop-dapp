import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "../components/LenisProvider.jsx";
import { Providers } from "../components/Providers.jsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hivox",
  description: "Hivox is a decentralized platform for creating and managing decentralized autonomous organizations (DAOs).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        <Providers>
          <LenisProvider>
            {children}
          </LenisProvider>
        </Providers>
      </body>
    </html>
  );
}
