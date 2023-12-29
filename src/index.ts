function tailorResume(url: string) {
  const rawHTML: string = UrlFetchApp.fetch(url).getContentText();
  const document = new Classes.Document(rawHTML);

  // Extracts information for tracking on the Work Tracker Google Sheet.
  let entry: Types.Entry = {
    position: document.querySelector("h1.top-card-layout__title font-sans text-lg papabear:text-xl font-bold leading-open text-color-text mb-0 topcard__title").innerText(),
    company: document.querySelector("a.topcard__org-name-link topcard__flavor--black-link").innerText(),
    datePosted: Helper.datePostedFormat(document.querySelector("span.posted-time-ago__text topcard__flavor--metadata").innerText()),
    dateApplied: new Date(),
    recruiter: "",
    link: url,
    applicantCount: parseInt(document.querySelector("span.num-applicants__caption topcard__flavor--metadata topcard__flavor--bullet").innerText().replace(new RegExp("[^0-9]", "gi"), '')),
    seniority: document.querySelector("span.description__job-criteria-text description__job-criteria-text--criteria").innerText(),
    resumeLink: DriveApp.getFileById(Env.DOC_RESUME_TEMPLATE_ID).makeCopy().getUrl(),
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

  // Helper.addEntry(entry);

  // Tailor the new Google Document to fit the job description.
  const response = Helper.askBardText("Please highlight all the technical skills, action verbs, and key phrases mentioned in this job description:\n\n" + entry.description);
  Logger.log(response);
}

tailorResume("https://www.linkedin.com/jobs/view/3782409489");