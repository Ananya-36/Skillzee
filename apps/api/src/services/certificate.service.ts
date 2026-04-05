import PDFDocument from "pdfkit";
import { format } from "date-fns";

export async function generateCertificatePdf(input: {
  learnerName: string;
  trainerName: string;
  skillTitle: string;
  completedAt: Date;
}) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0b1020");
    doc.fillColor("#f8fafc");
    doc.fontSize(30).text("SkillSwap Certificate of Completion", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).fillColor("#94a3b8").text("Where skills create value", { align: "center" });
    doc.moveDown(2);
    doc.fillColor("#e2e8f0").fontSize(18).text(`Awarded to ${input.learnerName}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`For successfully completing "${input.skillTitle}"`, { align: "center" });
    doc.moveDown();
    doc.text(`Guided by ${input.trainerName}`, { align: "center" });
    doc.moveDown(2);
    doc.fillColor("#60a5fa").text(`Completed on ${format(input.completedAt, "PPP")}`, { align: "center" });
    doc.moveDown(4);
    doc.fillColor("#e2e8f0").fontSize(12).text("Issued by SkillSwap", { align: "center" });
    doc.end();
  });
}
