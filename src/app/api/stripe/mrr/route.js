import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export async function GET() {
  // Debug: check if key exists
  if (!stripe) {
    return NextResponse.json({
      error: 'Stripe not configured',
      debug: {
        hasKey: !!process.env.STRIPE_SECRET_KEY,
        keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 8) || 'missing',
      }
    }, { status: 500 })
  }

  try {
    // Get all active subscriptions
    const subscriptions = []
    let hasMore = true
    let startingAfter = undefined

    while (hasMore) {
      const params = { status: 'active', limit: 100, expand: ['data.items.data.price'] }
      if (startingAfter) params.starting_after = startingAfter

      const batch = await stripe.subscriptions.list(params)
      subscriptions.push(...batch.data)
      hasMore = batch.has_more
      if (batch.data.length > 0) {
        startingAfter = batch.data[batch.data.length - 1].id
      }
    }

    // Debug: log what we found
    const debug = {
      totalSubscriptions: subscriptions.length,
      statuses: subscriptions.map(s => s.status),
      items: subscriptions.map(s => s.items.data.map(i => ({
        amount: i.price?.unit_amount,
        interval: i.price?.recurring?.interval,
        qty: i.quantity,
        currency: i.price?.currency,
      }))),
    }

    // Calculate current MRR
    let mrrCents = 0
    for (const sub of subscriptions) {
      for (const item of sub.items.data) {
        const price = item.price
        const qty = item.quantity || 1
        const amount = (price.unit_amount || 0) * qty

        if (price.recurring?.interval === 'month') {
          mrrCents += amount
        } else if (price.recurring?.interval === 'year') {
          mrrCents += Math.round(amount / 12)
        } else if (price.recurring?.interval === 'week') {
          mrrCents += Math.round(amount * 4.33)
        }
      }
    }

    const clients = subscriptions.length
    const mrr = mrrCents / 100

    // Get last month's MRR for % change
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
    const oldSubs = subscriptions.filter(s => s.start_date < thirtyDaysAgo)
    let oldMrrCents = 0
    for (const sub of oldSubs) {
      for (const item of sub.items.data) {
        const price = item.price
        const qty = item.quantity || 1
        const amount = (price.unit_amount || 0) * qty
        if (price.recurring?.interval === 'month') oldMrrCents += amount
        else if (price.recurring?.interval === 'year') oldMrrCents += Math.round(amount / 12)
        else if (price.recurring?.interval === 'week') oldMrrCents += Math.round(amount * 4.33)
      }
    }

    const oldMrr = oldMrrCents / 100
    const mrrGrowth = oldMrr > 0 ? Math.round(((mrr - oldMrr) / oldMrr) * 100) : (mrr > 0 ? 100 : 0)

    const oldClients = oldSubs.length
    const clientGrowth = oldClients > 0 ? Math.round(((clients - oldClients) / oldClients) * 100) : (clients > 0 ? 100 : 0)

    return NextResponse.json({
      mrr,
      clients,
      mrrGrowth,
      clientGrowth,
      debug,
    })

  } catch (err) {
    return NextResponse.json({
      error: err.message,
      type: err.type || 'unknown',
      code: err.code || 'unknown',
    }, { status: 500 })
  }
}
