import { Container } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { ProjectCard } from "@/components/public/project-card";
import { SectionHeading } from "@/components/sections/section-heading";
import type { Project } from "@/lib/types";

/**
 * "Things I've built" (mockup `.work.three` / `.wk.big`): Harsh's own featured
 * projects only, never job work (that's the `Work` section). Renders nothing
 * when there are no published projects.
 */
export function Built({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section id="built" className="scroll-mt-24 pt-14">
      <Container>
        <Reveal>
          <SectionHeading
            title="Things I've built"
            note="My own projects, built outside of work."
            href="/projects"
            linkLabel="all projects →"
          />
        </Reveal>

        <div className="mt-5 grid gap-4.5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={Math.min(i * 0.06, 0.18)} className="flex">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
