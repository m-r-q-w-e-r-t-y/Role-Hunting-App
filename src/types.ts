namespace Types {
    export interface Entry {
        position: string,
        company: string
        datePosted: Date,
        dateApplied: Date,
        recruiter: string,
        link: string,
        applicantCount: number,
        seniority: string,
        resumeLink: string,
        resumeMatchScore: number,
        manuallyModified: boolean,
        email: string,
        description: string
    }
}