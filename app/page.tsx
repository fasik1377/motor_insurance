"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80",
];

const serviceSlides = [
  {
    title: "TWO WHEELER",
    description: "Fast, reliable coverage for your bike and rider.",
    image: "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "PRIVATE VEHICLE",
    description: "Comprehensive plans for cars, SUVs, and personal transport.",
    image: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "COMMERCIAL VEHICLE",
    description: "Protect your fleet with flexible business insurance options.",
    image: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&w=1200&q=80",
  },
];

const inventoryItems = [
  {
    title: "TWO WHEELER",
    image: "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "INSURANCE DOCUMENTS",
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "FAMILY COVER",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "PRIVATE VEHICLE",
    image: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "COMMERCIAL VEHICLE",
    image: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "BIKE COVERAGE",
    image: "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "HEAVY VEHICLE",
    image: "https://images.unsplash.com/photo-1563729784474-da1c0fc03062?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "TRAVEL INSURANCE",
    image: "https://images.unsplash.com/photo-1516834474-48f2b7ab97f0?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [serviceSlide, setServiceSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center justify-between gap-4">
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
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 md:hidden">
              <span className="text-xl">{mobileMenuOpen ? "✕" : "☰"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm md:text-base">
            <div className="hidden rounded-full border border-white/15 bg-white/10 px-5 py-3 text-slate-100 md:inline-flex">
              Call-us: (878) 967-4455
            </div>
            <Link href="/login" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              LOGIN
            </Link>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 bg-[#35126d] px-4 py-5 text-white md:hidden">
            <nav className="space-y-3 text-sm font-semibold">
              {[
                ["Home", "#"],
                ["About", "#"],
                ["Products", "#"],
                ["Our Office", "#"],
                ["Blog", "#"],
                ["Help", "#"],
                ["Contact", "#"],
              ].map(([label, href]) => (
                <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
                  {label}
                </Link>
              ))}
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
                Call-us: (878) 967-4455
              </div>
            </nav>
          </div>
        ) : null}
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
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M12 2l5 3v4a6 6 0 0 1-10 0V5l5-3zm0 13a4 4 0 0 0 4-4V7.1l-4-2.4-4 2.4V11a4 4 0 0 0 4 4z" /></svg></div>
                      <div className="font-semibold">Health</div>
                      <div className="text-xs text-slate-300">Insurance</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-center text-white">
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M21 16v-2l-3-1-3 1-3-5V5h2V3H9v2h2v4l-3 5-3-1v2l4 1 1 4h2l1-4 4-1z" /></svg></div>
                      <div className="font-semibold">Travel</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-center text-white">
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M5.5 15c-.83 0-1.5.67-1.5 1.5S4.67 18 5.5 18 7 17.33 7 16.5 6.33 15 5.5 15zm13 0c-.83 0-1.5.67-1.5 1.5S17.67 18 18.5 18 20 17.33 20 16.5 19.33 15 18.5 15zM4 10V7a2 2 0 0 1 2-2h1.5L9 4h6l1.5 1H18a2 2 0 0 1 2 2v3l-1.5 2H5.5L4 10z" /></svg></div>
                      <div className="font-semibold">Motor</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-center text-white">
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M4 7h16v2H4V7zm0 4h16v2H4v-2zm0 4h16v2H4v-2z" /></svg></div>
                      <div className="font-semibold">Miscellaneous</div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-center text-white">
                      <div className="text-white"><svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 6H5V9h14v3z" /></svg></div>
                      <div className="font-semibold">All Products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="bg-white text-slate-950">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1fr] lg:items-start">
            <div className="space-y-8">
              <h2 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                WHY CHOOSE THE NEW INDIA ASSURANCE?
              </h2>
              <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                The right insurance partner delivers safety, reputation, and a strong network of products to protect your journey.
              </p>

              <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4">
                  <div className="h-[220px] overflow-hidden border border-slate-200 bg-slate-100 rounded-none sm:h-[260px]">
                    <img src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=80" alt="Umbrellas" className="h-full w-full object-cover" />
                  </div>
                  <div className="h-[220px] overflow-hidden border border-slate-200 bg-slate-100 rounded-none sm:h-[260px]">
                    <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80" alt="Car" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="relative">
                  <div className="overflow-hidden border border-slate-200 bg-slate-100 shadow-xl shadow-slate-300/10 rounded-none sm:-ml-8 xl:-ml-12">
                    <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Insurance detail" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6">
                <div className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <div className="mt-1 flex h-12 w-12 items-center justify-center text-[#35126d]">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M12 2l7 4v5c0 5.25-3.75 9.88-7 11-3.25-1.12-7-5.75-7-11V6l7-4z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">Safety</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Electric cars are extremely reliable and secure. After all, electricity is not flammable!</p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <div className="mt-1 flex h-12 w-12 items-center justify-center text-[#35126d]">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">Reputation</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Electricity is known for its relatively cheap cost and, as a result, will be much more affordable.</p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <div className="mt-1 flex h-12 w-12 items-center justify-center text-[#35126d]">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M4 6h16v2H4V6zm0 4h16v2H4v-2zm0 4h16v2H4v-2z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">Range of Products</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Less noise means living in large cities with electric cars is much more comfortable.</p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <div className="mt-1 flex h-12 w-12 items-center justify-center text-[#35126d]">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M4 4h16v14H4V4zm2 2v10h12V6H6zm2 2h8v2H8V8z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">Network of Offices</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Simplified design – repairs are less expensive and take less time.</p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <div className="mt-1 flex h-12 w-12 items-center justify-center text-[#35126d]">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 3.75 3 6.85 7 11 4-4.15 7-7.25 7-11 0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">Trustworthiness</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Drivers of electric or hybrid vehicles have a much lower cost to run. Fuel cost to run an EV is roughly one third the cost of a gasoline powered car.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#35126d] text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.4em] text-violet-200">Motor Insurance Services</p>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Motor Insurance Services</h2>
            </div>

            <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/10 px-4 py-8 shadow-2xl shadow-black/20 sm:px-6">
              <div className="grid gap-6 sm:grid-cols-3">
                {serviceSlides.map((slide, index) => (
                  <div key={slide.title} className={`relative overflow-hidden ${index === serviceSlide ? "scale-100" : "scale-95 opacity-70"} transition-all duration-300`}>
                    <div className="aspect-[4/3] overflow-hidden bg-slate-900">
                      <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent px-5 py-6">
                      <p className="text-xs uppercase tracking-[0.35em] text-violet-200">{slide.title}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-100">{slide.description}</p>
                      <button className="mt-5 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/15">
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden justify-between px-4 sm:flex">
                <button type="button" onClick={() => setServiceSlide((prev) => (prev - 1 + serviceSlides.length) % serviceSlides.length)} className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-black/60">
                  <span className="text-2xl">‹</span>
                </button>
                <button type="button" onClick={() => setServiceSlide((prev) => (prev + 1) % serviceSlides.length)} className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-black/60">
                  <span className="text-2xl">›</span>
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                {serviceSlides.map((_, index) => (
                  <button key={index} type="button" onClick={() => setServiceSlide(index)} className={`h-2.5 w-2.5 rounded-full transition ${index === serviceSlide ? "bg-white" : "bg-white/40"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-slate-950">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-600">What’s New?</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Latest updates from our insurance inventory</h2>
            </div>
            <button className="inline-flex items-center justify-center rounded-full border border-violet-600 bg-transparent px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600 transition hover:bg-violet-600 hover:text-white">
              View all inventory
            </button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {inventoryItems.map((item) => (
              <div key={item.title} className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm">
                <div className="h-32 overflow-hidden bg-slate-100 sm:h-36">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.08em] text-violet-600">Launching India’s most comprehensive broker insurance</p>
                  <h3 className="mt-4 text-base font-semibold text-slate-950">{item.title}</h3>
                  <button className="mt-6 inline-flex items-center rounded-full border border-violet-600 bg-transparent px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-violet-600 transition hover:bg-violet-600 hover:text-white">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
