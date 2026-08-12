import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export class ResumeFileParseError extends Error {}

async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pageTexts.push(pageText);
  }
  return pageTexts.join("\n\n");
}

async function extractDocxText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

async function extractPlainText(file: File): Promise<string> {
  return file.text();
}

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  let text: string;
  try {
    if (file.type === "application/pdf" || name.endsWith(".pdf")) {
      text = await extractPdfText(file);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx")
    ) {
      text = await extractDocxText(file);
    } else if (file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
      text = await extractPlainText(file);
    } else {
      throw new ResumeFileParseError(
        "Unsupported file type. Please upload a PDF, DOCX, or plain text file.",
      );
    }
  } catch (err) {
    if (err instanceof ResumeFileParseError) throw err;
    throw new ResumeFileParseError(
      `Couldn't read that file — it may be corrupted, password-protected, or an old .doc file (only .docx is supported). Try exporting it as a PDF instead.`,
    );
  }

  if (!text.trim()) {
    throw new ResumeFileParseError(
      "No text could be extracted from that file. If it's a scanned/image-based PDF, try a text-based export instead.",
    );
  }
  return text;
}
