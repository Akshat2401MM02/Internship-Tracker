const PDFDocument = require('pdfkit');

const PAGE_MARGIN = 50;
const ACCENT_COLOR = '#4338ca';
const TEXT_COLOR = '#1f2937';
const MUTED_COLOR = '#6b7280';

const addSectionHeading = (doc, text) => {
  doc.moveDown(0.6);
  doc
    .fillColor(ACCENT_COLOR)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text(text.toUpperCase(), { characterSpacing: 0.5 });
  const y = doc.y + 2;
  doc
    .moveTo(PAGE_MARGIN, y)
    .lineTo(doc.page.width - PAGE_MARGIN, y)
    .strokeColor(ACCENT_COLOR)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.5);
  doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(10);
};

const addBullets = (doc, bullets) => {
  if (!bullets || bullets.length === 0) return;
  bullets.forEach((bullet) => {
    doc
      .fillColor(TEXT_COLOR)
      .font('Helvetica')
      .fontSize(9.5)
      .text(`•  ${bullet}`, PAGE_MARGIN + 10, doc.y, {
        width: doc.page.width - PAGE_MARGIN * 2 - 10,
        align: 'left',
      });
    doc.moveDown(0.15);
  });
};

// @desc    Generate a downloadable PDF from the current structured resume
// @route   POST /api/resume/pdf
// @access  Private
const generateResumePdf = async (req, res, next) => {
  try {
    const { resume } = req.body;

    if (!resume || !resume.fullName) {
      res.status(400);
      throw new Error('No resume data provided');
    }

    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="tailored-resume.pdf"');

    doc.pipe(res);

    // Header — Name
    doc
      .fillColor(TEXT_COLOR)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text(resume.fullName, { align: 'center' });

    if (resume.contact) {
      doc.moveDown(0.3);
      doc
        .fillColor(MUTED_COLOR)
        .font('Helvetica')
        .fontSize(9.5)
        .text(resume.contact, { align: 'center' });
    }

    // Summary
    if (resume.summary) {
      addSectionHeading(doc, 'Summary');
      doc.fontSize(9.5).text(resume.summary, { align: 'left', lineGap: 2 });
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      addSectionHeading(doc, 'Skills');
      resume.skills.forEach((skillGroup) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor(TEXT_COLOR)
          .text(`${skillGroup.category}: `, { continued: true })
          .font('Helvetica')
          .text(skillGroup.items);
        doc.moveDown(0.15);
      });
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
      addSectionHeading(doc, 'Experience');
      resume.experience.forEach((exp, idx) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor(TEXT_COLOR)
          .text(exp.title, { continued: !!exp.organization });
        if (exp.organization) {
          doc.font('Helvetica').fontSize(10).text(`  —  ${exp.organization}`);
        }
        if (exp.dates) {
          doc.font('Helvetica-Oblique').fontSize(9).fillColor(MUTED_COLOR).text(exp.dates);
        }
        doc.moveDown(0.2);
        addBullets(doc, exp.bullets);
        if (idx < resume.experience.length - 1) doc.moveDown(0.3);
      });
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      addSectionHeading(doc, 'Projects');
      resume.projects.forEach((proj, idx) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor(TEXT_COLOR)
          .text(proj.name, { continued: !!proj.techStack });
        if (proj.techStack) {
          doc.font('Helvetica-Oblique').fontSize(9).fillColor(MUTED_COLOR).text(`  (${proj.techStack})`);
        }
        doc.moveDown(0.2);
        addBullets(doc, proj.bullets);
        if (idx < resume.projects.length - 1) doc.moveDown(0.3);
      });
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      addSectionHeading(doc, 'Education');
      resume.education.forEach((edu) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor(TEXT_COLOR)
          .text(edu.institution);
        doc.font('Helvetica').fontSize(9.5).fillColor(TEXT_COLOR).text(edu.degree);
        const detailLine = [edu.dates, edu.detail].filter(Boolean).join('  |  ');
        if (detailLine) {
          doc.font('Helvetica-Oblique').fontSize(9).fillColor(MUTED_COLOR).text(detailLine);
        }
        doc.moveDown(0.3);
      });
    }

    // Extras (Leadership, Competitive Programming, Certifications, etc.)
    if (resume.extras && resume.extras.length > 0) {
      resume.extras.forEach((section) => {
        addSectionHeading(doc, section.sectionTitle);
        addBullets(doc, section.bullets);
      });
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { generateResumePdf };
