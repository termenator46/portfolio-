
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hls from "hls.js";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import ContactFormModal from "./components/ContactFormModal";

gsap.registerPlugin(ScrollTrigger);

const HLS_SOURCE = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";
const BASE = import.meta.env.BASE_URL;
const VOICE_SOURCE = `${BASE}voice-intro.m4a`;
const CODENEST_HLS_SOURCE = "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";

const loadingWords = ["Design", "Create", "Inspire"];
const heroRoles = ["Creative", "Fullstack", "Founder", "Scholar"];

type NavTarget = "home" | "work" | "resume";

type WorkCard = {
  title: string;
  badge: string;
  impact: string;
  description: string;
  tech: string[];
  url: string;
  image: string;
  span: string;
  ratio: string;
};

const works: WorkCard[] = [
  {
    title: "API Automation Framework",
    badge: "JAVA",
    impact: "CI-READY",
    description:
      "Reusable auth and request builders, schema validation, and Jenkins plus Allure runs for fast release confidence.",
    tech: ["Java", "RestAssured", "Jenkins", "Allure"],
    url: "https://github.com/termenator46/amr-fleet",
    image:
      `${BASE}projects/api-automation.svg`,
    span: "md:col-span-7",
    ratio: "aspect-[16/10]"
  },
  {
    title: "UI Selenium Suite",
    badge: "SELENIUM",
    impact: "STABLE",
    description:
      "Page Object architecture with reliable waits and locators focused on long-term regression stability.",
    tech: ["Selenium", "TestNG", "Page Object", "Java"],
    url: "https://github.com/termenator46/qa-utils",
    image:
      `${BASE}projects/ui-selenium.svg`,
    span: "md:col-span-5",
    ratio: "aspect-[9/10]"
  },
  {
    title: "Fraud Intelligence Dashboard",
    badge: "ANALYTICS",
    impact: "PRODUCTION",
    description:
      "Live multi-account fraud scoring and alert triage with weighted signals and detail panels.",
    tech: ["JavaScript", "MySQL", "Webhooks", "Fingerprinting"],
    url: "https://github.com/termenator46/fraud-intelligence-dashboard",
    image:
      `${BASE}projects/fraud-dashboard.svg`,
    span: "md:col-span-5",
    ratio: "aspect-[9/10]"
  },
  {
    title: "AI Output Validation Playbook",
    badge: "AI QA",
    impact: "REPEATABLE",
    description:
      "A structured QA method for non-deterministic AI outputs across tone, relevance, and regression checks.",
    tech: ["AI QA", "Regression", "Edge Cases", "Jira"],
    url: "https://github.com/termenator46/slam-demo",
    image:
      `${BASE}projects/ai-playbook.svg`,
    span: "md:col-span-7",
    ratio: "aspect-[16/10]"
  },
  {
    title: "Grafana QA Monitoring Suite",
    badge: "GRAFANA",
    impact: "3 BRANDS",
    description:
      "Cross-instance monitoring with anomaly detection and production KPI tracking for three brands.",
    tech: ["Grafana", "SQL", "MySQL", "Chatwoot"],
    url: "https://github.com/termenator46/grafana-qa-monitoring",
    image:
      `${BASE}projects/grafana-suite.svg`,
    span: "md:col-span-12",
    ratio: "aspect-[21/8]"
  }
];

type JournalEntry = {
  title: string;
  image: string;
  readTime: string;
  date: string;
};

const journalEntries: JournalEntry[] = [
  {
    title: "Designing with Narrative Tension",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
    readTime: "6 min read",
    date: "Jan 19, 2026"
  },
  {
    title: "Motion as Product Language",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    readTime: "4 min read",
    date: "Feb 02, 2026"
  },
  {
    title: "How I Build Creative Systems",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    readTime: "7 min read",
    date: "Feb 26, 2026"
  },
  {
    title: "Craft, Constraints, and Launch",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
    readTime: "5 min read",
    date: "Mar 15, 2026"
  }
];

type ExplorationItem = {
  title: string;
  image: string;
  rotate: number;
};

