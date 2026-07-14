from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Cm, Pt


OUTPUT = Path(r"D:\Mau_bao_cao_TTTN.docx")


def set_style_font(style, font_name: str, size_pt: float) -> None:
    style.font.name = font_name
    style.font.size = Pt(size_pt)
    style._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), font_name)
    style._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), font_name)
    style._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), font_name)


doc = Document()
section = doc.sections[0]
section.orientation = WD_ORIENT.PORTRAIT
section.page_width = Cm(21.0)
section.page_height = Cm(29.7)
section.top_margin = Cm(2.0)
section.bottom_margin = Cm(2.0)
section.right_margin = Cm(2.0)
section.left_margin = Cm(3.0)
section.header_distance = Cm(1.0)
section.footer_distance = Cm(1.0)

# Formal-report baseline; the user-specified paragraph settings override the
# selected narrative-report preset wherever they differ.
normal = doc.styles["Normal"]
set_style_font(normal, "Times New Roman", 13)
normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
normal.paragraph_format.space_before = Pt(3)
normal.paragraph_format.space_after = Pt(3)
normal.paragraph_format.line_spacing = 1.15

# Ensure the initial blank paragraph is explicitly ready for typing even in
# editors that do not immediately refresh inherited style properties.
paragraph = doc.add_paragraph()
paragraph.style = normal
paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
paragraph.paragraph_format.space_before = Pt(3)
paragraph.paragraph_format.space_after = Pt(3)
paragraph.paragraph_format.line_spacing = 1.15

doc.core_properties.title = "Mẫu báo cáo thực tập tốt nghiệp"
doc.core_properties.subject = "Mẫu Word A4 với định dạng đoạn văn theo yêu cầu"
doc.core_properties.author = ""
doc.core_properties.last_modified_by = ""

doc.save(OUTPUT)
print(OUTPUT)
