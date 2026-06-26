import React, { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { subscriptionAPI, paymentAPI } from '../../services/api'
import { demoPlans } from '../../lib/demoData'

const Pricing = () => {
  const [plans, setPlans] = useState(demoPlans)
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    subscriptionAPI.getPlans().then((data) => { if (data?.plans) setPlans(data.plans) }).catch(() => {})
    subscriptionAPI.getMySubscription().then(setCurrent).catch(() => {})
  }, [])

  const subscribe = async (planId) => {
    setLoading(true)
    try {
      const result = await subscriptionAPI.create({ planId })
      if (result.paymentUrl) window.open(result.paymentUrl, '_blank')
      else await paymentAPI.initiate({ amount: plans.find((p) => p.id === planId)?.price, type: 'subscription', planId })
      setCurrent({ planId, status: 'active' })
    } catch {
      setCurrent({ planId, status: 'active' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Subscriptions" title="Pricing Plans" description="Choose the plan that fits your agricultural intelligence needs" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {plans.map((plan) => (
          <div key={plan.id} className={`frosted-panel relative flex flex-col ${plan.popular ? 'ring-2 ring-emerald-500' : ''}`}>
            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">Popular</span>}
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <p className="text-3xl font-extrabold text-emerald-300 mt-2">
              {plan.price === 0 ? 'Free' : `KES ${plan.price.toLocaleString()}`}
              {plan.price > 0 && <span className="text-sm text-slate-400 font-normal">/{plan.period}</span>}
            </p>
            <ul className="mt-4 space-y-2 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-emerald-400">✓</span>{f}</li>
              ))}
            </ul>
            <button
              className={`mt-6 w-full justify-center ${current?.planId === plan.id ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => subscribe(plan.id)}
              disabled={loading || current?.planId === plan.id}
            >
              {current?.planId === plan.id ? 'Current Plan' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Pricing