const explorationItems: ExplorationItem[] = [
  {
    title: "Type Structures",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
    rotate: -3
  },
  {
    title: "Spatial Rhythm",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80",
    rotate: 4
  },
  {
    title: "Material Study",
    image:
      "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=900&q=80",
    rotate: -2
  },
  {
    title: "Editorial Contrast",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    rotate: 3
  },
  {
    title: "Camera Drift",
    image:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=900&q=80",
    rotate: -4
  },
  {
    title: "Abstract Balance",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    rotate: 2
  }
];

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mitch-klu/" },
  { label: "GitHub", href: "https://github.com/termenator46" }
];

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<NavTarget>("home");
  const [isNavElevated, setIsNavElevated] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const sectionMap: Array<{ nav: NavTarget; id: string }> = [
      { nav: "home", id: "home" },
      { nav: "work", id: "work" },
      { nav: "resume", id: "resume" }
    ];

    const onScroll = () => {
      setIsNavElevated(window.scrollY > 100);

      const checkpoint = window.scrollY + window.innerHeight * 0.4;
      let current: NavTarget = "home";

      for (const section of sectionMap) {
        const element = document.getElementById(section.id);

        if (!element) {
          continue;
        }

        if (checkpoint >= element.offsetTop) {
          current = section.nav;
        }
      }

      setActiveNav(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative overflow-x-clip bg-bg text-text-primary"
      >
        <HeroSection
          activeNav={activeNav}
          isNavElevated={isNavElevated}
          onNavClick={(nav) => {
            setActiveNav(nav);
            if (nav === "home") {
              scrollToSection("home");
              return;
            }
            if (nav === "work") {
              scrollToSection("work");
              return;
            }
            scrollToSection("resume");
          }}
          onSayHi={() => setIsContactFormOpen(true)}
        />

        <SelectedWorksSection />
        <CodeNestResumeSection onSayHi={() => setIsContactFormOpen(true)} />
        <ContactFooterSection />
      </motion.main>

      <ContactFormModal isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} />
    </>
  );
}

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % loadingWords.length);
    }, 900);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const duration = 2700;
    let raf = 0;
    let completionTimer = 0;
    let startedAt: number | null = null;

    const tick = (timestamp: number) => {
      if (startedAt === null) {
        startedAt = timestamp;
      }

      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const nextValue = Math.round(progress * 100);

      setCount((prev) => (prev === nextValue ? prev : nextValue));

      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
        return;
      }

      completionTimer = window.setTimeout(() => {
        onComplete();
      }, 400);
    };

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-bg">
      <motion.p
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="px-8 pt-8 text-xs uppercase tracking-[0.3em] text-muted"
      >
        Portfolio
      </motion.p>

      <div className="grid flex-1 place-items-center px-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={loadingWords[wordIndex]}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center font-display text-4xl italic text-text-primary/80 md:text-6xl lg:text-7xl"
          >
            {loadingWords[wordIndex]}
          </motion.h2>
        </AnimatePresence>
      </div>

      <p className="px-8 pb-10 text-right font-display text-6xl tabular-nums text-text-primary md:text-8xl lg:text-9xl">
        {String(count).padStart(3, "0")}
      </p>

      <div className="h-[3px] bg-stroke/50">
        <div
          className="accent-gradient h-full origin-left"
          style={{
            transform: `scaleX(${count / 100})`,
            boxShadow: "0 0 8px rgba(137, 170, 204, 0.35)"
          }}
        />
      </div>
    </div>
  );
}
type HeroSectionProps = {
  activeNav: NavTarget;
  isNavElevated: boolean;
  onNavClick: (nav: NavTarget) => void;
  onSayHi: () => void;
};

