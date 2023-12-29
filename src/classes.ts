namespace Classes {
  export class Document {
    html: string;

    constructor(html: string) {
      this.html = html;
    }

    innerText(): string {
      return this.html.trim()
                      .replace(new RegExp("<br>", "gi"), "\n")
                      .replace(new RegExp("<li>", "gi"), "•")
                      .replace(new RegExp("</li>", "gi"), "\n")
                      .replace(new RegExp('<\/?[^>]+>', 'gi'), "");
    }

    querySelector(query: string): Document {
      const separator = query.indexOf(".");
      const element = query.slice(0, separator);
      const classNames = query.slice(separator + 1);
    
      let opening = `<${element} class="${classNames}"`;
    
      // Append attributes ahead of 'class'
      const openingIndex = this.html.indexOf(opening);
      const openingRemainingIndex = this.html.indexOf('>', openingIndex + opening.length);
      const remaining = this.html.slice(openingIndex + opening.length, openingRemainingIndex + 1);
      opening += remaining;
      
      const closing = `</${element}>`;
    
      return new Document(
        this.html.slice(
          openingIndex + opening.length,
          this.html.indexOf(closing, openingIndex + opening.length)
        )
      );
    }
  }
}