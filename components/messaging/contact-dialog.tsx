"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { startConversation, type RelatedToType } from "@/lib/api/messages"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface ContactDialogProps {
  recipientId: string
  recipientName: string
  relatedToType: RelatedToType
  relatedToId: string
  relatedToName?: string
  children?: React.ReactNode
}

export function ContactDialog({
  recipientId,
  recipientName,
  relatedToType,
  relatedToId,
  relatedToName,
  children,
}: ContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleSend = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send messages",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both subject and message",
        variant: "destructive",
      })
      return
    }

    try {
      setSending(true)
      const result = await startConversation({
        recipient_id: recipientId,
        related_to_type: relatedToType,
        related_to_id: relatedToId,
        subject: subject.trim(),
        message: message.trim(),
      })

      toast({
        title: result.reused ? "Message sent" : "Conversation started",
        description: result.reused
          ? "Your message has been added to the existing conversation"
          : "Your message has been sent successfully",
      })

      setOpen(false)
      setSubject("")
      setMessage("")

      // Navigate to the conversation
      router.push(`/messages?conversation=${result.id}`)
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const defaultSubject = relatedToName
    ? `Question about ${relatedToName}`
    : `Inquiry about ${relatedToType}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact {recipientName}</DialogTitle>
          <DialogDescription>
            Send a message about {relatedToName || "this listing"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={defaultSubject}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="min-h-[120px]"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/2000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
