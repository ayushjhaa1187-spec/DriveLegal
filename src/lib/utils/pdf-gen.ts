import { jsPDF } from "jspdf";
import type { QueryResult } from "@/lib/law-engine/types";

interface DisputeData {
  challanNumber?: string;
  date?: string | null;
  amountCharged: number;
  section?: string | null;
  match: QueryResult["results"][0];
}

/**
 * Generates a professional legal dispute draft PDF using jsPDF.
 * Follows the user's requirement for a restrained, professional header.
 */
export function generateDisputePDF(data: DisputeData) {
  const doc = new jsPDF();
  const margin = 20;
  let y = 30;

  // Header: DriveLegal - Legal Draft Assistance
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("DRIVELEGAL – LEGAL DRAFT ASSISTANCE", margin, y);
  
  y += 10;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, 190, y);
  
  y += 15;
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text("Challan Dispute Notice (Draft)", margin, y);

  y += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
  y += 6;
  doc.text(`Challan Ref: ${data.challanNumber || "Not Specified"}`, margin, y);
  y += 6;
  doc.text(`Incident Date: ${data.date || "Not Specified"}`, margin, y);

  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("To,", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text("The Traffic Police Department / Concerned Authority,", margin, y);
  y += 6;
  doc.text("Jurisdiction Area,", margin, y);
  y += 6;
  doc.text("Subject: Formal request for rectification of incorrectly charged challan.", margin, y);

  y += 15;
  doc.text("Respected Sir/Madam,", margin, y);
  y += 10;
  const bodyText = `I am writing to formally dispute the fine amount levied in the aforementioned challan. According to the Motor Vehicles Act (and relevant state notifications), specifically ${data.match.citation.section}, the maximum official fine for this violation (${data.match.violation.title.en}) is ${data.match.resolvedFine.displayText}.

However, as per the receipt/notification provided, I have been charged a sum of Rs. ${data.amountCharged}/-, which appears to exceed the statutory limit prescribed by law.

I request you to verify the records and rectify the amount as per the authorized Compounding Fee schedules. I am a law-abiding citizen and am willing to pay the correctly assessed fine as per the prevailing legal framework.`;

  const splitText = doc.splitTextToSize(bodyText, 170);
  doc.text(splitText, margin, y);

  y += (splitText.length * 6) + 15;
  doc.text("Looking forward to your favorable response.", margin, y);
  y += 15;
  doc.text("Sincerely,", margin, y);
  y += 15;
  doc.line(margin, y, 70, y);
  y += 6;
  doc.text("(Full Name & Signature)", margin, y);

  // Footer / Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("This document is a computer-generated draft provided by DriveLegal for informational purposes.", margin, 280);
  doc.text("It does not constitute formal legal representation. Users should verify local rules before submission.", margin, 285);

  doc.save(`DriveLegal_Dispute_${data.challanNumber || "Draft"}.pdf`);
}
