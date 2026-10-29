import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// API generate full exam package via Gemini
app.post('/api/exam/generate', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Bạn có thể sử dụng các bộ đề mẫu chuẩn sẵn có hoặc bổ sung API key trong Secrets panel.',
      });
    }

    const {
      schoolDistrict,
      schoolName,
      subject,
      grade,
      semester,
      schoolYear,
      textbook,
      duration,
      customTopics,
    } = req.body;

    const systemInstruction = `Bạn là một Chuyên gia ra đề kiểm tra tiểu học hàng đầu Việt Nam, am hiểu sâu sắc Chương trình GDPT 2018 và Thông tư 27/2020/TT-BGDĐT.
Nhiệm vụ của bạn là tạo ra một BỘ HỒ SƠ KIỂM TRA ĐỊNH KÌ TIỂU HỌC HOÀN CHỈNH gồm 4 phần:
1. KHUNG MA TRẬN ĐỀ KIỂM TRA
2. BẢNG ĐẶC TẢ ĐỀ KIỂM TRA
3. ĐỀ KIỂM TRA
4. HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN BIỂU ĐIỂM

CÁC NGUYÊN TẮC CỐT LÕI BẮT BUỘC (KHÔNG ĐƯỢC VI PHẠM):
1. Cấu trúc đề kiểm tra:
- Thứ tự câu: Đánh số từ Câu 1 đến câu cuối cùng (ví dụ Câu 10 hoặc Câu 11), KHÔNG tách thành "Phần I: Trắc nghiệm", "Phần II: Tự luận".
- TUYỆT ĐỐI KHÔNG ghi cụm từ "Phần trắc nghiệm", "Phần tự luận" làm tiêu đề phân mục trong đề kiểm tra.
- Các câu hỏi sắp xếp thứ tự: Trắc nghiệm trước, Tự luận sau.
- Trắc nghiệm: Mức 1 (M1) xếp trước – Mức 2 (M2) xếp sau. Cụ thể:
  + M1: Biết nhiều lựa chọn (NLC) -> Biết đúng sai (ĐS) -> Biết nối cột (NC) -> Biết điền khuyết (ĐK)
  + M2: Hiểu nhiều lựa chọn (NLC) -> Hiểu đúng sai (ĐS) -> Hiểu nối cột (NC) -> Hiểu điền khuyết (ĐK)
- Tự luận: Lần lượt từ Mức 1 (Biết) -> Mức 2 (Hiểu) -> Mức 3 (Vận dụng) (Học sinh tư duy từ dễ đến khó).
- Không ghép câu thuộc 2 chủ đề/bài học/mạch kiến thức với nhau.
- TUYỆT ĐỐI KHÔNG TẠO CÂU TRẮC NGHIỆM Ở MỨC VẬN DỤNG (Mức 3 hoàn toàn là tự luận).
- Lớp 1, 2, 3: Trắc nghiệm nhiều lựa chọn CHỈ CÓ 3 phương án (A, B, C).
- Lớp 4, 5: Trắc nghiệm nhiều lựa chọn có 4 phương án (A, B, C, D).
- Định dạng câu hỏi: Câu số in đậm, điểm in nghiêng không đậm liền câu số, câu hỏi không đậm. Ví dụ: "Câu 1 (0,5 điểm): ..."
- Tổng số câu: Thông thường 10 câu (Toán: 7 câu TN = 7 điểm hoặc 6 câu TN = 3-4 điểm tùy phân bổ; Tiếng Việt Đọc hiểu: Lớp 1: 7 câu; Lớp 2-3: 9 câu; Lớp 4-5: 11 câu).
- Đối với môn Tiếng Việt: Cung cấp bài đọc hiểu ngoài chương trình với độ dài từ đúng quy định:
  + Lớp 1: 90-130 chữ (thơ 50-70 chữ)
  + Lớp 2: 180-200 chữ (thơ 70-90 chữ)
  + Lớp 3: 200-250 chữ (thơ 80-100 chữ)
  + Lớp 4: 280-330 chữ (thơ 100-120 chữ)
  + Lớp 5: 300-350 chữ (thơ 110-130 chữ)
  Kèm đề Viết đầy đủ (chính tả / nghe viết / tập làm văn).

Hãy trả về phản hồi theo định dạng JSON CHUẨN XÁC theo cấu trúc yêu cầu.`;

    const userPrompt = `Hãy tạo một bộ đề kiểm tra hoàn chỉnh với các thông số:
- Tỉnh/Huyện/Xã: ${schoolDistrict || 'UBND XÃ XÍN MẦN'}
- Trường: ${schoolName || 'TRƯỜNG PTDTBT TH CHÍ CÀ'}
- Môn học: ${subject || 'Toán'}
- Lớp: ${grade || '4'}
- Kì kiểm tra: ${semester || 'Giữa Học kì I'}
- Năm học: ${schoolYear || '2026 - 2027'}
- Bộ sách: ${textbook || 'Kết nối tri thức với cuộc sống'}
- Thời gian làm bài: ${duration || '40'} phút
- Yêu cầu trọng tâm/Chủ đề đặc biệt: ${customTopics || 'Chuẩn chương trình GDPT 2018 theo thời điểm kiểm tra'}

Hãy trả về một JSON Object chứa:
{
  "titleInfo": {
    "district": "UBND XÃ XÍN MẦN",
    "school": "TRƯỜNG PTDTBT TH CHÍ CÀ",
    "examTitle": "ĐỀ KIỂM TRA ĐỊNH KÌ GIỮA HỌC KÌ I",
    "schoolYear": "NĂM HỌC 2026 - 2027",
    "subject": "TOÁN",
    "grade": 4,
    "duration": 40,
    "readingPassage": { "title": "...", "content": "...", "author": "...", "wordCount": 290 } // nếu là Tiếng Việt
  },
  "matrix": [
    {
      "topic": "Số và phép tính",
      "m1_tn_count": 2, "m1_tn_points": 1.0,
      "m1_tl_count": 0, "m1_tl_points": 0,
      "m2_tn_count": 2, "m2_tn_points": 1.0,
      "m2_tl_count": 1, "m2_tl_points": 1.0,
      "m3_tn_count": 0, "m3_tn_points": 0,
      "m3_tl_count": 1, "m3_tl_points": 2.0,
      "total_count": 6, "total_points": 5.0, "percentage": 50
    }
  ],
  "specification": [
    {
      "stt": 1,
      "topic": "Số và phép tính",
      "content": "Số có nhiều chữ số",
      "level": "Mức 1",
      "competence": "Nhận biết được hàng và lớp của số có 6 chữ số.",
      "questionType": "TN nhiều lựa chọn",
      "questionNumber": "Câu 1",
      "points": 0.5
    }
  ],
  "questions": [
    {
      "id": 1,
      "number": 1,
      "points": 0.5,
      "pointsText": "0,5 điểm",
      "type": "multiple_choice", // "multiple_choice" | "true_false" | "matching" | "fill_blank" | "essay" | "practical"
      "level": "Mức 1",
      "topic": "Số và phép tính",
      "content": "Chữ số 7 trong số 875 321 thuộc hàng nào?",
      "options": ["A. Hàng trăm", "B. Hàng chục nghìn", "C. Hàng trăm nghìn", "D. Hàng triệu"], // Lớp 1-3 có 3 options, Lớp 4-5 có 4 options
      "matchingPairs": null, // [{left: "A. ...", right: "1. ..."}] nếu type là matching
      "tfItems": null, // ["a) ...", "b) ..."] nếu type là true_false
      "gridData": null // hoặc thông tin vẽ lưới ô vuông nếu là hình học
    }
  ],
  "answerKey": [
    {
      "questionNumber": 1,
      "type": "multiple_choice",
      "correctAnswer": "B",
      "guide": "Chữ số 7 đứng ở vị trí hàng chục nghìn, có giá trị là 70 000.",
      "scoreBreakdown": "0,5 điểm: Chọn đúng phương án B. Sai hoặc chọn phương án khác: 0 điểm."
    }
  ],
  "writingSection": null // Dành riêng cho Tiếng Việt: { readingAloud: "...", dictation: "...", essayPrompt: "..." }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Không nhận được nội dung từ Gemini API');
    }

    const examData = JSON.parse(text);
    return res.json({ success: true, data: examData });
  } catch (error: any) {
    console.error('Error generating exam:', error);
    return res.status(500).json({
      error: error.message || 'Lỗi khi tạo đề kiểm tra bằng AI',
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
