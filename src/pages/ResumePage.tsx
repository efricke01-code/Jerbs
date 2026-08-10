import { useState } from "react";
import { Button, Card, Input, Label, SectionHeader, TextArea } from "../components/ui";
import { useResumeStore } from "../store/resumeStore";
import type { ResumeEducation, ResumeExperience, ResumeProject } from "../types";

function BulletsEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      {bullets.map((bullet, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={bullet}
            onChange={(e) => {
              const next = [...bullets];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder="Led X to achieve Y, measured by Z"
          />
          <Button
            variant="ghost"
            onClick={() => onChange(bullets.filter((_, idx) => idx !== i))}
            aria-label="Remove bullet"
          >
            ✕
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={() => onChange([...bullets, ""])}>
        + Bullet
      </Button>
    </div>
  );
}

function ExperienceEditor({
  experience,
  onUpdate,
  onRemove,
}: {
  experience: ResumeExperience;
  onUpdate: (updates: Partial<ResumeExperience>) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Title</Label>
          <Input value={experience.title} onChange={(e) => onUpdate({ title: e.target.value })} />
        </div>
        <div>
          <Label>Company</Label>
          <Input value={experience.company} onChange={(e) => onUpdate({ company: e.target.value })} />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={experience.location} onChange={(e) => onUpdate({ location: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Start</Label>
            <Input
              value={experience.startDate}
              onChange={(e) => onUpdate({ startDate: e.target.value })}
              placeholder="Jan 2021"
            />
          </div>
          <div>
            <Label>End</Label>
            <Input
              value={experience.endDate}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              placeholder="Present"
            />
          </div>
        </div>
      </div>
      <div>
        <Label>Bullets</Label>
        <BulletsEditor bullets={experience.bullets} onChange={(bullets) => onUpdate({ bullets })} />
      </div>
      <div className="flex justify-end">
        <Button variant="danger" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </Card>
  );
}

function EducationEditor({
  education,
  onUpdate,
  onRemove,
}: {
  education: ResumeEducation;
  onUpdate: (updates: Partial<ResumeEducation>) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>School</Label>
          <Input value={education.school} onChange={(e) => onUpdate({ school: e.target.value })} />
        </div>
        <div>
          <Label>Degree</Label>
          <Input value={education.degree} onChange={(e) => onUpdate({ degree: e.target.value })} placeholder="B.S." />
        </div>
        <div>
          <Label>Field of study</Label>
          <Input value={education.field} onChange={(e) => onUpdate({ field: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Start</Label>
            <Input value={education.startDate} onChange={(e) => onUpdate({ startDate: e.target.value })} />
          </div>
          <div>
            <Label>End</Label>
            <Input value={education.endDate} onChange={(e) => onUpdate({ endDate: e.target.value })} />
          </div>
        </div>
      </div>
      <div>
        <Label>Details (honors, relevant coursework, GPA, etc.)</Label>
        <TextArea value={education.details} onChange={(e) => onUpdate({ details: e.target.value })} rows={2} />
      </div>
      <div className="flex justify-end">
        <Button variant="danger" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </Card>
  );
}

function ProjectEditor({
  project,
  onUpdate,
  onRemove,
}: {
  project: ResumeProject;
  onUpdate: (updates: Partial<ResumeProject>) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="p-4 space-y-3">
      <div>
        <Label>Name</Label>
        <Input value={project.name} onChange={(e) => onUpdate({ name: e.target.value })} />
      </div>
      <div>
        <Label>Description</Label>
        <TextArea value={project.description} onChange={(e) => onUpdate({ description: e.target.value })} rows={2} />
      </div>
      <div>
        <Label>Bullets</Label>
        <BulletsEditor bullets={project.bullets} onChange={(bullets) => onUpdate({ bullets })} />
      </div>
      <div className="flex justify-end">
        <Button variant="danger" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </Card>
  );
}

export function ResumePage() {
  const {
    resume,
    coverLetter,
    setResumeField,
    setSkills,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    setCoverLetterField,
  } = useResumeStore();
  const [skillsInput, setSkillsInput] = useState(resume.skills.join(", "));

  return (
    <div className="space-y-8">
      <div>
        <SectionHeader
          title="Base resume"
          subtitle="This is the source of truth. When you tailor an application, Claude reorders and rewords this — it never invents anything beyond it."
        />
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Full name</Label>
              <Input value={resume.fullName} onChange={(e) => setResumeField("fullName", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={resume.email} onChange={(e) => setResumeField("email", e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={resume.phone} onChange={(e) => setResumeField("phone", e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={resume.location} onChange={(e) => setResumeField("location", e.target.value)} />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input value={resume.linkedin} onChange={(e) => setResumeField("linkedin", e.target.value)} />
            </div>
            <div>
              <Label>Website / portfolio</Label>
              <Input value={resume.website} onChange={(e) => setResumeField("website", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Summary</Label>
            <TextArea
              value={resume.summary}
              onChange={(e) => setResumeField("summary", e.target.value)}
              rows={3}
              placeholder="2-3 sentence professional summary"
            />
          </div>
          <div>
            <Label>Skills (comma-separated)</Label>
            <Input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              onBlur={() =>
                setSkills(
                  skillsInput
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              placeholder="TypeScript, Product Strategy, SQL, Figma..."
            />
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader
          title="Experience"
          action={
            <Button variant="secondary" onClick={addExperience}>
              + Add experience
            </Button>
          }
        />
        <div className="space-y-3">
          {resume.experience.length === 0 && (
            <p className="text-sm text-slate-400">No experience added yet.</p>
          )}
          {resume.experience.map((exp) => (
            <ExperienceEditor
              key={exp.id}
              experience={exp}
              onUpdate={(updates) => updateExperience(exp.id, updates)}
              onRemove={() => removeExperience(exp.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionHeader
          title="Projects"
          subtitle="Optional — useful for portfolio pieces, open source, or side projects."
          action={
            <Button variant="secondary" onClick={addProject}>
              + Add project
            </Button>
          }
        />
        <div className="space-y-3">
          {resume.projects.map((proj) => (
            <ProjectEditor
              key={proj.id}
              project={proj}
              onUpdate={(updates) => updateProject(proj.id, updates)}
              onRemove={() => removeProject(proj.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionHeader
          title="Education"
          action={
            <Button variant="secondary" onClick={addEducation}>
              + Add education
            </Button>
          }
        />
        <div className="space-y-3">
          {resume.education.length === 0 && <p className="text-sm text-slate-400">No education added yet.</p>}
          {resume.education.map((edu) => (
            <EducationEditor
              key={edu.id}
              education={edu}
              onUpdate={(updates) => updateEducation(edu.id, updates)}
              onRemove={() => removeEducation(edu.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionHeader
          title="Cover letter guidance"
          subtitle="Not a fixed template — this steers the tone and content Claude uses when it writes a cover letter for each application."
        />
        <Card className="p-4 space-y-4">
          <div>
            <Label>Preferred tone</Label>
            <Input
              value={coverLetter.tone}
              onChange={(e) => setCoverLetterField("tone", e.target.value)}
              placeholder="e.g. warm and direct, or formal and concise"
            />
          </div>
          <div>
            <Label>Recurring talking points</Label>
            <TextArea
              value={coverLetter.talkingPoints}
              onChange={(e) => setCoverLetterField("talkingPoints", e.target.value)}
              rows={4}
              placeholder="Themes you want woven in when relevant — e.g. career pivot story, a signature achievement, why you care about this kind of work."
            />
          </div>
          <div>
            <Label>Closing style</Label>
            <Input
              value={coverLetter.closing}
              onChange={(e) => setCoverLetterField("closing", e.target.value)}
              placeholder="e.g. Best, or Looking forward to connecting,"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
