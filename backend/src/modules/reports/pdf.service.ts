import PDFDocument from 'pdfkit';

export class PDFService {
  static generateStudentReportPDF(data: { student: any; grades: any[] }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: any) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: any) => reject(err));
      
      // A4 dimensions: 595.28 x 841.89 pt
      
      // Top bar header decoration
      doc.fillColor('#3525cd').rect(0, 0, 595.28, 90).fill();
      
      // School branding
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('IKONEX ACADEMY', 40, 25);
      doc.fontSize(10).font('Helvetica').text('ACADEMIC REPORT CARD', 40, 55);
      
      // Address / contact
      doc.fillColor('#ffffff').fontSize(8);
      doc.text('P.O. Box 12345-00100', 400, 20, { width: 155, align: 'right' });
      doc.text('Nairobi, Kenya', 400, 32, { width: 155, align: 'right' });
      doc.text('Email: info@ikonexacademy.ac.ke', 400, 44, { width: 155, align: 'right' });
      doc.text('Phone: +254 712 345 678', 400, 56, { width: 155, align: 'right' });
      
      const student = data.student;
      doc.y = 120;
      doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('STUDENT INFORMATION', 40, 110);
      
      // Details box
      doc.strokeColor('#e2e8f0').lineWidth(1).rect(40, 130, 515, 80).stroke();
      
      doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold');
      doc.text('NAME:', 55, 142);
      doc.text('ADM NO:', 55, 162);
      doc.text('GENDER:', 55, 182);
      
      doc.fillColor('#0f172a').font('Helvetica');
      doc.text(student.fullName.toUpperCase(), 115, 142);
      doc.text(student.admissionNumber, 115, 162);
      doc.text(student.gender, 115, 182);
      
      doc.fillColor('#64748b').font('Helvetica-Bold');
      doc.text('FORM LEVEL:', 300, 142);
      doc.text('STREAM:', 300, 162);
      doc.text('CLASS POSITION:', 300, 182);
      
      doc.fillColor('#0f172a').font('Helvetica');
      doc.text(student.formLevel, 395, 142);
      doc.text(student.stream, 395, 162);
      doc.text(student.overallPosition ? `${student.overallPosition}` : 'N/A', 395, 182);
      
      // Table Header Row
      doc.y = 230;
      doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('ACADEMIC PERFORMANCE SUMMARY', 40, 230);
      
      const tableTop = 250;
      doc.fillColor('#f8fafc').rect(40, tableTop, 515, 25).fill();
      doc.strokeColor('#cbd5e1').rect(40, tableTop, 515, 25).stroke();
      
      doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold');
      doc.text('SUBJECT', 50, tableTop + 8);
      doc.text('CA SCORE', 155, tableTop + 8);
      doc.text('EXAM SCORE', 215, tableTop + 8);
      doc.text('TOTAL POINTS', 285, tableTop + 8);
      doc.text('GRADE', 365, tableTop + 8);
      doc.text('RANK', 415, tableTop + 8);
      doc.text('REMARKS', 460, tableTop + 8);
      
      let currentY = tableTop + 25;
      let totalSum = 0;
      let count = 0;
      
      doc.fontSize(8).font('Helvetica');
      
      data.grades.forEach((g) => {
        if (count % 2 === 1) {
          doc.fillColor('#f8fafc').rect(40, currentY, 515, 25).fill();
        }
        doc.strokeColor('#e2e8f0').rect(40, currentY, 515, 25).stroke();
        
        doc.fillColor('#0f172a').text(g.subject, 50, currentY + 8);
        doc.text(`${g.caScore}/${g.caMax}`, 155, currentY + 8);
        doc.text(`${g.examScore}/${g.examMax}`, 215, currentY + 8);
        doc.text(`${g.totalScore}/${g.totalMax} (${g.percent}%)`, 285, currentY + 8);
        doc.text(g.letter, 365, currentY + 8);
        doc.text(g.subjectPosition ? `${g.subjectPosition}` : 'N/A', 415, currentY + 8);
        doc.text(g.remarks, 460, currentY + 8, { width: 90 });
        
        totalSum += g.percent;
        count++;
        currentY += 25;
      });
      
      // Cumulative Summary Row
      const avgPercent = count > 0 ? Math.round(totalSum / count) : 0;
      
      doc.fillColor('#f1f5f9').rect(40, currentY, 515, 30).fill();
      doc.strokeColor('#cbd5e1').rect(40, currentY, 515, 30).stroke();
      
      doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(9);
      doc.text('CUMULATIVE AVERAGE PERCENTAGE:', 50, currentY + 11);
      doc.text(`${avgPercent}%`, 285, currentY + 11);
      
      // Attendance rates & other metrics
      currentY += 50;
      doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('ATTENDANCE & CONDUCT', 40, currentY);
      
      currentY += 15;
      doc.strokeColor('#e2e8f0').rect(40, currentY, 515, 50).stroke();
      doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold');
      doc.text('ATTENDANCE RATE:', 55, currentY + 12);
      doc.text('KCPE SCORE:', 55, currentY + 30);
      
      doc.fillColor('#0f172a').font('Helvetica');
      doc.text(`${student.attendancePercentage || student.attendanceRate}%`, 175, currentY + 12);
      doc.text(`${student.kcpeScore} Points`, 175, currentY + 30);
      
      doc.fillColor('#64748b').font('Helvetica-Bold');
      doc.text('TEACHER REMARKS:', 290, currentY + 12);
      doc.fillColor('#0f172a').font('Helvetica');
      doc.text(student.remarks || 'Excellent academic progress. Consistently shows effort.', 410, currentY + 12, { width: 130 });
      
      // Signatures
      currentY += 90;
      doc.strokeColor('#cbd5e1').lineWidth(1);
      doc.moveTo(40, currentY).lineTo(200, currentY).stroke();
      doc.moveTo(350, currentY).lineTo(510, currentY).stroke();
      
      doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold');
      doc.text('CLASS TEACHER SIGNATURE', 40, currentY + 8);
      doc.text('PRINCIPAL SIGNATURE & STAMP', 350, currentY + 8);
      
      doc.end();
    });
  }

  static generateClassSummaryPDF(data: {
    streamName: string;
    room: string;
    teacherName: string;
    averages: any[];
    studentCount: number;
    classAvg: number;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: any) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: any) => reject(err));
      
      // Top bar header decoration
      doc.fillColor('#3525cd').rect(0, 0, 595.28, 90).fill();
      
      // Brand Header
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('IKONEX ACADEMY', 40, 25);
      doc.fontSize(10).font('Helvetica').text('CLASS STREAM PERFORMANCE SUMMARY', 40, 55);
      
      // Information Panel
      doc.fillColor('#ffffff').fontSize(8);
      doc.text(`Room: ${data.room}`, 400, 20, { width: 155, align: 'right' });
      doc.text(`Teacher: ${data.teacherName}`, 400, 32, { width: 155, align: 'right' });
      doc.text(`Students Enrolled: ${data.studentCount}`, 400, 44, { width: 155, align: 'right' });
      doc.text(`Class Cumulative Mean: ${data.classAvg}%`, 400, 56, { width: 155, align: 'right' });
      
      doc.y = 120;
      doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text(`CLASS PERFORMANCE ANALYSIS - ${data.streamName.toUpperCase()}`, 40, 110);
      
      const tableTop = 130;
      doc.fillColor('#f8fafc').rect(40, tableTop, 515, 25).fill();
      doc.strokeColor('#cbd5e1').rect(40, tableTop, 515, 25).stroke();
      
      doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold');
      doc.text('SUBJECT NAME', 60, tableTop + 8);
      doc.text('CLASS MEAN PERCENTAGE', 280, tableTop + 8);
      doc.text('PERFORMANCE RATING', 420, tableTop + 8);
      
      let currentY = tableTop + 25;
      let count = 0;
      doc.fontSize(9).font('Helvetica');
      
      data.averages.forEach((avg) => {
        if (count % 2 === 1) {
          doc.fillColor('#f8fafc').rect(40, currentY, 515, 25).fill();
        }
        doc.strokeColor('#e2e8f0').rect(40, currentY, 515, 25).stroke();
        
        const rawMean = avg['Group Average %'] || avg.average || 0;
        const meanVal = typeof rawMean === 'number' ? rawMean : 75;
        const status = meanVal >= 75 ? 'EXCELLENT' : meanVal >= 55 ? 'STABLE' : 'CRITICAL';
        const statusColor = meanVal >= 75 ? '#047857' : meanVal >= 55 ? '#2563eb' : '#e11d48';
        
        doc.fillColor('#0f172a').text(avg.subject, 60, currentY + 8);
        doc.text(`${meanVal}%`, 280, currentY + 8);
        
        doc.fillColor(statusColor).font('Helvetica-Bold').text(status, 420, currentY + 8);
        doc.font('Helvetica'); // restore
        
        count++;
        currentY += 25;
      });
      
      // Guidelines panel
      currentY += 40;
      doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('ACADEMIC ADMINISTRATIVE COMMENTS', 40, currentY);
      
      currentY += 15;
      doc.strokeColor('#e2e8f0').rect(40, currentY, 515, 75).stroke();
      doc.fillColor('#0f172a').font('Helvetica').fontSize(9);
      doc.text('1. Subject performance averages below 50% must be reviewed during weekly staff meetings.', 55, currentY + 15);
      doc.text('2. Stream target is set to maintain a mean rate above 70% overall.', 55, currentY + 33);
      doc.text('3. Remedial work schedules should be prepared for students below 45% standard mark.', 55, currentY + 51);
      
      doc.end();
    });
  }
}
