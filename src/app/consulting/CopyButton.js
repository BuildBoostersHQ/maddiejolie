'use client'
import { useState } from 'react'

// Copies a bio to the clipboard so a host or reporter can paste it as written.
export default function CopyButton({ text }) {
  const [done, setDone] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1800)
    } catch {}
  }
  return (
    <button type="button" className="cs-copy" onClick={copy}>
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}
