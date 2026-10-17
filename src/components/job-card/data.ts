export interface JobOffer {
  id: string;
  employerName: string;
  employerAccountId: string;
  handle: string;
  rating: number;
  title: string;
  niche: string;
  daysRemaining: number;
  requiredPeople: number;
  applicants: number;
  accepted: number;
  requirements: string[];
  minSalary: number;
  maxSalary: number;
  description: string;
  
  // Exact lower-case statuses matching your criteria
  status: 'apply' | 'paused' | 'filled' | 'acquired';
  statusUpdatedAt: Date; 
  increaseCount: number; 
  hasApplied?: boolean;
}

const employers = ["Portville Agency", "Kla Tech Hub", "Wandegeya Labs", "Nakasero Venture", "Kololo Digital"];
const titles = ["UX/UI Designer", "Frontend Developer", "Social Media Manager", "Graphics Illustrator"];
const niches = ["Design", "Engineering", "Marketing", "Creative"];
const skillsDictionary: Record<string, string[]> = {
  "UX/UI Designer": ["Figma", "Wireframing", "Design Systems"],
  "Frontend Developer": ["React", "Next.js", "TypeScript"],
  "Social Media Manager": ["Meta Ads", "Copywriting", "SEO Optimization"],
  "Graphics Illustrator": ["Photoshop", "Vector Art", "Adobe Illustrator"]
};

export const mockJobs: JobOffer[] = Array.from({ length: 20 }, (_, i) => {
  const required = Math.floor(Math.random() * 10) + 5;
  const emp = employers[i % employers.length];
  const title = titles[i % titles.length];
  
  // Distribute statuses explicitly based on your definitions
  let status: 'apply' | 'paused' | 'filled' | 'acquired' = 'apply';
  let accepted = Math.floor(Math.random() * (required - 1));
  let applicants = Math.floor(Math.random() * required);

  if (i === 1) { 
    status = 'paused'; 
  } else if (i === 2) { 
    status = 'filled'; 
    accepted = required; 
    applicants = Math.ceil(required * 2.6); // Triggers filled (accepted == required & applicants >= 2.5x)
  } else if (i === 3) {
    status = 'acquired';
    accepted = required;
    applicants = Math.floor(required * 1.2); // Triggers acquired (accepted == required & applicants < 2.5x)
  }

  return {
    id: `${i + 1}`,
    employerName: emp,
    employerAccountId: `acc-employer-${i % employers.length + 1}`,
    handle: emp.toLowerCase().replace(/\s+/g, ''),
    rating: parseFloat((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)),
    title: title,
    niche: niches[i % niches.length],
    daysRemaining: Math.floor(Math.random() * 14) + 1,
    requiredPeople: required,
    applicants: applicants,
    accepted: accepted,
    requirements: skillsDictionary[title] || ["Communication"],
    minSalary: 500000,
    maxSalary: 1200000,
    description: `${emp} is looking for talent within Kampala area.`,
    status,
    statusUpdatedAt: new Date(),
    increaseCount: 0 
  };
});

/**
 * ⏰ TIME-DECAY CLEANUP FILTER
 */
export const getActiveLiveJobs = (jobs: JobOffer[]): JobOffer[] => {
  const now = new Date().getTime();

  return jobs.filter(job => {
    const elapsedHours = (now - job.statusUpdatedAt.getTime()) / (1000 * 60 * 60);

    if (job.status === 'paused' && elapsedHours >= 12) return false;      // Delete after 12hrs
    if (job.status === 'filled' && elapsedHours >= 8) return false;        // Delete after 8hrs
    if (job.status === 'acquired' && elapsedHours >= 2) return false;      // Delete after 2hrs

    return true; 
  });
};