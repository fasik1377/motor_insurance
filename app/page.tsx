"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80",
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const goPrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-900 bg-[#35126d] shadow-sm shadow-slate-950/20">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 shadow-lg shadow-black/20">
              <Image src="/images/logo.png" alt="New India Assurance logo" width={180} height={64} className="h-auto w-auto object-contain" />
            </div>
            <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-100 md:flex lg:gap-10">
              <Link href="#" className="transition hover:text-white">Home</Link>
              <Link href="#" className="transition hover:text-white">About</Link>
              <Link href="#" className="transition hover:text-white">Products</Link>
              <Link href="#" className="transition hover:text-white">Our Office</Link>
              <Link href="#" className="transition hover:text-white">Blog</Link>
              <Link href="#" className="transition hover:text-white">Help</Link>
              <Link href="#" className="transition hover:text-white">Contact</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm md:text-base">
            <div className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-slate-100">
              Call-us: (878) 967-4455
            </div>
            <Link href="/otp" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              LOGIN
            </Link>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url(${slides[currentSlide]})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-slate-950/90" />

        <div className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-[1600px] items-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full">
            <div className="relative flex h-[calc(100vh-170px)] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),transparent_35%),linear-gradient(180deg,_rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
              <div className="absolute left-6 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-[18px] border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm">
                <span className="text-2xl">&#8249;</span>
              </div>
              <div className="absolute right-6 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-[18px] border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm">
                <span className="text-2xl">&#8250;</span>
              </div>

              <div className="absolute inset-x-0 top-1/4 px-6 sm:px-10 lg:px-16">
                <div className="inline-flex h-2 w-20 rounded-full bg-violet-400" />
                <h1 className="mt-6 max-w-3xl text-3xl font-bold uppercase tracking-[0.2em] text-white sm:text-4xl">
                  NEW INDIA ASSURANCE
                </h1>
              </div>

              <div className="absolute inset-x-10 bottom-0 mb-6 bg-[#35126d] px-6 py-5 shadow-2xl shadow-black/40 sm:inset-x-14 lg:inset-x-20 lg:px-8">
                <div className="grid gap-4 md:grid-cols-[220px_1fr] lg:gap-6">
                  <div className="flex items-center justify-center border-r border-white/15 pr-6 text-center text-sm uppercase tracking-[0.24em] text-slate-200 md:pr-8">
                    INSURANCE SERVICE
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-center text-white">
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M12 1.5l3.09 6.26L22 8.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.14 2 8.27l6.91-0.51L12 1.5z" /></svg></div>
                      <div className="font-semibold">Health</div>
                      <div className="text-xs text-slate-300">Insurance</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-center text-white">
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M2 17l4-9h12l4 9-3 3H5l-3-3zm10-3l2-2-2-2-2 2 2 2z" /></svg></div>
                      <div className="font-semibold">Travel</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-center text-white">
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M3 12v6h2v-1h14v1h2v-6l-1-5H4l-1 5zm2-3h14l.5 2H4.5L5 9zm1 3h12v3H6v-3z" /></svg></div>
                      <div className="font-semibold">Motor</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-center text-white">
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M4 4h16v16H4V4zm3 3h4v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z" /></svg></div>
                      <div className="font-semibold">Miscellaneous</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-center text-white">
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" /></svg></div>
                      <div className="font-semibold">All Products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
