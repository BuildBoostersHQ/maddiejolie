import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export async function GET() {
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
    // --- MRR: from active subscriptions ---
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

    // Also get trialing subscriptions (they'll convert)
    hasMore = true
    startingAfter = undefined
    while (hasMore) {
      const params = { status: 'trialing', limit: 100, expand: ['data.items.data.price'] }
      if (startingAfter) params.starting_after = startingAfter

      const batch = await stripe.subscriptions.list(params)
      subscriptions.push(...batch.data)
      hasMore = batch.has_more
      if (batch.data.length > 0) {
        startingAfter = batch.data[batch.data.length - 1].id
      }
    }

    // Calculate MRR from subscriptions (not payments)
    let mrrCents = 0
    for (const sub of subscriptions) {
      // Skip if paused
      if (sub.pause_collection) continue

      for (const item of sub.items.data) {
        const price = item.price
        const qty = item.quantity || 1
        let amount = (price.unit_amount || 0) * qty

        // Apply discount if any
        if (sub.discount?.coupon) {
          const coupon = sub.discount.coupon
          if (coupon.percent_off) {
            amount = Math.round(amount * (1 - coupon.percent_off / 100))
          } else if (coupon.amount_off) {
            amount = Math.max(0, amount - coupon.amount_off)
          }
        }

        // Normalize to monthly
        if (price.recurring?.interval === 'month') {
          const count = price.recurring?.interval_count || 1
          mrrCents += Math.round(amount / count)
        } else if (price.recurring?.interval === 'year') {
          const count = price.recurring?.interval_count || 1
          mrrCents += Math.round(amount / (12 * count))
        } else if (price.recurring?.interval === 'week') {
          const count = price.recurring?.interval_count || 1
          mrrCents += Math.round((amount * 52) / (12 * count))
        } else if (price.recurring?.interval === 'day') {
          const count = price.recurring?.interval_count || 1
          mrrCents += Math.round((amount * 365) / (12 * count))
        }
      }
    }

    const clients = subscriptions.filter(s => !s.pause_collection).length
    const mrr = mrrCents / 100

    // MRR growth: compare to subs that existed 30 days ago
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
    const oldSubs = subscriptions.filter(s => s.created < thirtyDaysAgo && !s.pause_collection)
    let oldMrrCents = 0
    for (const sub of oldSubs) {
      for (const item of sub.items.data) {
        const price = item.price
        const qty = item.quantity || 1
        let amount = (price.unit_amount || 0) * qty
        if (sub.discount?.coupon?.percent_off) {
          amount = Math.round(amount * (1 - sub.discount.coupon.percent_off / 100))
        } else if (sub.discount?.coupon?.amount_off) {
          amount = Math.max(0, amount - sub.discount.coupon.amount_off)
        }
        if (price.recurring?.interval === 'month') {
          oldMrrCents += Math.round(amount / (price.recurring?.interval_count || 1))
        } else if (price.recurring?.interval === 'year') {
          oldMrrCents += Math.round(amount / (12 * (price.recurring?.interval_count || 1)))
        }
      }
    }
    const oldMrr = oldMrrCents / 100
    const mrrGrowth = oldMrr > 0 ? Math.round(((mrr - oldMrr) / oldMrr) * 100) : (mrr > 0 ? 100 : 0)
    const oldClients = oldSubs.length
    const clientGrowth = oldClients > 0 ? Math.round(((clients - oldClients) / oldClients) * 100) : (clients > 0 ? 100 : 0)

    // --- PAYMENTS: actual money received this month ---
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // This month's successful charges
    const thisMonthCharges = []
    hasMore = true
    startingAfter = undefined
    while (hasMore) {
      const params = {
        limit: 100,
        created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
      }
      if (startingAfter) params.starting_after = startingAfter

      const batch = await stripe.charges.list(params)
      thisMonthCharges.push(...batch.data.filter(c => c.status === 'succeeded' && !c.refunded))
      hasMore = batch.has_more
      if (batch.data.length > 0) {
        startingAfter = batch.data[batch.data.length - 1].id
      }
    }

    // Last month's charges for comparison
    const lastMonthCharges = []
    hasMore = true
    startingAfter = undefined
    while (hasMore) {
      const params = {
        limit: 100,
        created: {
          gte: Math.floor(startOfLastMonth.getTime() / 1000),
          lt: Math.floor(startOfMonth.getTime() / 1000),
        },
      }
      if (startingAfter) params.starting_after = startingAfter

      const batch = await stripe.charges.list(params)
      lastMonthCharges.push(...batch.data.filter(c => c.status === 'succeeded' && !c.refunded))
      hasMore = batch.has_more
      if (batch.data.length > 0) {
        startingAfter = batch.data[batch.data.length - 1].id
      }
    }

    const paymentsThisMonth = thisMonthCharges.reduce((sum, c) => sum + c.amount, 0) / 100
    const paymentsLastMonth = lastMonthCharges.reduce((sum, c) => sum + c.amount, 0) / 100
    const paymentsGrowth = paymentsLastMonth > 0
      ? Math.round(((paymentsThisMonth - paymentsLastMonth) / paymentsLastMonth) * 100)
      : (paymentsThisMonth > 0 ? 100 : 0)

    // Debug
    const debug = {
      totalSubscriptions: subscriptions.length,
      activeNonPaused: clients,
      subscriptionDetails: subscriptions.map(s => ({
        id: s.id,
        status: s.status,
        created: new Date(s.created * 1000).toISOString(),
        paused: !!s.pause_collection,
        items: s.items.data.map(i => ({
          amount: i.price?.unit_amount,
          interval: i.price?.recurring?.interval,
          interval_count: i.price?.recurring?.interval_count,
          qty: i.quantity,
          currency: i.price?.currency,
          product: i.price?.product,
        })),
        discount: s.discount ? {
          percent_off: s.discount.coupon?.percent_off,
          amount_off: s.discount.coupon?.amount_off,
        } : null,
      })),
      chargesThisMonth: thisMonthCharges.length,
      chargesLastMonth: lastMonthCharges.length,
    }

    return NextResponse.json({
      mrr,
      clients,
      mrrGrowth,
      clientGrowth,
      paymentsThisMonth,
      paymentsLastMonth,
      paymentsGrowth,
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
