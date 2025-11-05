#!/usr/bin/env python3
"""Extract text from PDF and convert to markdown."""

import sys
import os

try:
    import PyPDF2
    
    def extract_pdf_text(pdf_path):
        """Extract text from PDF file."""
        with open(pdf_path, 'rb') as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            text_content = []
            for page in reader.pages:
                text = page.extract_text()
                if text.strip():
                    text_content.append(text)
            return '\n\n'.join(text_content)
except ImportError:
    try:
        import pdfplumber
        
        def extract_pdf_text(pdf_path):
            """Extract text from PDF file using pdfplumber."""
            text_content = []
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_content.append(text)
            return '\n\n'.join(text_content)
    except ImportError:
        print("Error: Neither PyPDF2 nor pdfplumber is installed.")
        print("Please install one: pip install PyPDF2 OR pip install pdfplumber")
        sys.exit(1)

if __name__ == "__main__":
    pdf_path = r"2. Gauntlet Week 4\1. Artifacts\1. Requirements\PDFs\[PLAT]-Nerdy Case 5_ 48-Hour AI Product Sprint.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        sys.exit(1)
    
    try:
        text = extract_pdf_text(pdf_path)
        print(text)
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        sys.exit(1)

