/**
 * Types for Vietnamese Elementary School Exam Generator
 * Chuẩn Chương trình GDPT 2018 & Thông tư 27/2020/TT-BGDĐT
 */

export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export type SubjectType =
  | 'Toán'
  | 'Tiếng Việt'
  | 'Tin học'
  | 'Khoa học'
  | 'Lịch sử và Địa lí'
  | 'Công nghệ'
  | 'Tự nhiên và Xã hội'
  | 'Đạo đức';

export type SemesterType =
  | 'Giữa Học kì I'
  | 'Cuối Học kì I'
  | 'Giữa Học kì II'
  | 'Cuối Năm học';

export type TextbookType =
  | 'Kết nối tri thức với cuộc sống'
  | 'Cánh Diều'
  | 'Chân trời sáng tạo';

export type QuestionLevel = 'Mức 1' | 'Mức 2' | 'Mức 3'; // Biết, Hiểu, Vận dụng

export type QuestionFormat =
  | 'multiple_choice' // Trắc nghiệm nhiều lựa chọn (NLC)
  | 'true_false'       // Trắc nghiệm đúng sai (ĐS)
  | 'matching'         // Trắc nghiệm nối cột (NC)
  | 'fill_blank'       // Trắc nghiệm điền khuyết (ĐK)
  | 'essay'            // Tự luận (TL)
  | 'practical';       // Thực hành (TH môn Tin học)

export interface OptionItem {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface TrueFalseItem {
  statement: string;
  isCorrect: boolean;
}

export interface MathGridConfig {
  rows: number;
  cols: number;
  cellSize: number;
  shapeType?: 'rectangle' | 'triangle' | 'polygon' | 'count_squares' | 'line';
  shapeData?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: { x: number; y: number }[];
    label?: string;
  };
}

export interface ExamQuestion {
  id: string | number;
  number: number; // 1, 2, 3...
  points: number; // e.g. 0.5, 1.0, 2.0
  pointsText?: string; // e.g. "0,5 điểm"
  format: QuestionFormat;
  level: QuestionLevel;
  topic: string;
  competenceRequirement?: string; // Yêu cầu cần đạt
  content: string; // Câu hỏi (không in đậm)
  options?: string[]; // A, B, C (lớp 1-3) hoặc A, B, C, D (lớp 4-5)
  matchingPairs?: { colA: string[]; colB: string[] };
  tfItems?: string[]; // ['a) ...', 'b) ...']
  fillBlankText?: string;
  gridConfig?: MathGridConfig;
  practicalRequirement?: string; // Cho môn Tin học
  imageUrl?: string;
}

export interface MatrixRow {
  id: string;
  topic: string; // Mạch kiến thức / Chủ đề
  // Mức 1 (Biết)
  m1_tn_count: number;
  m1_tn_points: number;
  m1_tl_count: number;
  m1_tl_points: number;
  // Mức 2 (Hiểu)
  m2_tn_count: number;
  m2_tn_points: number;
  m2_tl_count: number;
  m2_tl_points: number;
  // Mức 3 (Vận dụng) - KHÔNG CÓ TRẮC NGHIỆM
  m3_tn_count: 0;
  m3_tn_points: 0;
  m3_tl_count: number;
  m3_tl_points: number;
  // Tổng cộng
  total_count: number;
  total_points: number;
  percentage: number;
}

export interface SpecificationItem {
  id: string | number;
  stt: number;
  topic: string; // Chủ đề / Mạch nội dung
  content: string; // Đơn vị kiến thức / Kĩ năng
  level: QuestionLevel; // Mức 1, 2, 3
  competence: string; // Yêu cầu cần đạt
  format: QuestionFormat;
  formatLabel: string; // "TN nhiều lựa chọn", "TN Đúng sai", "Tự luận"...
  questionNumber: string; // "Câu 1", "Câu 2"...
  points: number;
}

export interface AnswerKeyItem {
  questionNumber: number;
  format: QuestionFormat;
  level: QuestionLevel;
  correctAnswer: string; // "A" hoặc lời giải chi tiết
  guide: string; // Hướng dẫn giải / tiêu chí
  scoreBreakdown: string; // Thang điểm chi tiết từng 0,25đ / 0,5đ
}

export interface ReadingPassage {
  title: string;
  author?: string;
  content: string;
  wordCount: number;
  targetRangeText: string; // ví dụ: "280 – 330 chữ"
  genre?: 'Truyện' | 'Miêu tả' | 'Thơ' | 'Văn bản thông tin';
}

export interface WritingSection {
  readingAloudPoints?: number; // Đọc thành tiếng
  readingAloudGuide?: string;
  dictationTitle?: string; // Nghe - viết
  dictationContent?: string;
  dictationPoints?: number;
  essayPrompt?: string; // Đề Tập làm văn / Viết đoạn văn
  essayPoints?: number;
  rubricGuide?: string[];
}

export interface PracticalSection {
  title: string;
  totalPoints: number;
  requirements: string[];
  rubric: { step: string; point: number }[];
}

export interface ExamPackage {
  id: string;
  titleInfo: {
    district: string; // ví dụ: "UBND XÃ XÍN MẦN"
    school: string;   // ví dụ: "TRƯỜNG PTDTBT TH CHÍ CÀ"
    examTitle: string; // "ĐỀ KIỂM TRA ĐỊNH KÌ GIỮA HỌC KÌ I"
    schoolYear: string; // "NĂM HỌC 2026 - 2027"
    subject: SubjectType;
    grade: GradeLevel;
    semester: SemesterType;
    textbook: TextbookType;
    duration: number; // 40 phút, 70 phút...
  };
  matrix: MatrixRow[];
  specification: SpecificationItem[];
  questions: ExamQuestion[];
  readingPassage?: ReadingPassage;
  writingSection?: WritingSection;
  practicalSection?: PracticalSection;
  answerKeys: AnswerKeyItem[];
  createdAt?: string;
  updatedAt?: string;
}
