import * as crypto from "crypto";

export class ResumeSerivces {
  private title: string;
  private resumeContent: string;
  private hash: string;

  constructor({
    title,
    resumeContent,
  }: {
    title: string;
    resumeContent: string;
  }) {
    this.title = title;
    this.resumeContent = resumeContent;
    const data = JSON.stringify({
      resumeContent: this.resumeContent,
    });
    this.hash = crypto.createHash("sha256").update(data).digest("hex");
  }

  getHash() {
    return this.hash;
  }
}
