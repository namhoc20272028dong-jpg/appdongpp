import { ExamPackage } from '../types/exam';

export function exportExamToWord(pkg: ExamPackage, section: 'all' | 'exam' | 'matrix' | 'spec' | 'guide' = 'all') {
  const { titleInfo, matrix, specification, questions, readingPassage, writingSection, answerKeys } = pkg;

  // Word XML header with Times New Roman & Page Setup
  const headerHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${titleInfo.examTitle} - ${titleInfo.subject} Lớp ${titleInfo.grade}</title>
      <style>
        @page Section1 {
          size: 21.0cm 29.7cm; /* A4 */
          margin: 2.0cm 1.5cm 2.0cm 2.5cm; /* TCVN: Trên 2cm, Dưới 2cm, Phải 1.5cm, Trái 2.5cm */
          mso-header-margin: 36.0pt;
          mso-footer-margin: 36.0pt;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 13pt;
          line-height: 1.35;
          color: #000;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 10pt 0;
        }
        th, td {
          border: 1px solid #000;
          padding: 5pt 6pt;
          font-size: 12pt;
          vertical-align: middle;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
        }
        .header-table td {
          border: none !important;
          padding: 2pt 4pt;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-italic { font-style: italic; }
        .indent { margin-left: 28pt; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <div class="Section1">
  `;

  let contentHtml = '';

  // 1. MA TRẬN
  if (section === 'all' || section === 'matrix') {
    let totalScore = matrix.reduce((sum, r) => sum + r.total_points, 0);
    let totalQuestions = matrix.reduce((sum, r) => sum + r.total_count, 0);

    contentHtml += `
      <div class="text-center font-bold" style="font-size: 14pt; margin-bottom: 4pt;">
        KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ
      </div>
      <div class="text-center font-bold" style="font-size: 13pt; margin-bottom: 12pt;">
        MÔN: ${titleInfo.subject.toUpperCase()} - LỚP ${titleInfo.grade} (${titleInfo.examTitle.toUpperCase()})
      </div>

      <table>
        <thead>
          <tr>
            <th rowspan="3" style="width: 28%;">Chủ đề / Mạch kiến thức</th>
            <th colspan="4">Mức 1 (Biết)</th>
            <th colspan="4">Mức 2 (Hiểu)</th>
            <th colspan="2">Mức 3 (Vận dụng)</th>
            <th rowspan="3" style="width: 8%;">Tổng câu</th>
            <th rowspan="3" style="width: 8%;">Tổng điểm</th>
            <th rowspan="3" style="width: 6%;">Tỉ lệ %</th>
          </tr>
          <tr>
            <th colspan="2">TN</th>
            <th colspan="2">TL</th>
            <th colspan="2">TN</th>
            <th colspan="2">TL</th>
            <th colspan="2">TL (Không có TN)</th>
          </tr>
          <tr>
            <th>Số câu</th>
            <th>Điểm</th>
            <th>Số câu</th>
            <th>Điểm</th>
            <th>Số câu</th>
            <th>Điểm</th>
            <th>Số câu</th>
            <th>Điểm</th>
            <th>Số câu</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody>
          ${matrix.map(r => `
            <tr>
              <td>${r.topic}</td>
              <td class="text-center">${r.m1_tn_count || '-'}</td>
              <td class="text-center">${r.m1_tn_points ? r.m1_tn_points.toFixed(1).replace('.', ',') : '-'}</td>
              <td class="text-center">${r.m1_tl_count || '-'}</td>
              <td class="text-center">${r.m1_tl_points ? r.m1_tl_points.toFixed(1).replace('.', ',') : '-'}</td>
              <td class="text-center">${r.m2_tn_count || '-'}</td>
              <td class="text-center">${r.m2_tn_points ? r.m2_tn_points.toFixed(1).replace('.', ',') : '-'}</td>
              <td class="text-center">${r.m2_tl_count || '-'}</td>
              <td class="text-center">${r.m2_tl_points ? r.m2_tl_points.toFixed(1).replace('.', ',') : '-'}</td>
              <td class="text-center">${r.m3_tl_count || '-'}</td>
              <td class="text-center">${r.m3_tl_points ? r.m3_tl_points.toFixed(1).replace('.', ',') : '-'}</td>
              <td class="text-center font-bold">${r.total_count}</td>
              <td class="text-center font-bold">${r.total_points.toFixed(1).replace('.', ',')}</td>
              <td class="text-center">${r.percentage}%</td>
            </tr>
          `).join('')}
          <tr style="background-color: #fafafa; font-weight: bold;">
            <td>TỔNG CỘNG</td>
            <td class="text-center" colspan="4">${matrix.reduce((s, r) => s + r.m1_tn_points + r.m1_tl_points, 0).toFixed(1).replace('.', ',')} điểm</td>
            <td class="text-center" colspan="4">${matrix.reduce((s, r) => s + r.m2_tn_points + r.m2_tl_points, 0).toFixed(1).replace('.', ',')} điểm</td>
            <td class="text-center" colspan="2">${matrix.reduce((s, r) => s + r.m3_tl_points, 0).toFixed(1).replace('.', ',')} điểm</td>
            <td class="text-center">${totalQuestions}</td>
            <td class="text-center">${totalScore.toFixed(1).replace('.', ',')}</td>
            <td class="text-center">100%</td>
          </tr>
        </tbody>
      </table>
      <div style="font-size: 11pt; font-style: italic; margin-bottom: 20pt;">
        * Ghi chú: Định hướng phân bố theo Thông tư 27/2020/TT-BGDĐT: Mức 1 (~50%), Mức 2 (~30%), Mức 3 (~20%). Tuyệt đối không kiểm tra trắc nghiệm ở Mức 3 (Vận dụng).
      </div>
    `;
  }

  // 2. BẢNG ĐẶC TẢ
  if (section === 'all' || section === 'spec') {
    if (section === 'all') contentHtml += `<div class="page-break"></div>`;
    contentHtml += `
      <div class="text-center font-bold" style="font-size: 14pt; margin-bottom: 4pt;">
        BẢNG ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ
      </div>
      <div class="text-center font-bold" style="font-size: 13pt; margin-bottom: 12pt;">
        MÔN: ${titleInfo.subject.toUpperCase()} - LỚP ${titleInfo.grade} (${titleInfo.examTitle.toUpperCase()})
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 5%;">STT</th>
            <th style="width: 18%;">Chủ đề / Mạch nội dung</th>
            <th style="width: 22%;">Đơn vị kiến thức / Kĩ năng</th>
            <th style="width: 10%;">Mức độ</th>
            <th style="width: 28%;">Yêu cầu cần đạt</th>
            <th style="width: 10%;">Hình thức</th>
            <th style="width: 7%;">Câu số</th>
          </tr>
        </thead>
        <tbody>
          ${specification.map(s => `
            <tr>
              <td class="text-center">${s.stt}</td>
              <td>${s.topic}</td>
              <td>${s.content}</td>
              <td class="text-center font-bold">${s.level}</td>
              <td>${s.competence}</td>
              <td class="text-center">${s.formatLabel || s.format}</td>
              <td class="text-center font-bold">${s.questionNumber}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 3. ĐỀ KIỂM TRA
  if (section === 'all' || section === 'exam') {
    if (section === 'all') contentHtml += `<div class="page-break"></div>`;

    contentHtml += `
      <table class="header-table" style="margin-bottom: 8pt;">
        <tr>
          <td style="width: 45%; vertical-align: top; text-align: center;">
            <div style="font-size: 12pt; text-transform: uppercase;">${titleInfo.district}</div>
            <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">${titleInfo.school}</div>
          </td>
          <td style="width: 55%; vertical-align: top; text-align: center;">
            <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">${titleInfo.examTitle}</div>
            <div style="font-size: 12pt;">${titleInfo.schoolYear}</div>
            <div style="font-size: 12pt; font-weight: bold;">MÔN: ${titleInfo.subject.toUpperCase()} - LỚP ${titleInfo.grade}</div>
            <div style="font-size: 11pt; font-style: italic;">(Thời gian làm bài: ${titleInfo.duration} phút)</div>
          </td>
        </tr>
      </table>

      <table style="margin-bottom: 15pt;">
        <tr>
          <td style="width: 45%;">
            <div><b>Họ và tên học sinh:</b> ....................................................</div>
            <div style="margin-top: 4pt;"><b>Lớp:</b> ${titleInfo.grade}..... Trường: ................................................</div>
          </td>
          <td style="width: 25%; text-align: center;">
            <div><b>ĐIỂM</b></div>
            <div style="height: 30pt;"></div>
          </td>
          <td style="width: 30%; text-align: center;">
            <div><b>NHẬN XÉT CỦA GIÁO VIÊN</b></div>
            <div style="height: 30pt;"></div>
          </td>
        </tr>
      </table>
    `;

    // Nếu môn Tiếng Việt có bài đọc hiểu
    if (readingPassage) {
      contentHtml += `
        <div style="margin-bottom: 12pt; border: 1px dashed #666; padding: 8pt; background-color: #fafafa;">
          <div class="text-center font-bold" style="font-size: 13pt;">${readingPassage.title.toUpperCase()}</div>
          ${readingPassage.author ? `<div class="text-right font-italic" style="font-size: 11pt; margin-bottom: 6pt;">${readingPassage.author}</div>` : ''}
          <div style="text-align: justify; text-indent: 20pt; line-height: 1.4;">
            ${readingPassage.content.replace(/\n\n/g, '<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\n/g, '<br/>')}
          </div>
          <div style="font-size: 10pt; font-style: italic; color: #555; margin-top: 6pt; text-align: right;">
            (Số lượng chữ: ${readingPassage.wordCount} chữ - ${readingPassage.targetRangeText})
          </div>
        </div>
        <div style="font-style: italic; margin-bottom: 8pt; font-weight: bold;">
          Dựa vào nội dung bài đọc trên, em hãy thực hiện các yêu cầu dưới đây:
        </div>
      `;
    }

    // Danh sách câu hỏi tuân thủ nghiêm ngặt nguyên tắc
    questions.forEach((q) => {
      contentHtml += `
        <div style="margin-bottom: 10pt; page-break-inside: avoid;">
          <div>
            <b>Câu ${q.number}</b> <i style="font-weight: normal;">(${q.pointsText || `${q.points} điểm`}):</i> ${q.content.replace(/\n/g, '<br/>')}
          </div>
      `;

      // Phương án TN
      if (q.options && q.options.length > 0) {
        contentHtml += `<div class="indent" style="margin-top: 4pt;">`;
        q.options.forEach(opt => {
          contentHtml += `<div style="margin-bottom: 3pt;">${opt}</div>`;
        });
        contentHtml += `</div>`;
      }

      // Đúng sai
      if (q.tfItems && q.tfItems.length > 0) {
        contentHtml += `<div class="indent" style="margin-top: 4pt;">`;
        q.tfItems.forEach(item => {
          contentHtml += `<div style="margin-bottom: 3pt;">${item}</div>`;
        });
        contentHtml += `</div>`;
      }

      // Nối cột
      if (q.matchingPairs) {
        contentHtml += `
          <table style="width: 90%; margin: 6pt auto; border: 1px solid #999;">
            <tr>
              <th style="width: 50%;">Cột A</th>
              <th style="width: 50%;">Cột B</th>
            </tr>
            ${q.matchingPairs.colA.map((itemA, i) => `
              <tr>
                <td>${itemA}</td>
                <td>${q.matchingPairs?.colB[i] || ''}</td>
              </tr>
            `).join('')}
          </table>
        `;
      }

      // Tự luận để dòng kẻ trống cho học sinh làm bài
      if (q.format === 'essay') {
        contentHtml += `
          <div style="margin-top: 6pt; color: #888; font-size: 11pt;">
            <i>Bài làm:</i>
            <div style="border-bottom: 1px dotted #aaa; height: 18pt;"></div>
            <div style="border-bottom: 1px dotted #aaa; height: 18pt;"></div>
            ${q.points >= 1.5 ? `<div style="border-bottom: 1px dotted #aaa; height: 18pt;"></div><div style="border-bottom: 1px dotted #aaa; height: 18pt;"></div>` : ''}
          </div>
        `;
      }

      contentHtml += `</div>`;
    });

    // Phần Viết của môn Tiếng Việt
    if (writingSection) {
      contentHtml += `
        <div style="margin-top: 15pt; border-top: 2px solid #000; padding-top: 10pt;">
          <div class="font-bold" style="font-size: 13pt; text-transform: uppercase;">B. KIỂM TRA VIẾT (10 điểm)</div>
          ${writingSection.dictationTitle ? `
            <div style="margin-top: 6pt;">
              <b>1. Chính tả (Nghe - viết)</b> <i>(${writingSection.dictationPoints || 4} điểm):</i>
              <div class="text-center font-bold" style="margin: 4pt 0;">${writingSection.dictationTitle}</div>
              <div style="font-style: italic; margin-left: 20pt;">
                ${writingSection.dictationContent?.replace(/\n/g, '<br/>') || ''}
              </div>
            </div>
          ` : ''}
          ${writingSection.essayPrompt ? `
            <div style="margin-top: 8pt;">
              <b>2. Tập làm văn</b> <i>(${writingSection.essayPoints || 6} điểm):</i>
              <div style="margin-left: 10pt; margin-top: 4pt;">
                ${writingSection.essayPrompt.replace(/\n/g, '<br/>')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }
  }

  // 4. HƯỚNG DẪN CHẤM
  if (section === 'all' || section === 'guide') {
    if (section === 'all') contentHtml += `<div class="page-break"></div>`;

    contentHtml += `
      <div class="text-center font-bold" style="font-size: 14pt; margin-bottom: 4pt;">
        HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM CHI TIẾT
      </div>
      <div class="text-center font-bold" style="font-size: 13pt; margin-bottom: 12pt;">
        MÔN: ${titleInfo.subject.toUpperCase()} - LỚP ${titleInfo.grade} (${titleInfo.examTitle.toUpperCase()})
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 10%;">Câu số</th>
            <th style="width: 15%;">Mức độ</th>
            <th style="width: 25%;">Đáp án / Lời giải</th>
            <th style="width: 35%;">Hướng dẫn chi tiết</th>
            <th style="width: 15%;">Biểu điểm</th>
          </tr>
        </thead>
        <tbody>
          ${answerKeys.map(a => `
            <tr>
              <td class="text-center font-bold">Câu ${a.questionNumber}</td>
              <td class="text-center">${a.level}</td>
              <td><b>${a.correctAnswer}</b></td>
              <td>${a.guide.replace(/\n/g, '<br/>')}</td>
              <td>${a.scoreBreakdown.replace(/\n/g, '<br/>')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const footerHtml = `
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + headerHtml + contentHtml + footerHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `De_Kiem_Tra_${titleInfo.subject}_Lop_${titleInfo.grade}_${titleInfo.semester.replace(/\s+/g, '_')}.doc`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
