"use client"

import React from "react"
import Link from "next/link"

/**
 * Minimal renderer for AI assistant replies.
 * Converts markdown links [text](url) into clickable links (internal ones use
 * Next.js routing) and **bold** into <strong> — so raw paths/syntax are never
 * shown to the user.
 */

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g
const BOLD_RE = /\*\*([^*]+)\*\*/g

function renderBold(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let last = 0
  let i = 0
  for (const match of text.matchAll(BOLD_RE)) {
    const idx = match.index ?? 0
    if (idx > last) nodes.push(text.slice(last, idx))
    nodes.push(<strong key={`${keyPrefix}-b${i++}`}>{match[1]}</strong>)
    last = idx + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function AIMessage({ content }: { content: string }) {
  const nodes: React.ReactNode[] = []
  let last = 0
  let i = 0

  for (const match of content.matchAll(LINK_RE)) {
    const idx = match.index ?? 0
    if (idx > last) nodes.push(...renderBold(content.slice(last, idx), `t${i}`))

    const label = match[1].replace(/\*\*/g, "")
    const url = match[2]
    const isInternal = url.startsWith("/")
    nodes.push(
      isInternal ? (
        <Link key={`l${i++}`} href={url} className="font-medium text-primary underline underline-offset-2 hover:opacity-80">
          {label}
        </Link>
      ) : (
        <a
          key={`l${i++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        >
          {label}
        </a>
      ),
    )
    last = idx + match[0].length
  }
  if (last < content.length) nodes.push(...renderBold(content.slice(last), "tail"))

  return <span className="whitespace-pre-wrap">{nodes}</span>
}
