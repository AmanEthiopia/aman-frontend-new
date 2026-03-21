"use client"

import { useState, useEffect } from "react"
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Lock, CheckCircle2, AlertCircle } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface PaymentFormProps {
  clientSecret: string
  amount: string
  currency: string
  bookingType: "hotel" | "restaurant" | "package" | "transport"
  bookingId: string
  onSuccess: () => void
  onError: (error: string) => void
}

function CheckoutForm({ 
  amount, 
  currency, 
  onSuccess, 
  onError 
}: { 
  amount: string
  currency: string
  onSuccess: () => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings/confirmation`,
        },
        redirect: "if_required",
      })

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.")
        onError(error.message || "Payment failed")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess()
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred")
      onError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border p-4">
        <PaymentElement 
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between rounded-lg bg-muted p-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold">
            {currency} {parseFloat(amount).toLocaleString()}
          </p>
        </div>
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {currency} {parseFloat(amount).toLocaleString()}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}

export function PaymentForm({
  clientSecret,
  amount,
  currency,
  bookingType,
  bookingId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#0f766e",
      borderRadius: "8px",
    },
  }

  const bookingTypeLabels = {
    hotel: "Hotel Booking",
    restaurant: "Restaurant Reservation",
    package: "Travel Package",
    transport: "Transport Booking",
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          Secure payment for your {bookingTypeLabels[bookingType]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance,
          }}
        >
          <CheckoutForm
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  )
}

// Payment Success Component
export function PaymentSuccess({ 
  bookingNumber,
  onContinue 
}: { 
  bookingNumber: string
  onContinue: () => void 
}) {
  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle>Payment Successful!</CardTitle>
        <CardDescription>
          Your booking has been confirmed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Booking Reference</p>
          <p className="text-xl font-bold font-mono">{bookingNumber}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent to your registered email address.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={onContinue} className="w-full">
          View My Bookings
        </Button>
      </CardFooter>
    </Card>
  )
}

// Payment Pending Component (for when payment is required but not yet made)
export function PaymentPending({
  amount,
  currency,
  onPay,
  onCancel,
}: {
  amount: string
  currency: string
  onPay: () => void
  onCancel: () => void
}) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          Payment Required
        </CardTitle>
        <CardDescription>
          Your booking is reserved but requires payment to confirm
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">Amount Due</p>
          <p className="text-3xl font-bold">
            {currency} {parseFloat(amount).toLocaleString()}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete your payment to secure your booking. The provider will confirm 
          your reservation once payment is received.
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onPay} className="flex-1">
          <CreditCard className="mr-2 h-4 w-4" />
          Pay Now
        </Button>
      </CardFooter>
    </Card>
  )
}
