namespace Helper {
  /**
   * Creates a Date object indicating approximate posting date per scraped LinkedIn job post.
   */
  export function datePostedFormat(datePosted: string): Date {
    const offset = parseInt(datePosted.replace(new RegExp("[^0-9]", "gi"), ''));
    const date = new Date();
  
    if (datePosted.includes("day")) {
      date.setDate(date.getDate() - offset);
    }
    else if (datePosted.includes("week")) {
      date.setDate(date.getDate() - (offset * 7));
    }
    else if (datePosted.includes("month")) {
      date.setMonth(date.getMonth() - offset);
    }
  
    return date;
  }
  
  /**
   * Logs an entry type to the Google Sheet pointed to by the enviornment variable.
   */
  export function addEntry(entry: Types.Entry): void {
    const sheet = SpreadsheetApp.openById(Env.SHEET_WORK_TRACKER_ID);
  
    let row: any[] = [];
  
    for (const [_, value] of Object.entries(entry)) {
      row.push(value);
    }
  
    sheet.appendRow(row);
  }

  /**
   * Generates an email that is unique for each job by searching the Google Sheet in the environmnet variable.
   */
  export function generateUniqueEmail(email: string, company: string, position: string): string {
    const username = email.slice(0, email.indexOf("@"));
    const domain = email.slice(email.indexOf("@"));
    const count = SpreadsheetApp.openById(Env.SHEET_WORK_TRACKER_ID)
                              .createTextFinder(company)
                              .matchEntireCell(true)
                              .matchCase(true)
                              .findAll()
                              .length;
    const identifier = `+${company.toLowerCase().replace(" ", "") + count}`;
    
    return username + identifier + domain;
  }

  /**
   * Makes an API request to the PaLM API set in chat mode. It will recall previous queries.
   */
  export function askBardText(input: string): any {
    Logger.log(Training.TEXT);
    return "";
  }
}