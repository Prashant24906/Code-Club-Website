"use client";
import { useState, useRef, ReactNode, MouseEvent } from "react";
import { TiLocationArrow } from "react-icons/ti";
import AnimatedTitle from "./AnimatedTitle";
import Link from "next/link";
import { isImageUrl } from "@/lib/videoSrc";

interface BentoTiltProps {
  children: ReactNode;
  className?: string;
}

export const BentoTilt = ({ children, className = "" }: BentoTiltProps) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;

    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`;
    setTransformStyle(newTransform);
  };

  const handleMouseLeave = () => {
    setTransformStyle("");
  };

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  src: string;
  title: ReactNode;
  description: string;
  link?: string;
  onClick?: () => void;
}

export const BentoCard = ({ src, title, description, link, onClick }: BentoCardProps) => {
  const srcIsImage = isImageUrl(src);

  const inner = (
    <>
      {src && (
        srcIsImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="event cover"
            className="absolute left-0 top-0 size-full object-cover object-center opacity-50 group-hover/card:opacity-70 transition-opacity duration-500"
          />
        ) : (
          <video
            src={src}
            poster={src.replace('videos/', 'img/posters/').replace('.mp4', '.jpg')}
            loop muted autoPlay playsInline preload="metadata"
            className="absolute left-0 top-0 size-full object-cover object-center opacity-50 group-hover/card:opacity-70 transition-opacity duration-500"
          />
        )
      )}
      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50">
        <div>
          <h1 className="bento-title special-font">{title}</h1>
          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base text-blue-50/70 line-clamp-3 overflow-hidden">{description}</p>
          )}
        </div>

        <div
          className="group/reg flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-wider text-white/40 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-300 pointer-events-none"
        >
          <TiLocationArrow className="text-violet-400 opacity-60 transition-transform duration-300 group-hover/reg:translate-x-0.5" />
          {onClick ? "View Details" : "Explore"}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        className="relative size-full cursor-pointer group/card block overflow-hidden"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={link ?? "/"}
      className="relative size-full cursor-pointer group/card block overflow-hidden"
    >
      {inner}
    </Link>
  );
};

const Features = () => (
  <section className="bg-black pb-28 md:pb-52">
    <div className="container mx-auto px-3 md:px-10">
      <div className="px-4 sm:px-5 pt-24 sm:pt-32 pb-14 sm:pb-16 text-center">
        <p className="font-general text-[10px] uppercase tracking-widest text-violet-400 mb-4">
          M-Pulse 2026 · Campus Festival
        </p>
        <AnimatedTitle
          title="<b>O</b>ur Ev<b>e</b>nts"
          containerClass="!text-white text-center"
        />
        <p className="mt-6 max-w-xl mx-auto font-circular-web text-base text-blue-50/50">
          Discover our flagship competitions. From high-stakes coding battles and technical exhibitions to 30+ signature events across all engineering domains.
        </p>
      </div>

      {/* Staggered Bento Grid */}
      <div className="grid w-full grid-cols-1 gap-5 sm:gap-7 md:grid-cols-4 md:grid-rows-2 md:h-screen">
        {/* Hackathon: Tall card on the left */}
        <BentoTilt className="border-hsla relative min-h-[45vh] sm:min-h-[52vh] md:min-h-0 md:col-span-2 md:row-span-2 overflow-hidden rounded-md">
          <BentoCard
            src="videos/feature-1.mp4"
            title={<><b>PRAGYANTRA</b></>}
            description="The flagship 8-hrs intelligence race. Build, innovate, and deploy at scale."
            link="/pragyantra"
          />
        </BentoTilt>

        {/* 30+ M-Pulse Events: Top Right */}
        <BentoTilt className="bento-tilt_1 min-h-[45vh] sm:min-h-[52vh] md:min-h-0 md:col-span-2 md:row-span-1">
          <BentoCard
            src="videos/feature-4.mp4"
            title={<>30+ E<b>v</b>ents</>}
            description="A diverse arena of technical and semi-technical showdowns. Join the series."
            link="/m-pulse-events"
          />
        </BentoTilt>

        {/* Project Competition: Bottom Right */}
        <BentoTilt className="bento-tilt_1 min-h-[45vh] sm:min-h-[52vh] md:min-h-0 md:col-span-2 md:row-span-1">
          <BentoCard
            src="videos/feature-2.mp4"
            title={<>Compet<b>i</b>tion</>}
            description="Showcase your technical prototypes and final year projects to industry leaders."
            link="/project-Competition"
          />
        </BentoTilt>
      </div>
    </div>
  </section>
);

export default Features;
