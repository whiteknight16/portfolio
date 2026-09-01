import Link from "next/link";
import { ArrowUpRight, Bot, Boxes, Mic } from "lucide-react";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";

/**
 * What someone can actually hire me for. This is the only section on the page
 * written for a buyer rather than a reader: the agent that replaces a human
 * workflow, the live voice/video layer when it needs one, and the product
 * system holding both up. Static content by design: services are positioning,
 * not data, and they change far less often than projects do.
 */
const SERVICES = [
  {
    icon: Bot,
    title: "AI that does the job",
    blurb:
      "Not a chatbot bolted onto the corner of your product. A system that owns a workflow a person used to run, start to finish.",
    points: [
      "Agents that teach, interview, assess, and decide — not just answer questions",
      "Multi-step flows with memory, state, and progression across sessions",
      "Evaluation and scoring you could defend to the person being assessed",
    ],
  },
  {
    icon: Mic,
    title: "Live voice & video agents",
    blurb:
      "When the agent has to talk to someone in real time, the hard part is everything that happens when the network, the model, or the user misbehaves.",
    points: [
      "LiveKit and WebRTC session lifecycle, reconnection, and low-latency streaming",
      "Turn-taking and interruption handling that doesn't feel like a phone tree",
      "Several agents handing off inside a single live session",
    ],
  },
  {
    icon: Boxes,
    title: "The system around the agent",
    blurb:
      "An agent is one component. The product is everything holding it up — and that is usually where these projects actually fail.",
    points: [
      "FastAPI and Postgres services, background jobs, retries, and migrations",
      "Reporting, analytics, certification, and the admin surfaces people operate from",
      "Production triage when an AI feature is already live and misbehaving",
    ],
  },
] as const;

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            title="What I get hired to build"
            description="AI that replaces a process, not just a prompt box. Often with a live voice or video layer, always with the system around it."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <Reveal
                key={service.title}
                delay={Math.min(i * 0.08, 0.24)}
                className="h-full"
              >
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
                  <Icon className="size-5 text-brand" />
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {service.blurb}
                  </p>
                  <ul className="mt-5 flex flex-col gap-2.5 border-t border-border pt-5">
                    {service.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-pretty text-sm leading-relaxed text-muted-foreground"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.5rem] size-1 shrink-0 rounded-full bg-brand"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.24} className="mt-8">
          <p className="text-pretty text-sm text-muted-foreground">
            Not sure which of these you need?{" "}
            <Link
              href="#contact"
              className="group inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
            >
              Describe the problem
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>{" "}
            and I&apos;ll tell you straight whether I&apos;m the right person for it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
