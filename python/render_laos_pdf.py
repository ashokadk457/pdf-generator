from __future__ import annotations

import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def p(text: object) -> str:
    return escape(str(text or "")).replace("\n", "<br/>")


def clean_lines(text: str) -> list[str]:
    lines: list[str] = []
    for raw in str(text or "").splitlines():
        line = raw.strip()
        if line:
            lines.append(line)
    return lines


def paragraph_block(text: str, style) -> list:
    lines = clean_lines(text)
    if not lines:
        return [Paragraph(" ", style)]

    flow = []
    for line in lines:
        if line.startswith("- "):
            flow.append(Paragraph(f"&#8226; {p(line[2:])}", style))
        else:
            flow.append(Paragraph(p(line), style))
        flow.append(Spacer(1, 0.045 * inch))
    return flow


def bullets_block(items: list[str], style) -> list:
    lines = [str(item or "").strip() for item in items if str(item or "").strip()]
    if not lines:
        return [Paragraph(" ", style)]

    flow = []
    for item in lines:
        flow.append(Paragraph(f"&#8226; {p(item)}", style))
        flow.append(Spacer(1, 0.045 * inch))
    return flow


def short_value(value: object, fallback: str = "") -> str:
    text = str(value or "").strip()
    return text if text else fallback


BRAND_TEAL = colors.HexColor("#0f4c5c")
BRAND_GREEN = colors.HexColor("#63c81f")
BRAND_DARK = colors.HexColor("#17384a")
BRAND_SOFT = colors.HexColor("#eaf4f6")


