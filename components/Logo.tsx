// components/Logo.tsx
'use client'

import Link from 'next/link'
import { Slackey } from 'next/font/google'

// Import font directly here
const logoFont = Slackey({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-logo',
})

export default function Logo() {
  return (
    <Link href="/" className={`text-3xl font-bold tracking-tight ${logoFont.className}`}>
      Treningsglede
    </Link>
  )
}
