import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../components/common/Logo'

const LandingPage = () => {
  return (
    <section className="page-shell page-shell-dark min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[3rem] border border-white/15 bg-slate-950/80 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="absolute inset-y-0 left-1/2 w-full max-w-2xl -translate-x-1/2 opacity-30 blur-3xl bg-[radial-gradient(circle,_rgba(16,185,129,0.45),_transparent_55%)]" />
        <div className="grid lg:grid-cols-[0.9fr_0.8fr] gap-8 p-8 md:p-12 relative z-10">
          <div className="space-y-6 text-slate-100">
            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200">
              <Logo />
              AgriMap
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
              Plant better decisions for every field.
            </h1>
            <p className="max-w-xl text-slate-300 text-base sm:text-lg leading-relaxed">
              A modern Kenyan farm platform for field planning, satellite insight, cooperative support and growth-ready reporting.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link to="/login" className="btn-primary w-full sm:w-auto">
                Farmer Login
              </Link>
              <Link to="/register" className="btn-secondary w-full sm:w-auto">
                Join AgriMap
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/60">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515172238509-7ed8fa7c37c0?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-slate-100">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/90">Real Kenyan imagery</p>
              <h2 className="text-2xl font-semibold mt-3">Harvest-ready farm visuals</h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Explore fields, satellite insights and cooperative workflows built for African agriculture.
              </p>
            </div>
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/95 to-transparent" />
          </div>
        </div>

        <div className="absolute right-0 top-0 h-full w-20 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),transparent)] blur-2xl" />
      </div>
    </section>
  )
}

export default LandingPage