function HeroSection({ activeNav, isNavElevated, onNavClick, onSayHi }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % heroRoles.length);
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const audio = voiceRef.current;
    if (!audio) {
      return;
    }

    const onEnded = () => {
      setIsVoicePlaying(false);
    };

    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const toggleVoiceIntro = useCallback(() => {
    const audio = voiceRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      void audio
        .play()
        .then(() => {
          setIsVoicePlaying(true);
        })
        .catch(() => {
          setIsVoicePlaying(false);
        });
      return;
    }

    audio.pause();
    setIsVoicePlaying(false);
  }, []);

  useLayoutEffect(() => {
    if (!heroRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline.fromTo(
        ".name-reveal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
      );

      timeline.fromTo(
        ".blur-in",
        { opacity: 0, y: 20, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.1, delay: 0.3 },
        0
      );
    }, heroRef);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section id="home" ref={heroRef} className="relative flex min-h-screen items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <HlsBackgroundVideo />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <Navbar
        activeNav={activeNav}
        isElevated={isNavElevated}
        onNavClick={onNavClick}
        onSayHi={onSayHi}
      />

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-6 text-center md:px-10 lg:px-16">


        <h1 className="name-reveal mb-6 font-display text-6xl italic leading-[0.9] tracking-tight text-text-primary md:text-8xl lg:text-9xl">
          Mitchell Klugman
        </h1>

        <p className="blur-in mb-6 text-lg text-muted md:text-2xl">
          A{" "}
          <span
            key={roleIndex}
            className="animate-role-fade-in inline-block font-display italic text-text-primary"
          >
            {heroRoles[roleIndex]}
          </span>{" "}
          QA engineer based in Europe.
        </p>

        <p className="blur-in mb-12 max-w-md text-sm text-muted md:text-base">
          I don't just find bugs. I build systems that prevent them.
        </p>

        <div className="blur-in inline-flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              document.getElementById("work")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group relative inline-flex items-center justify-center rounded-full text-sm transition-transform duration-300 hover:scale-105"
          >
            <span className="pointer-events-none absolute -inset-[2px] rounded-full accent-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative rounded-full bg-text-primary px-7 py-3.5 text-bg transition-colors duration-300 group-hover:bg-bg group-hover:text-text-primary">
              See Works
            </span>
          </button>

          <button
            type="button"
            onClick={onSayHi}
            className="group relative inline-flex items-center justify-center rounded-full text-sm transition-transform duration-300 hover:scale-105"
          >
            <span className="pointer-events-none absolute -inset-[2px] rounded-full animated-gradient-border opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative rounded-full border-2 border-stroke bg-bg px-7 py-3.5 text-text-primary transition-colors duration-300 group-hover:border-transparent">
              Reach out...
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={toggleVoiceIntro}
          className="blur-in mt-5 rounded-full border border-stroke bg-bg/60 px-6 py-2 text-xs uppercase tracking-[0.2em] text-text-primary transition-colors duration-300 hover:border-white/30"
        >
          {isVoicePlaying ? "Pause voice intro" : "Play voice intro"}
        </button>
      </div>

      <audio ref={voiceRef} src={VOICE_SOURCE} preload="metadata" />

      <div className="absolute inset-x-0 bottom-7 z-10 flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">SCROLL</span>
        <div className="relative h-10 w-px overflow-hidden bg-stroke">
          <span className="animate-scroll-down absolute inset-x-0 top-0 h-4 accent-gradient" />
        </div>
      </div>
    </section>
  );
}

type NavbarProps = {
  activeNav: NavTarget;
  isElevated: boolean;
  onNavClick: (nav: NavTarget) => void;
  onSayHi: () => void;
};

