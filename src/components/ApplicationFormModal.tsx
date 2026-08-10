import { useState } from "react";
import { useApplicationsStore } from "../store/applicationsStore";
import { Button, Input, Label, Modal, TextArea } from "./ui";

export function ApplicationFormModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const addApplication = useApplicationsStore((s) => s.addApplication);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  function reset() {
    setCompany("");
    setRole("");
    setLocation("");
    setUrl("");
    setSalaryRange("");
    setJobDescription("");
  }

  function handleSubmit() {
    if (!company.trim() || !role.trim()) return;
    const id = addApplication({ company, role, location, url, salaryRange, jobDescription });
    reset();
    onCreated?.(id);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add job application" wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Company *</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" />
        </div>
        <div>
          <Label>Role *</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Product Manager" />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote / NYC" />
        </div>
        <div>
          <Label>Salary range</Label>
          <Input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="$120k - $150k" />
        </div>
        <div className="sm:col-span-2">
          <Label>Job posting URL</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <Label>Job description</Label>
          <TextArea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here — this is what gets used to tailor your resume and cover letter."
            rows={10}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!company.trim() || !role.trim()}>
          Add application
        </Button>
      </div>
    </Modal>
  );
}
