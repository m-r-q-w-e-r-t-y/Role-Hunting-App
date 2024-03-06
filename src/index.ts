/**
 * Wrapper function that is required to overcome the HTTP 429 Too Many Requests response status
 * when making requests through the UrlFetchApp.fetch function.
 */
function run() {
  const jobsUrls = Jobs.JOB_URLS.map( (jobUrl: string) => Helper.formatLinkedInLink(jobUrl) );

  let index = 0;
  while (index + 1 <= jobsUrls.length) {
    try {
      tailorResume(jobsUrls[index]);
      index++;
    }
    catch (error) {
      continue;
    }
  }
}


function tailorResume(url: string) {
  const rawHTML = UrlFetchApp.fetch(url).getContentText();
  const document = new Classes.Document(rawHTML);

  // Extracts information for tracking on the Work Tracker Google Sheet.
  let entry: Types.Entry = {
    position: document.querySelector("h1.top-card-layout__title font-sans text-lg papabear:text-xl font-bold leading-open text-color-text mb-0 topcard__title").innerText(),
    company: document.querySelector("a.topcard__org-name-link topcard__flavor--black-link").innerText(),
    datePosted: Helper.datePostedFormat(document.querySelector("span.posted-time-ago__text topcard__flavor--metadata").innerText()),
    dateApplied: new Date(),
    recruiter: document.innerText().indexOf(`base-main-card__title font-sans text-[18px] font-bold text-color-text overflow-hidden\n${" ".repeat(10)}`) === -1
      ? ""
      : document.querySelector(`h3.base-main-card__title font-sans text-[18px] font-bold text-color-text overflow-hidden\n${" ".repeat(10)}`).innerText().replace(new RegExp("[^0-9]", "gi"), ''),
    link: url,
    applicantCount: 
      document.innerText().indexOf("num-applicants__caption topcard__flavor--metadata topcard__flavor--bullet") === -1
      ? parseInt(document.querySelector("figcaption.num-applicants__caption").innerText().replace(new RegExp("[^0-9]", "gi"), ''))
      : parseInt(document.querySelector("span.num-applicants__caption topcard__flavor--metadata topcard__flavor--bullet").innerText().replace(new RegExp("[^0-9]", "gi"), '')),
    seniority: document.querySelector("span.description__job-criteria-text description__job-criteria-text--criteria").innerText(),
    resumeLink: DriveApp.getFileById(Env.DOC_RESUME_TEMPLATE_ID).makeCopy().setName(Env.RESUME_NAME).getUrl(),
    coverLetterLink: DriveApp.getFileById(Env.DOC_COVER_LETTER_ID).makeCopy().setName(Env.COVER_LETTER_NAME).getUrl(),
    resumeMatchScore: 100,
    manuallyModified: false,
    email: Env.EMAIL,
    description: Utilities.base64Encode(
      Utilities.newBlob(
        document.querySelector(`div.show-more-less-html__markup show-more-less-html__markup--clamp-after-5\n${' '.repeat(10)}relative overflow-hidden`).innerText(),
      ).getBytes()
    )
  };
  entry.email = Helper.generateUniqueEmail(entry.email, entry.company, entry.position);
  Logger.log(Helper.addEntry(entry));

  // Extract description
  const description = document.querySelector(`div.show-more-less-html__markup show-more-less-html__markup--clamp-after-5\n${' '.repeat(10)}relative overflow-hidden`).innerText();

  // Get responsibilites of job
  const summary = Helper.askBardText(
    `Please highlight all the responsibilities from the job description and relevant technical skills:\n\n${description}`,
    Summarizer.TEXT
  );

    
  // Replace email template with custom email id in resume
  const resume = DocumentApp.openById(Helper.getIdFromUrl(entry.resumeLink));
  resume.getBody().replaceText("{{email}}", entry.email);

  const roles = [
    {
      templateString: "{{metlife}}",
      description: `- Presented an onboarding platform that is set to improve employee retention to on-technical stakeholders, product managers, and engineers.
      - Collaborated with product owners and development team members to shepard end-to-end experiences.
      - Built design system and multi-function Figma components.
      - Translated designs to HTML, CSS, and JavaScript.
      - Designed 14 features based on survey and interview metrics.`,
    },
    {
      templateString: "{{speakhire}}",
      description: `- Designed onboarding experience using Figma (i.e. content templates, icons, form design, UI controls, navigation models) in collaboration with engineering and product designers.
      - Created mockups and wireframes.
      - Developed 10 pages in Angular, TypeScript, HTML, and CSS.`,
    },
    {
      templateString: "{{queenscollege}}",
      description: `- Managed WordPress websites of 4 university departments.
      - Used builders, PHP, JavaScript, HTML, and CSS to make websites resilient.
      - Designed with mobile first approach.
      - Achieved a 35% decrease in reported bugs.
      - Integrated third-party APIs to aid in development.`,
    },
    {
      templateString: "{{metaspark}}",
      description: `- Completed an intensive 10-week program, mastering Augmented Reality for UX Design.
      - Acquired advanced skills in spatial interactions and 3D design principles.
      - Leveraged AR to create immersive user experiences.
      - Created a project for mobile phones that applied filters and animations.
      - Earned Meta Spark certification.`,
    },
    {
      templateString: "{{google1}}",
      description: `- Conducted competitive analysis of 5 leading sales training platforms.
      - Prioritized list of features for an AI-first CRM.
      - Designed CRM with reused components using Figma.
      - Ideated roadmap for a Google CRM system with LLM powered capabilities.`,
    },
    {
      templateString: "{{google2}}",
      description: `- Conducted case study of how to improve Google Maps.
      - Designed remediations using Figma.
      - Conducted 20 user usability testing and user research.
      - Remediated 4 customer pain points.`,
    }
  ];

  roles.forEach( (role) => {
    Logger.log("ROle")
    resume.getBody().replaceText(role.templateString, Helper.askBardText(
      `Given the following resume role description:\n\n
      Resume Role Description:\n${role.description}\n\n
      Create a short summary that incorporates the the following responsibilities and technical skills to tailor the resume:\n\n
      ${summary}`,
      BulletGenerator.TEXT
    ).replace(": ", ""));
  });

  // Replace email template with custom email id in cover letter;
  const coverLetter = DocumentApp.openById(Helper.getIdFromUrl(entry.coverLetterLink));
  coverLetter.getBody().replaceText("{{email}}", entry.email);
  coverLetter.getBody().replaceText("{{date}}", new Date().toLocaleDateString());
  coverLetter.getBody().replaceText("{{body}}", Helper.askBardText(
    `Given this resume:\n\n
  ${resume.getBody().getText()}\n\n
  Create a brief but compelling cover letter body for this summarized job description:\n\n
  ${summary}`,
    ""
  ));

  Logger.log("Cover Letter")
}