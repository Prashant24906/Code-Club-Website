"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BentoTilt, BentoCard } from "@/components/Features";
import AnimatedTitle from "@/components/AnimatedTitle";
import type { Event, SiteConfig } from "@/types";
import { resolveVideoSrc, resolveImageSrc, isImageUrl } from "@/lib/videoSrc";

gsap.registerPlugin(ScrollTrigger);

interface Props {
    events: Event[];
    siteConfig: SiteConfig;
}

export default function EventsClient({ events, siteConfig }: Props) {
    useGSAP(() => {
        gsap.set(".event-card", { y: 80, opacity: 0 });

        document.querySelectorAll<HTMLElement>(".event-card").forEach((card, i) => {
            gsap.to(card, {
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power3.out",
                delay: i * 0.08,
                scrollTrigger: {
                    trigger: card,
                    start: "top 88%",
                    once: true,
                },
            });
        });

        gsap.from(".stat-item", {
            y: 24,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".stats-row",
                start: "top 90%",
                once: true,
            },
        });

        gsap.from(".culture-text", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".culture-text",
                start: "top 88%",
                once: true,
            },
        });
    });

    return (
        <main className="relative min-h-screen w-screen overflow-x-hidden bg-black selection:bg-violet-300 selection:text-black">
            <NavBar />

            <section className="relative flex flex-col items-center justify-center text-blue-50 px-5 text-center"
                style={{ minHeight: "70vh" }}>
                <p className="font-general text-[10px] uppercase tracking-widest text-violet-400 mb-3">
                    M-Pulse 2026 · PES MCOE Pune
                </p>
                <AnimatedTitle
                    title="All <b>E</b>vents"
                    containerClass="!text-white text-center"
                />
                <p className="mt-3 max-w-lg text-sm text-blue-50/40 leading-relaxed"
                    style={{ fontFamily: "var(--font-poppins)", fontWeight: 300 }}>
                    Tech and Semi-Technical events, hackathon, and project competition. Find your event and register today.
                </p>

                <div className="culture-text mt-8 mx-auto max-w-3xl rounded-2xl border border-white/5 bg-white/[0.02] p-7">
                    <p className="font-general text-[9px] uppercase tracking-widest text-violet-400 mb-3">Our Culture</p>
                    <p className="text-sm leading-relaxed text-white/50"
                        style={{ fontFamily: "var(--font-poppins)", fontWeight: 300 }}>
                        At <strong className="text-white/70 font-semibold">PES MCOE</strong>, events aren't just competitions — they're where ideas become innovations.
                        M-PULSE challenges engineers to build, solve, and push boundaries through <strong className="text-violet-300">30+ technical and semi-technical events</strong>, intense hackathons, and live project showcases.
                        For over <strong className="text-violet-300">20 years</strong>, these traditions have turned students into problem-solvers, collaborators, and industry-ready builders.
                    </p>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className="relative flex size-12 items-center justify-center rounded-full border border-white/20 animate-[pulseRing_2s_ease-in-out_infinite]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="w-4 h-4 text-violet-400 animate-[bounceArrow_1.5s_ease-in-out_infinite]"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <p className="font-general text-[9px] uppercase tracking-widest text-white/25">Scroll</p>
                </div>
            </section>

            <section className="pb-24 text-blue-50">
                <div className="container mx-auto px-5 md:px-10">
                    <div className="events-container grid gap-8 md:grid-cols-2">
                        {events.map((event) => (
                            <BentoTilt key={event.id} className="event-card border-hsla relative h-80 w-full cursor-pointer overflow-hidden rounded-xl md:h-[55vh] hover:scale-[1.02] transition-transform duration-300">
                                <BentoCard
                                    src={isImageUrl(event.videoSrc)
                                        ? resolveImageSrc(event.videoSrc)
                                        : resolveVideoSrc(event.videoSrc, events.indexOf(event))}
                                    title={<>{event.title.substring(0, 4)}<b>{event.title.charAt(4)}</b>{event.title.substring(5)}</>}
                                    description={event.description}
                                    link={`/events/${event.id}`}
                                />
                                <div className="absolute top-4 right-4 z-20 rounded-full bg-black/50 px-3 py-1 text-xs uppercase text-white backdrop-blur-md">
                                    {event.date}
                                </div>
                            </BentoTilt>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