function Navbar({ activeNav, isElevated, onNavClick, onSayHi }: NavbarProps) {
  const links: Array<{ id: NavTarget; label: string }> = [
    { id: "home", label: "Home" },
    { id: "work", label: "Work" },
    { id: "resume", label: "Resume" }
  ];

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
      <div
        className={`inline-flex items-center rounded-full border border-white/10 bg-surface px-2 py-2 backdrop-blur-md ${
          isElevated ? "shadow-md shadow-black/10" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => onNavClick("home")}
          className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full p-[1px] transition-transform duration-300 hover:scale-110"
          aria-label="Go to Home"
        >
          <span className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] transition-all duration-300 group-hover:bg-[linear-gradient(270deg,#89AACC_0%,#4E85BF_100%)]" />
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-bg font-display text-[13px] italic text-text-primary">
            MK
          </span>
        </button>

        <span className="mx-1 hidden h-5 w-px bg-stroke md:block" />

        <div className="inline-flex items-center gap-1">
          {links.map((link) => {
            const isActive = activeNav === link.id;

            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavClick(link.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                  isActive
                    ? "bg-stroke/50 text-text-primary"
                    : "text-muted hover:bg-stroke/50 hover:text-text-primary"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        <span className="mx-1 hidden h-5 w-px bg-stroke md:block" />

        <button
          type="button"
          onClick={onSayHi}
          className="group relative inline-flex items-center justify-center rounded-full text-xs sm:text-sm"
        >
          <span className="pointer-events-none absolute -inset-[2px] rounded-full accent-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative rounded-full bg-surface px-3 py-1.5 backdrop-blur-md transition-colors duration-200 sm:px-4 sm:py-2">
            Say hi <span aria-hidden>{"->"}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function SelectedWorksSection() {
  return (
    <section id="work" className="relative bg-[#070b0a] py-14 md:py-20 overflow-hidden">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 -top-20 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#5ed29c]/[0.035] blur-[130px]" />
        <div className="absolute -left-48 top-1/4 h-[500px] w-[500px] rounded-full bg-[#5ed29c]/[0.055] blur-[110px]"
          style={{ animation: "blobLeft 10s ease-in-out infinite" }} />
        <div className="absolute -right-48 top-1/3 h-[450px] w-[450px] rounded-full bg-[#1a5fff]/[0.04] blur-[120px]"
          style={{ animation: "blobRight 12s ease-in-out infinite" }} />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="absolute left-10 top-[15%] h-[70%] w-px bg-gradient-to-b from-transparent via-[#5ed29c]/18 to-transparent" />
        <div className="absolute right-10 top-[15%] h-[70%] w-px bg-gradient-to-b from-transparent via-[#5ed29c]/14 to-transparent" />
        <style>{`
          @keyframes blobLeft { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-36px) scale(1.07)} 66%{transform:translate(-18px,28px) scale(0.95)} }
          @keyframes blobRight { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,28px) scale(1.05)} 66%{transform:translate(22px,-32px) scale(0.97)} }
        `}</style>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12 flex items-end justify-between gap-6"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-3">
              <span className="h-px w-8 bg-[#5ed29c]/60" />
              <span className="text-[11px] uppercase tracking-[0.32em] text-[#5ed29c]/80">Selected Work</span>
            </div>
            <h2 className="mb-3 text-[2.6rem] leading-[1.05] text-white md:text-[3.8rem]">
              Featured <span className="font-display italic text-white/55">projects</span>
            </h2>
            <p className="max-w-xl text-[14px] leading-relaxed text-white/38">
              Real production and automation projects — from framework architecture to live monitoring.
            </p>
          </div>
          <a href="https://github.com/termenator46" target="_blank" rel="noreferrer"
            className="group hidden shrink-0 items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.02] px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white/50 backdrop-blur-sm transition-all duration-300 hover:border-[#5ed29c]/35 hover:text-[#5ed29c] md:inline-flex">
            View all work <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          {works.map((work, idx) => (
            <motion.article
              key={work.title}
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.75, delay: idx * 0.09, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, transition: { duration: 0.28 } }}
              className={`group relative cursor-pointer overflow-hidden ${work.span} ${work.ratio} max-md:aspect-auto flex flex-col md:block`}
              style={{ borderRadius: "20px", background: "#0c1210", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Glow border on hover */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
                style={{ borderRadius: "20px", boxShadow: "inset 0 0 0 1px rgba(94,210,156,0.22), 0 8px 40px rgba(94,210,156,0.07)" }} />

              {/* Corner accents on hover — desktop only */}
              <div className="pointer-events-none absolute left-0 top-0 h-9 w-9 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute left-[10px] top-[10px] h-px w-7 bg-[#5ed29c]/70" />
                <div className="absolute left-[10px] top-[10px] h-7 w-px bg-[#5ed29c]/70" />
              </div>
              <div className="pointer-events-none absolute bottom-0 right-0 h-9 w-9 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute bottom-[10px] right-[10px] h-px w-7 bg-[#5ed29c]/70" />
                <div className="absolute bottom-[10px] right-[10px] h-7 w-px bg-[#5ed29c]/70" />
              </div>

              {/* ── TOP HEADER BAR ── */}
              {/* Mobile: relative (in flow). Desktop: absolute */}
              <div className="relative md:absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-4 pb-3 bg-[#0c1210]">
                <div className="flex gap-2">
                  <span className="rounded-full border border-white/[0.14] bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm">
                    {work.badge}
                  </span>
                  <span className="rounded-full border border-[#5ed29c]/30 bg-[#5ed29c]/[0.12] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5ed29c] backdrop-blur-sm">
                    {work.impact}
                  </span>
                </div>
                <a href={work.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-black/50 text-[11px] text-white/50 backdrop-blur-sm transition-opacity duration-300 opacity-60 md:opacity-0 md:group-hover:opacity-100">
                  ↗
                </a>
              </div>

              {/* Separator line — desktop only */}
              <div className="hidden md:block absolute inset-x-0 z-10 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" style={{ top: "46px", height: "1px" }} />

              {/* Project image */}
              {/* Mobile: relative with fixed height. Desktop: absolute fills remaining space */}
              <div className="relative md:absolute md:inset-x-0 md:bottom-0 h-[180px] md:h-auto" style={{ top: "47px" }}>
                <img src={work.image} alt={work.title} loading="lazy"
                  className="h-full w-full object-contain p-3 transition-transform duration-700 md:group-hover:scale-[1.03]" />
              </div>

              {/* Gradient overlay — desktop hover only */}
              <div className="hidden md:block pointer-events-none absolute inset-x-0 bottom-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ top: "47px", background: "linear-gradient(to top, #0a0f0d 40%, rgba(10,15,13,0.85) 70%, transparent 100%)" }} />

              {/* Content */}
              {/* Mobile: always visible, relative (in flow). Desktop: hover-reveal, absolute bottom */}
              <div className="relative md:absolute md:inset-x-0 md:bottom-0 z-20 p-5 md:p-6
                translate-y-0 opacity-100
                md:translate-y-4 md:opacity-0
                transition-all duration-300 ease-out
                md:group-hover:translate-y-0 md:group-hover:opacity-100
                border-t border-white/[0.06] md:border-t-0">
                <h3 className="mb-1.5 text-[15px] font-semibold text-white md:text-[18px]">{work.title}</h3>
                <p className="mb-3 max-w-sm text-[12px] leading-relaxed text-white/55 md:text-[13px]">{work.description}</p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {work.tech.map((tech) => (
                    <span key={`${work.title}-${tech}`}
                      className="rounded-lg border border-white/[0.1] bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60 backdrop-blur-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                <a href={work.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 rounded-full border border-[#5ed29c]/35 bg-[#5ed29c]/[0.1] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#5ed29c] backdrop-blur-sm transition-all duration-300 hover:bg-[#5ed29c]/[0.2]">
                  GitHub →
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
function JournalSection() {
  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-10 flex items-end justify-between gap-6"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-3">
              <span className="h-px w-8 bg-stroke" />
              <span className="text-xs uppercase tracking-[0.3em] text-muted">Journal</span>
            </div>
            <h2 className="mb-3 text-4xl leading-tight text-text-primary md:text-6xl">
              Recent <span className="font-display italic">thoughts</span>
            </h2>
            <p className="max-w-xl text-sm text-muted md:text-base">
              Notes on process, experimentation, and systems behind digital products.
            </p>
          </div>

          <button type="button" className="group relative hidden rounded-full text-sm md:inline-flex">
            <span className="pointer-events-none absolute -inset-[2px] rounded-full accent-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative rounded-full border border-stroke bg-bg px-5 py-2.5 text-text-primary transition-colors duration-300 group-hover:border-transparent">
              View all <span aria-hidden>{"->"}</span>
            </span>
          </button>
        </motion.div>

        <div className="space-y-4">
          {journalEntries.map((entry) => (
            <article
              key={entry.title}
              className="group flex items-center gap-4 rounded-[40px] border border-stroke bg-surface/30 p-4 transition-colors duration-300 hover:bg-surface sm:gap-6 sm:rounded-full"
            >
              <img
                src={entry.image}
                alt={entry.title}
                loading="lazy"
                className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
              />

              <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                <h3 className="truncate text-sm text-text-primary sm:text-base">{entry.title}</h3>

                <div className="flex shrink-0 items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted">
                  <span>{entry.readTime}</span>
                  <span className="hidden sm:inline">{entry.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExplorationsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const rightColumnRef = useRef<HTMLDivElement | null>(null);
  const [activeItem, setActiveItem] = useState<ExplorationItem | null>(null);

  const [leftItems, rightItems] = useMemo(() => {
    const left = explorationItems.filter((_, index) => index % 2 === 0);
    const right = explorationItems.filter((_, index) => index % 2 !== 0);

    return [left, right];
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current || !contentRef.current || !leftColumnRef.current || !rightColumnRef.current) {
      return;
    }

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: contentRef.current,
        pinSpacing: false
      });

      gsap.to(leftColumnRef.current, {
        yPercent: -22,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });

      gsap.to(rightColumnRef.current, {
        yPercent: 22,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
    }, sectionRef);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[300vh] bg-bg py-16" id="explorations">
      <div ref={contentRef} className="relative z-10 flex h-screen items-center justify-center px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">Explorations</p>
          <h2 className="mb-4 text-5xl leading-tight md:text-7xl">
            Visual <span className="font-display italic">playground</span>
          </h2>
          <p className="mb-8 text-sm text-muted md:text-base">
            Personal experiments in typography, image systems, and motion composition.
          </p>

          <a
            href="https://dribbble.com"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex rounded-full text-sm"
          >
            <span className="pointer-events-none absolute -inset-[2px] rounded-full accent-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative rounded-full border border-stroke bg-bg px-5 py-2.5 transition-colors duration-300 group-hover:border-transparent">
              Visit Dribbble <span aria-hidden>{"->"}</span>
            </span>
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="sticky top-0 mx-auto flex h-screen max-w-[1400px] items-center px-6 md:px-10 lg:px-16">
          <div className="grid w-full grid-cols-2 gap-12 md:gap-40">
            <div ref={leftColumnRef} className="flex flex-col items-end gap-10 pt-20 md:gap-16">
              {leftItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className="group pointer-events-auto relative aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl border border-stroke bg-surface"
                  style={{ transform: `rotate(${item.rotate}deg)` }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              ))}
            </div>

            <div ref={rightColumnRef} className="flex flex-col items-start gap-10 pt-40 md:gap-16">
              {rightItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className="group pointer-events-auto relative aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl border border-stroke bg-surface"
                  style={{ transform: `rotate(${item.rotate}deg)` }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-6"
            onClick={() => setActiveItem(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-surface"
              onClick={(event) => event.stopPropagation()}
            >
              <img src={activeItem.image} alt={activeItem.title} className="h-[70vh] w-full object-cover" />
              <div className="flex items-center justify-between p-4">
                <h3 className="text-lg text-text-primary">{activeItem.title}</h3>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="rounded-full border border-stroke px-4 py-2 text-sm text-muted hover:text-text-primary"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function StatsSection() {
  return (
    <section id="resume" className="bg-bg py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 text-center md:grid-cols-3 md:px-10 lg:px-16">
        <article className="rounded-3xl border border-stroke bg-surface/30 p-8">
          <p className="mb-2 text-4xl font-display italic md:text-5xl">20+</p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Years Experience</p>
        </article>

        <article className="rounded-3xl border border-stroke bg-surface/30 p-8">
          <p className="mb-2 text-4xl font-display italic md:text-5xl">95+</p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Projects Done</p>
        </article>

        <article className="rounded-3xl border border-stroke bg-surface/30 p-8">
          <p className="mb-2 text-4xl font-display italic md:text-5xl">200%</p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Satisfied Clients</p>
        </article>
      </div>
    </section>
  );
}
function CodeNestResumeSection({ onSayHi }: { onSayHi: () => void }) {
  const processItems = [
    {
      num: "01",
      title: "Audit",
      text: "Map product risks, data flow, and edge cases before implementation starts.",
      icon: "◈"
    },
    {
      num: "02",
      title: "Automate",
      text: "Build stable test architecture and CI gates so quality scales with every release.",
      icon: "◎"
    },
    {
      num: "03",
      title: "Optimize",
      text: "Track defects, reduce flakiness, and improve release speed through measurable QA telemetry.",
      icon: "◇"
    }
  ];

  const deliveryStats = [
    { label: "Regression Stability", value: 94, suffix: "%" },
    { label: "Pre-release Defect Catch", value: 89, suffix: "%" },
    { label: "Release Confidence", value: 96, suffix: "%" }
  ];

  const experienceTimeline = [
    {
      role: "QA Engineer (Automation / AI-focused)",
      company: "Web Design Sun",
      period: "2025–2026",
      type: "Remote",
      highlights: [
        "Owned quality validation for an AI text humanization system (Walter).",
        "Validated AI outputs for coherence, tone, relevance, and non-deterministic behavior.",
        "Performed exploratory and regression testing with Jira defect tracking."
      ]
    },
    {
      role: "QA Automation Engineer",
      company: "NextGen QA Lab",
      period: "2023–2024",
      type: "Remote",
      highlights: [
        "Built modular Selenium regression suite using Page Object Model.",
        "Implemented REST API automation with RestAssured and schema validation.",
        "Integrated UI/API suites into Jenkins with Allure reporting."
      ]
    },
    {
      role: "QA Automation Trainee",
      company: "Upteam QA Lab",
      period: "2025",
      type: "Remote",
      highlights: [
        "Performed API testing in Postman (positive, negative, boundary cases).",
        "Supported Agile workflow and practiced Git + automation fundamentals."
      ]
    }
  ];

  const certifications = [
    { title: "BSc Computer Science (Online)", issuer: "Kyiv International University", year: "2025" },
    { title: "Automated Quality Assurance", issuer: "UpTeam GmbH", year: "2025" },
    { title: "QA Manual & Automation Tester", issuer: "AIT TR GmbH", year: "2025" }
  ];

  const techStack = ["Java", "Selenium", "RestAssured", "Jenkins", "Allure", "Postman", "Python", "SQL", "Grafana", "Git", "Jira", "Playwright"];

  const languageList = [
    { lang: "English", level: "Fluent" },
    { lang: "Ukrainian", level: "Native" },
    { lang: "Russian", level: "Fluent" },
    { lang: "Spanish", level: "Basic" }
  ];

  return (
    <section id="resume" className="relative overflow-hidden bg-[#070b0a] pb-28 pt-14">
      {/* Background video layer */}
      <div className="pointer-events-none absolute inset-0">
        <HlsBackgroundVideo
          source={CODENEST_HLS_SOURCE}
          enableWorker={false}
          className="opacity-[0.4] brightness-[0.8] contrast-110 saturate-0"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,12,0.5)_0%,rgba(6,10,15,0.65)_54%,rgba(7,11,10,0.9)_100%)]" />
        {/* Subtle green glow top-right */}
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#5ed29c]/[0.04] blur-[120px]" />
        <div className="absolute -left-20 bottom-20 h-[400px] w-[400px] rounded-full bg-[#5ed29c]/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">

        {/* ── HERO HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-14"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-[#5ed29c]/60" />
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#5ed29c]">Quality Engineering Partner</p>
          </div>
          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h2 className="mb-5 text-[2.6rem] leading-[1.0] text-white md:text-[3.8rem] lg:text-[4.4rem]">
                Built to catch what{" "}
                <em className="font-display not-italic text-[#5ed29c]">others miss</em>
                {" "}before it{" "}
                <em className="font-display italic text-white/80">ships.</em>
              </h2>
              <p className="mb-8 max-w-[560px] text-[15px] leading-relaxed text-white/60">
                End-to-end QA delivery across UI, API, and analytics pipelines — with a strong focus on stability,
                business impact, and predictable releases.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/Resume_Mitchell_Klugman_EA1.pdf"
                  download
                  className="group relative inline-flex rounded-full"
                >
                  <span className="pointer-events-none absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-[#5ed29c] to-[#3ab87a] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 group-hover:border-transparent">
                    Download Resume
                  </span>
                </a>
                <button
                  type="button"
                  onClick={onSayHi}
                  className="rounded-full bg-[#5ed29c] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#070b0a] transition-all duration-200 hover:scale-[1.03] hover:bg-[#6fe0a8]"
                >
                  Say hi →
                </button>
              </div>
            </div>

            {/* Delivery Metrics card */}
            <motion.article
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Delivery Metrics</p>
                <span className="h-1.5 w-1.5 rounded-full bg-[#5ed29c] shadow-[0_0_6px_2px_rgba(94,210,156,0.5)]" />
              </div>
              <div className="space-y-5">
                {deliveryStats.map((metric, i) => (
                  <div key={metric.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-white/60">{metric.label}</span>
                      <span className="text-sm font-bold text-white">
                        {metric.value}{metric.suffix}
                      </span>
                    </div>
                    <div className="h-[3px] rounded-full bg-white/[0.07]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${metric.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.15 + 0.4, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[#5ed29c] to-[#3ab87a]"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-white/[0.06] pt-4">
                <p className="text-[10px] text-white/35">Based on production project history</p>
              </div>
            </motion.article>
          </div>
        </motion.div>

        {/* ── PROCESS CARDS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mb-10 grid gap-3 md:grid-cols-3"
        >
          {processItems.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all duration-300 hover:border-[#5ed29c]/20 hover:bg-white/[0.04]"
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="text-[11px] font-mono text-[#5ed29c]/60">{item.num}</span>
                <span className="text-xl text-[#5ed29c]/40 transition-colors duration-300 group-hover:text-[#5ed29c]/70">{item.icon}</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">{item.title}</h3>
              <p className="text-[13px] leading-relaxed text-white/55">{item.text}</p>
            </motion.article>
          ))}
        </motion.div>

        {/* ── MAIN CONTENT GRID ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"
        >
          {/* Work Experience */}
          <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-px flex-1 bg-white/[0.06]" />
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#5ed29c]">Work Experience</p>
              <span className="h-px flex-1 bg-white/[0.06]" />
            </div>
            <div className="space-y-4">
              {experienceTimeline.map((item, idx) => (
                <div
                  key={`${item.role}-${item.company}`}
                  className="group rounded-xl border border-white/[0.07] bg-black/20 p-5 transition-all duration-300 hover:border-[#5ed29c]/15 hover:bg-black/30"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-semibold leading-snug text-white">{item.role}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#5ed29c]/70">{item.company}</p>
                        <span className="text-white/20">·</span>
                        <p className="text-[11px] text-white/40">{item.type}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/[0.12] bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/50">
                      {item.period}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {item.highlights.map((point) => (
                      <li key={point} className="flex gap-2.5 text-[13px] leading-relaxed text-white/60">
                        <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[#5ed29c]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>

          {/* Right column */}
          <div className="space-y-5">
            {/* Certifications */}
            <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-px flex-1 bg-white/[0.06]" />
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#5ed29c]">Certifications</p>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <ul className="space-y-2.5">
                {certifications.map((cert) => (
                  <li
                    key={cert.title}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3.5"
                  >
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5ed29c]/60" />
                    <div>
                      <p className="text-[13px] font-medium text-white/85">{cert.title}</p>
                      <p className="mt-0.5 text-[11px] text-white/40">{cert.issuer} · {cert.year}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            {/* Tech Stack */}
            <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-px flex-1 bg-white/[0.06]" />
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#5ed29c]">Tech Stack</p>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-white/[0.08] bg-black/25 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/60 transition-colors duration-200 hover:border-[#5ed29c]/25 hover:text-white/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>

            {/* Languages */}
            <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-px flex-1 bg-white/[0.06]" />
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#5ed29c]">Languages</p>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {languageList.map((item) => (
                  <div
                    key={item.lang}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-2.5"
                  >
                    <span className="text-[12px] font-medium text-white/80">{item.lang}</span>
                    <span className="text-[10px] uppercase tracking-[0.1em] text-white/35">{item.level}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
function ContactFooterSection() {
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!marqueeRef.current) return;
    const tween = gsap.to(marqueeRef.current, {
      xPercent: -50,
      duration: 35,
      ease: "none",
      repeat: -1
    });
    return () => { tween.kill(); };
  }, []);

  const marqueeItems = [
    "Mitchell Klugman",
    "QA Engineer",
    "Automation",
    "AI Testing",
    "Open to Work",
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-bg pb-8 pt-16 md:pb-12 md:pt-24">
      {/* Background — залишаємо відео */}
      <div className="absolute inset-0 overflow-hidden">
        <HlsBackgroundVideo className="scale-y-[-1]" />
        <div className="absolute inset-0 bg-black/65" />
        {/* Green glow top-center */}
        <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#5ed29c]/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10">

        {/* ── MARQUEE ── */}
        <div className="relative overflow-hidden py-4 bg-black/30 backdrop-blur-sm">
          {/* Glow line top */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5ed29c]/50 to-transparent" />
          {/* Glow line bottom */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#5ed29c]/30 to-transparent" />
          {/* Dark side fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/60 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/60 to-transparent z-10" />
          <div
            ref={marqueeRef}
            className="flex w-max whitespace-nowrap"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="inline-flex items-center">
                {marqueeItems.map((item, j) => (
                  <span key={j} className="inline-flex items-center">
                    <span className="mx-6 text-[13px] font-semibold uppercase tracking-[0.35em] text-white/50 md:text-[15px]">
                      {item}
                    </span>
                    <span className="mx-3 text-[#5ed29c]/60 text-base">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTACT BLOCK ── */}
        <div className="mx-auto max-w-[1200px] px-6 pb-10 pt-12 text-center md:px-10 lg:px-16">

          {/* Label */}
          <div className="mb-6 inline-flex items-center gap-3">
            <span className="h-px w-6 bg-[#5ed29c]/50" />
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#5ed29c]/70">Get in touch</p>
            <span className="h-px w-6 bg-[#5ed29c]/50" />
          </div>

          {/* Big heading */}
          <h2 className="mb-4 text-[2.8rem] leading-[1.0] text-white md:text-[4.5rem]">
            Let's work <span className="font-display italic text-white/55">together.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-md text-[14px] leading-relaxed text-white/40">
            Available for freelance QA projects, automation consulting, and long-term contracts.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:mitcel258@gmail.com"
              className="group relative inline-flex items-center gap-2 rounded-full"
            >
              <span className="pointer-events-none absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-[#5ed29c] to-[#3ab87a] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[13px] text-white backdrop-blur-md transition-all duration-300 group-hover:border-transparent">
                mitcel258@gmail.com
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </a>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5ed29c]/20 bg-[#5ed29c]/[0.06] px-5 py-3.5 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#5ed29c] shadow-[0_0_6px_2px_rgba(94,210,156,0.5)]" style={{ animation: "pulse 2s ease-in-out infinite" }} />
              <span className="text-[12px] uppercase tracking-[0.2em] text-[#5ed29c]/80">Available for projects</span>
            </div>
          </div>
        </div>

        {/* ── FOOTER BAR ── */}
        <footer className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-5 border-t border-white/[0.07] px-6 pt-6 md:flex-row md:px-10 lg:px-16">
          <p className="text-[12px] uppercase tracking-[0.18em] text-white/30">
            © 2026 Mitchell Klugman
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] uppercase tracking-[0.18em] text-white/35 transition-colors duration-200 hover:text-[#5ed29c]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-white/30">
            QA · Automation · AI Testing
          </p>
        </footer>

      </div>
    </section>
  );
}

function HlsBackgroundVideo({
  className = "",
  source = HLS_SOURCE,
  enableWorker = true
}: {
  className?: string;
  source?: string;
  enableWorker?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker });
      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play().catch(() => undefined);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      void video.play().catch(() => undefined);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [source, enableWorker]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      className={`absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover ${className}`}
    />
  );
}
export default App;































