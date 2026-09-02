export interface ProfileData {
  name: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  experiences: ExperienceEntry[];
  softSkills: string[];
  references: ReferenceEntry[];
  achievements: string;
  education: string;
}

export interface ExperienceEntry {
  id: string;
  period: string;
  description: string;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ResumeOption {
  id: string;
  label: string;
  type: 'generated' | 'uploaded';
}

export const emptyProfile = (): ProfileData => ({
  name: '',
  about: '',
  email: '',
  phone: '',
  address: '',
  experiences: [],
  softSkills: [],
  references: [],
  achievements: '',
  education: '',
});

export const emptyExperience = (): ExperienceEntry => ({
  id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  period: '',
  description: '',
});

export const emptyReference = (): ReferenceEntry => ({
  id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  name: '',
  email: '',
  phone: '',
});