def pick_logo_path() -> Path | None:
    candidates = [
        Path(__file__).with_name("wannatalk-logo.png"),
        Path(__file__).with_name("wannatalklogo.png"),
        Path(__file__).with_name("wannatalklogo-white.png"),
        Path(__file__).with_name("wannatalk logo2.png"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def add_logo(canvas, x: float, y: float, width: float) -> None:
    logo_path = pick_logo_path()
    if not logo_path:
        return
    try:
        reader = ImageReader(str(logo_path))
        iw, ih = reader.getSize()
        height = width * (ih / float(iw))
        canvas.drawImage(reader, x, y, width=width, height=height, mask='auto', preserveAspectRatio=True)
    except Exception:
        return


def build_doc(input_path: Path, output_path: Path) -> None:
    payload = json.loads(input_path.read_text("utf-8"))

    title = short_value(payload.get("title"), "LAOS DSP Template Report")
    meta = payload.get("meta") if isinstance(payload.get("meta"), dict) else {}
    sections = payload.get("sections") if isinstance(payload.get("sections"), list) else []
    faith_section = payload.get("faithSection") if isinstance(payload.get("faithSection"), dict) else None
    include_faith = bool(payload.get("includeFaithAppendix"))

    def section_by_title(expected: str) -> dict | None:
        for section in sections:
            if short_value(section.get("title")).strip() == expected:
                return section
        return None

    report_summary = short_value(payload.get("summary") or payload.get("reportText"))

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="LAOSCoverTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            alignment=TA_CENTER,
            textColor=BRAND_DARK,
        )
    )
    styles.add(
        ParagraphStyle(
            name="LAOSCoverSub",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=14,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#4f6775"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="LAOSSection",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13.5,
            leading=16,
            spaceBefore=4,
            spaceAfter=5,
            textColor=BRAND_DARK,
        )
    )
    styles.add(
        ParagraphStyle(
            name="LAOSBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.7,
            leading=12.6,
            textColor=colors.HexColor("#1c2d37"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="LAOSSmall",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.5,
            textColor=colors.HexColor("#4f6775"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="LAOSMetaLabel",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
            textColor=BRAND_DARK,
        )
    )
    styles.add(
        ParagraphStyle(
            name="LAOSMetaValue",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#1c2d37"),
        )
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=0.62 * inch,
        rightMargin=0.62 * inch,
        topMargin=0.72 * inch,
        bottomMargin=0.62 * inch,
        title=title,
        author="WannaTalk / LAOS",
    )

    def on_page(canvas, doc_):
        canvas.saveState()
        canvas.setFillColor(BRAND_DARK)
        canvas.rect(doc.leftMargin, doc.pagesize[1] - 0.42 * inch, doc.width, 0.02 * inch, stroke=0, fill=1)
        canvas.setFont("Helvetica-Bold", 9)
        canvas.setFillColor(BRAND_DARK)
        canvas.drawString(doc.leftMargin, doc.pagesize[1] - 0.36 * inch, "WannaTalk | LAOS DSP Report")
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#506878"))
        canvas.drawRightString(doc.pagesize[0] - doc.rightMargin, doc.pagesize[1] - 0.36 * inch, f"Page {doc_.page}")
        canvas.setFont("Helvetica", 8.5)
        canvas.setFillColor(colors.HexColor("#5c7484"))
        canvas.drawCentredString(doc.pagesize[0] / 2, 0.34 * inch, "Talk it out. You are not alone.")
        canvas.restoreState()

    def meta_table(rows: list[list[str]], col_widths: list[float]) -> Table:
        table = Table([[Paragraph(p(left), styles["LAOSMetaLabel"]), Paragraph(p(right), styles["LAOSMetaValue"])] for left, right in rows], colWidths=col_widths)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                    ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#9dc9d1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cfe1e6")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        return table

    def section_table(columns: list[str], rows: list[list[str]], col_widths: list[float] | None = None) -> Table:
        header = [Paragraph(p(column), styles["LAOSMetaLabel"]) for column in columns]
        body = [[Paragraph(p(cell), styles["LAOSBody"]) for cell in row] for row in rows]
        table_rows = [header] + body
        table = Table(table_rows, colWidths=col_widths, repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), BRAND_SOFT),
                    ("TEXTCOLOR", (0, 0), (-1, 0), BRAND_DARK),
                    ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#9dc9d1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cfe1e6")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        return table

    def render_section(section: dict) -> list:
        title = short_value(section.get("title"), "")
        kind = short_value(section.get("kind"), "text").lower()
        items: list = [Paragraph(p(title), styles["LAOSSection"]), Spacer(1, 0.04 * inch)]

        if kind == "table" and isinstance(section.get("rows"), list):
            columns = section.get("columns") if isinstance(section.get("columns"), list) and section.get("columns") else ["Item", "Detail"]
            rows = []
            for row in section.get("rows", []):
                if not isinstance(row, list):
                    continue
                clean_row = [str(cell or "").strip() for cell in row]
                if len(clean_row) < len(columns):
                    clean_row.extend([""] * (len(columns) - len(clean_row)))
                rows.append(clean_row[: len(columns)])
            if rows:
                if len(columns) == 2:
                    items.append(section_table(columns, rows, [2.65 * inch, 3.9 * inch]))
                elif len(columns) == 3:
                    items.append(section_table(columns, rows, [1.95 * inch, 2.0 * inch, 2.6 * inch]))
                else:
                    total = 6.55 * inch
                    width = total / max(len(columns), 1)
                    items.append(section_table(columns, rows, [width] * len(columns)))
            else:
                items.extend(paragraph_block(short_value(section.get("text"), ""), styles["LAOSBody"]))
            return items

        if kind == "bullets" and isinstance(section.get("bullets"), list):
            items.extend(bullets_block(section.get("bullets", []), styles["LAOSBody"]))
            return items

        items.extend(paragraph_block(short_value(section.get("text"), ""), styles["LAOSBody"]))
        return items

    story: list = []

    # Cover page
    logo_path = pick_logo_path()
    if logo_path:
        from reportlab.platypus import Image as PlatypusImage
        logo_reader = ImageReader(str(logo_path))
        logo_width = 1.15 * inch
        logo_image_width, logo_image_height = logo_reader.getSize()
        logo_height = logo_width * (logo_image_height / float(logo_image_width))
        story.append(PlatypusImage(str(logo_path), width=logo_width, height=logo_height, hAlign="CENTER"))
        story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph("LAOS DSP Template Report", styles["LAOSCoverTitle"]))
    story.append(Paragraph("Structured facilitator report generated from the clinical transcript and reasoning model", styles["LAOSCoverSub"]))
    story.append(Spacer(1, 0.18 * inch))

    cover_rows = [
        ["DSP number", short_value(meta.get("caseCode"), "DSP-____")],
        ["Patient / case code", short_value(meta.get("caseName"), "________________")],
        ["Patient", short_value(meta.get("patient"), "________________")],
        ["Language", short_value(meta.get("language"), "English / Afrikaans / Mixed")],
        ["Session date", short_value(meta.get("sessionDate"), "________________")],
        ["Prepared by", short_value(meta.get("preparedBy"), "Louw Alberts / __________________")],
        ["Status", short_value(meta.get("status"), "Working draft")],
    ]
    story.append(meta_table(cover_rows, [1.65 * inch, 4.35 * inch]))
    story.append(Spacer(1, 0.22 * inch))

    cover_summary = report_summary.split("\n\n")[0] if report_summary else "No summary available."
    story.append(Spacer(1, 0.08 * inch))
    story.append(Paragraph("Report summary", styles["LAOSSection"]))
    story.append(Paragraph(p(cover_summary), styles["LAOSBody"]))
    story.append(Spacer(1, 0.1 * inch))

    highlight_rows = [
        ["1", "DSP identification"],
        ["2", "Presenting concern"],
        ["3", "Key observations"],
        ["4", "Questions asked and why"],
        ["5", "Reasoning model"],
        ["6", "Evidence model"],
        ["7", "Confidence and uncertainty"],
        ["8", "Keywords and patient bible notes"],
        ["9", "LAOS learning summary"],
        ["10", "Follow-up and next steps"],
    ]
    story.append(meta_table(highlight_rows, [0.4 * inch, 5.6 * inch]))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph("The main report follows the original DSP template structure and keeps faith / meaning as a separate optional appendix.", styles["LAOSSmall"]))

    # Pages 2-4
    story.append(PageBreak())

    ordered_titles = [
        "1. DSP Identification",
        "2. Presenting Concern",
        "3. Key Observations",
        "4. Questions Asked and Why",
        "5. Reasoning Model",
        "6. Evidence Model",
        "7. Confidence and Uncertainty",
        "8. Keywords and Patient Bible Notes",
        "9. LAOS Learning Summary",
        "10. Follow-up and Next Steps",
    ]

    page_groups = [
        ordered_titles[0:3],
        ordered_titles[3:7],
        ordered_titles[7:10],
    ]

    for index, group in enumerate(page_groups):
        if index > 0:
            story.append(PageBreak())
        story.append(Paragraph(f"LAOS DSP Report - {title}", styles["LAOSSection"]))
        story.append(Spacer(1, 0.02 * inch))
        story.append(Spacer(1, 0.02 * inch))
        for heading in group:
            section = section_by_title(heading)
            if not section:
                continue
            story.extend(render_section(section))

    if include_faith and faith_section:
        story.append(PageBreak())
        story.append(Paragraph("Faith / Meaning Appendix", styles["LAOSSection"]))
        story.append(Paragraph("This appendix is separate from the main DSP template and only appears when explicitly enabled.", styles["LAOSSmall"]))
        story.append(Spacer(1, 0.08 * inch))
        story.append(Paragraph(p(short_value(faith_section.get("title"), "Faith / Meaning Framework")), styles["LAOSSection"]))
        if isinstance(faith_section.get("rows"), list) and faith_section.get("rows"):
            columns = faith_section.get("columns") if isinstance(faith_section.get("columns"), list) and faith_section.get("columns") else ["Item", "Detail"]
            rows = [[str(cell or "").strip() for cell in row] for row in faith_section.get("rows", []) if isinstance(row, list)]
            if rows:
                if len(columns) == 2:
                    story.append(section_table(columns, rows, [2.65 * inch, 3.9 * inch]))
                else:
                    story.append(section_table(columns, rows))
            else:
                story.extend(paragraph_block(short_value(faith_section.get("text"), ""), styles["LAOSBody"]))
        else:
            story.extend(paragraph_block(short_value(faith_section.get("text"), ""), styles["LAOSBody"]))

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("Usage: render_laos_pdf.py INPUT_JSON OUTPUT_PDF", file=sys.stderr)
        return 2

    input_path = Path(argv[1]).expanduser().resolve()
    output_path = Path(argv[2]).expanduser().resolve()
    build_doc(input_path, output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
