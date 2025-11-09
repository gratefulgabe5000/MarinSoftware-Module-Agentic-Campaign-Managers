#!/usr/bin/env python3
"""Extract text from PDFs and convert to markdown."""

import sys
import os

# Try to import PDF libraries
try:
    import PyPDF2
    PDF_LIBRARY = 'PyPDF2'
    
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
        PDF_LIBRARY = 'pdfplumber'
        
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

def convert_pdf_to_markdown(pdf_path, output_path):
    """Convert PDF to markdown file."""
    print(f"Extracting text from: {pdf_path}")
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        return False
    
    try:
        text = extract_pdf_text(pdf_path)
        
        # Write to markdown file
        with open(output_path, 'w', encoding='utf-8') as md_file:
            md_file.write(text)
        
        print(f"Successfully created: {output_path}")
        return True
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return False

if __name__ == "__main__":
    base_dir = "2. Gauntlet Week 4/1. Artifacts/1. Requirements/New drops"
    
    pdfs = [
        ("[PLAT] Superbuilders - Handwriting Math Project.pdf", 
         "[PLAT] Superbuilders - Handwriting Math Project.md"),
        ("[PLAT] Superbuilders - Playcademy Vocab.pdf",
         "[PLAT] Superbuilders - Playcademy Vocab.md")
    ]
    
    for pdf_name, md_name in pdfs:
        pdf_path = os.path.join(base_dir, pdf_name)
        md_path = os.path.join(base_dir, md_name)
        convert_pdf_to_markdown(pdf_path, md_path)

