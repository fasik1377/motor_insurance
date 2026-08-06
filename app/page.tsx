"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  "/images/car1.jpg",
  "/images/car2.jpg",
  "/images/car3.jpg",
];

const serviceSlides = [
  {
    title: "TWO WHEELER",
    description: "Fast, reliable coverage for your bike and rider.",
    image: "/images/two_wheeler.jpg",
  },
  {
    title: "PRIVATE VEHICLE",
    description: "Comprehensive plans for cars, SUVs, and personal transport.",
    image: "/images/car4.jpg",
  },
  {
    title: "COMMERCIAL VEHICLE",
    description: "Protect your fleet with flexible business insurance options.",
    image: "/images/commercial_car.jpg",
  },
];

const inventoryItems = [
  {
    title: "TWO WHEELER",
    image: "/images/two_wheeler2.jpg",
  },
  {
    title: "INSURANCE DOCUMENTS",
    image: "/images/insurance_car.png",
  },
  {
    title: "FAMILY COVER",
    image: "/images/commercial_car2.jpg",
  },
  {
    title: "PRIVATE VEHICLE",
    image: "/images/car4.jpg",
  },
  {
    title: "COMMERCIAL VEHICLE",
    image: "/images/commercial_car3.jpg",
  },
  {
    title: "BIKE COVERAGE",
    image: "/images/three_wheeler.jpg",
  },
  {
    title: "HEAVY VEHICLE",
    image: "/images/car3.jpg",
  },
  {
    title: "TRAVEL INSURANCE",
    image: "/images/three_wheeler2.jpg",
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

        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-[1600px] items-center px-4 py-20 sm:px-6 lg:px-10">
          <div className="w-full">
            <div className="relative flex min-h-[calc(100vh-100px)] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-10 top-14 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
                <div className="absolute right-16 top-24 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
              </div>
              <button type="button" onClick={goPrev} className="absolute left-6 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-[18px] border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition hover:bg-white/20">
                <span className="text-2xl">&#8249;</span>
              </button>
              <button type="button" onClick={goNext} className="absolute right-6 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-[18px] border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition hover:bg-white/20">
                <span className="text-2xl">&#8250;</span>
              </button>

              <div className="relative z-10 mx-auto grid h-full max-w-6xl grid-rows-[auto_1fr] gap-[70px] px-6 py-12 sm:px-10 lg:px-16">
                <div className="max-w-3xl">
                  <div className="inline-flex h-2 w-20 rounded-full bg-violet-400" />
                  <h1 className="mt-6 text-3xl font-bold uppercase tracking-[0.2em] text-white sm:text-4xl">
                    NEW INDIA ASSURANCE
                  </h1>
                  <p className="mt-6 text-base leading-9 text-slate-200 sm:text-lg">
                    Professional insurance coverage for your health, vehicle, travel, home, and all your everyday journeys.
                  </p>
                </div>

                <div style={{ perspective: "1400px" }}>
                  <div className="transform-gpu border border-white/10 bg-[#35126d]/95 px-6 py-5 shadow-2xl shadow-black/50 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:shadow-[0_40px_90px_rgba(0,0,0,0.35)]" style={{ transformStyle: "preserve-3d" }}>
                    <div className="grid gap-4 md:grid-cols-[260px_1fr] lg:gap-6">
                      <div className="flex items-center justify-center rounded-[2rem] bg-white/10 px-6 py-6 text-center text-sm uppercase tracking-[0.24em] text-slate-200 shadow-inner shadow-white/10 ring-1 ring-white/10 backdrop-blur-xl">
                        <div>
                          <p className="text-xs uppercase tracking-[0.32em] text-violet-200">Coverage built for every lifestyle</p>
                          
                        </div>
                      </div>
                      <div className="grid gap-3 grid-cols-2 md:grid-cols-5 items-center">
                        <div className="group flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-5 text-center text-white shadow-xl shadow-black/20 transition duration-500 hover:-translate-y-1 hover:scale-105">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M12 2 6 5v5a6 6 0 0 0 12 0V5l-6-3Z" />
                              <path d="M9 12h6m-3-3v6" />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">Health</div>
                        </div>
                        <div className="group flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-5 text-center text-white shadow-xl shadow-black/20 transition duration-500 hover:-translate-y-1 hover:scale-105">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="5" />
                              <path d="M12 7v-2m0 12v2m5-5h2m-12 0H5" />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">Motor</div>
                        </div>
                        <div className="group flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-5 text-center text-white shadow-xl shadow-black/20 transition duration-500 hover:-translate-y-1 hover:scale-105">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="m2 12 8 3 3-3-3-3-8 3Z" />
                              <path d="M10 15V8l7 4-7 3Z" />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">Travel</div>
                        </div>
                        <div className="group flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-5 text-center text-white shadow-xl shadow-black/20 transition duration-500 hover:-translate-y-1 hover:scale-105">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 12 12 4l9 8v8a1 1 0 0 1-1 1h-5V14H9v7H4a1 1 0 0 1-1-1v-7Z" />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">Home</div>
                        </div>
                        <div className="group flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-5 text-center text-white shadow-xl shadow-black/20 transition duration-500 hover:-translate-y-1 hover:scale-105">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="4" y="4" width="6" height="6" rx="1.2" />
                              <rect x="14" y="4" width="6" height="6" rx="1.2" />
                              <rect x="4" y="14" width="6" height="6" rx="1.2" />
                              <rect x="14" y="14" width="6" height="6" rx="1.2" />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">All Products</div>
                        </div>
                      </div>
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
                  <div className="h-[220px] overflow-hidden border border-slate-200 bg-slate-100 rounded-[1.75rem] transition duration-500 hover:-translate-y-2 hover:shadow-xl sm:h-[260px]">
                    <img src="/images/insurance_car.png" alt="Insurance umbrella" className="h-full w-full object-cover" />
                  </div>
                  <div className="h-[220px] overflow-hidden border border-slate-200 bg-slate-100 rounded-[1.75rem] transition duration-500 hover:-translate-y-2 hover:shadow-xl sm:h-[260px]">
                    <img src="/images/car4.jpg" alt="Car" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="relative">
                  <div className="overflow-hidden border border-slate-200 bg-slate-100 shadow-xl shadow-slate-300/10 rounded-none sm:-ml-8 xl:-ml-12">
                    <img src="/images/car_white.jpg" alt="Insurance detail" className="h-full w-full object-cover" />
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

      <section className="bg-[#35126d] text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-violet-200">Trusted by drivers across India</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Over 10 years motor insurance service</h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "1,800+", label: "Offices" },
              { value: "3.75Cr", label: "Happy Clients" },
              { value: "25", label: "Countries" },
              { value: "32.35K Cr", label: "Visitors Per Day" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-8 text-center shadow-xl shadow-black/10 backdrop-blur-xl">
                <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{stat.value}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.24em] text-violet-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img src="/images/insurance_car.png" alt="Background section" className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-slate-950/75" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "FINANCING MADE EASY",
                description: "Distinctly recontextualize top-line users. Shabby chic ramps gentrify picks, exactly and literally.",
              },
              {
                title: "TRUSTED BY THOUSANDS",
                description: "Distinctly recontextualize top-line users. Shabby chic ramps gentrify picks, exactly and literally.",
              },
              {
                title: "WIDE RANGE OF BRANDS",
                description: "Distinctly recontextualize top-line users. Shabby chic ramps gentrify picks, exactly and literally.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl shadow-xl shadow-black/20">
                <h3 className="text-base font-semibold uppercase tracking-[0.3em] text-white/90">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-200">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white text-slate-950">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">OUR CSR INITIATIVE</h2>
            <button className="rounded-full border border-violet-600 px-4 py-2 text-xs text-violet-600">ONLINE SHOP</button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { img: '/images/car4.jpg', title: 'Wallbox type 17.4 kW' },
              { img: '/images/commercial_car2.jpg', title: 'Zeta Type XL Racing Seat' },
              { img: '/images/insurance_car.png', title: 'Wallbox eMH3' },
            ].map((it) => (
              <div key={it.title} className="space-y-3 text-center">
                <div className="overflow-hidden border border-slate-200">
                  <img src={it.img} alt={it.title} className="w-full h-48 object-cover" />
                </div>
                <p className="text-sm font-semibold">{it.title}</p>
                <a href="#" className="text-xs text-violet-600 font-semibold">Click Here</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <img src="/images/car_white.jpg" alt="Footer background car" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/70" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden border border-white/10 bg-violet-950/80 p-6 shadow-2xl shadow-black/40 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-950/90 via-slate-950/20 to-transparent" />
              <div className="relative w-full max-w-lg">
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200">Need a special deal?</p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Contact Us</h2>

                <form className="mt-6 space-y-3">
                  <input type="text" placeholder="Your name" className="w-full border-b border-white/20 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-slate-300" />
                  <input type="email" placeholder="Your email" className="w-full border-b border-white/20 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-slate-300" />
                  <input type="text" placeholder="Subject" className="w-full border-b border-white/20 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-slate-300" />
                  <textarea placeholder="Your message (optional)" rows={4} className="w-full border-b border-white/20 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-slate-300" />
                  <button type="submit" className="mt-4 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
                    Submit
                  </button>
                </form>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="overflow-hidden border border-white/10 bg-white/10 shadow-2xl shadow-black/30">
                <iframe
                  title="Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.116043197!2d-74.24441924087764!3d40.69714941965724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDQxJzUyLjAiTiA3NMKwMTQnMTQuNiJX!5e0!3m2!1sen!2sus!4v1691249374000!5m2!1sen!2sus"
                  className="h-80 w-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <div className="border border-white/10 bg-[#35126d] p-6 shadow-2xl shadow-black/30">
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5 text-white">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" /></svg>
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-violet-200">Address</p>
                      <p className="mt-3 text-sm leading-6 text-white">1010 Avenue of the Moon<br />New York, NY 10018 U.S.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5 text-white">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 6a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.21 1.11l-2.2 2.2z" /></svg>
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-violet-200">Phone</p>
                      <p className="mt-3 text-sm leading-6 text-white">+1 628 123 4000</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5 text-white">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-violet-200">Email</p>
                      <p className="mt-3 text-sm leading-6 text-white">info@newindiaassurance.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#35126d] px-4 py-6 text-center text-slate-300 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-2">
            <p className="text-sm font-medium text-white">© 2026 Motors - Electric Vehicle Dealer WordPress Theme</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Trademarks and brands are the property of their respective owners.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
