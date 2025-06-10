import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navigation from "@/components/nav/Navigation";
import Footer from "@/components/nav/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Treningsglede",
  description: "Your personal training companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
