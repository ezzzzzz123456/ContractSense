"""
PDF Parser Service
Extracts text and splits into clause chunks using PyMuPDF and pdfplumber.
"""

import io
import re
from typing import NamedTuple

import fitz  # PyMuPDF
import pdfplumber


class Clause(NamedTuple):
    index: int
    text: str


def extract_text_pymupdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF using PyMuPDF."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text_parts: list[str] = []
    for page in doc:
        text_parts.append(page.get_text("text"))  # type: ignore[arg-type]
    doc.close()
    return "\n".join(text_parts)


def extract_text_pdfplumber(file_bytes: bytes) -> str:
    """Fallback: extract text using pdfplumber (better for tables/columns)."""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    return "\n".join(pages)


def extract_text(file_bytes: bytes, mime_type: str = "application/pdf") -> str:
    """
    Extract text from a PDF (or DOCX stub).
    Tries PyMuPDF first; falls back to pdfplumber if output is too sparse.
    """
    try:
        text = extract_text_pymupdf(file_bytes)
        if len(text.strip()) < 100:
            text = extract_text_pdfplumber(file_bytes)
    except Exception:
        text = extract_text_pdfplumber(file_bytes)
    return text


def split_into_clauses(text: str) -> list[Clause]:
    """
    Heuristically split contract text into clause chunks.
    
    Strategy:
    1. Split on numbered headings (1., 2., 1.1, etc.)
    2. Split on ALL CAPS clausal headings
    3. Fallback: split on double newlines, cap at ~800 chars per chunk
    """
    # Pattern: numbered clauses like "1.", "1.1", "Article 1", "Section 1"
    numbered = re.compile(
        r'(?:^|\n)(?:(?:Article|Section|Clause)\s+\d+[\.\:]|(?:\d+\.)+\d*\s)',
        re.MULTILINE | re.IGNORECASE,
    )

    parts = numbered.split(text)
    # Remove empty/whitespace parts
    parts = [p.strip() for p in parts if p.strip() and len(p.strip()) > 40]

    if len(parts) >= 3:
        return [Clause(index=i, text=p) for i, p in enumerate(parts)]

    # Fallback: split on double newline, group into ~800-char chunks
    paragraphs = [p.strip() for p in re.split(r'\n{2,}', text) if p.strip() and len(p.strip()) > 40]
    chunks: list[str] = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) > 800:
            if current:
                chunks.append(current.strip())
            current = para
        else:
            current += "\n\n" + para
    if current.strip():
        chunks.append(current.strip())

    return [Clause(index=i, text=c) for i, c in enumerate(chunks)]
