import React, { useState } from 'react';
import {
  GradeLevel,
  SubjectType,
  SemesterType,
  TextbookType,
  ExamPackage,
} from '../types/exam';
import { standardPresets } from '../data/standardPresets';
import { Sparkles, Library, Loader2, BookOpen, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectExam: (pkg: ExamPackage) => void;
  currentSchoolDistrict: string;
  currentSchoolName: string;
}

export const ExamConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectExam,
  currentSchoolDistrict,
  currentSchoolName,
}) => {
  const [tab, setTab] = useState<'presets' | 'ai'>('presets');

  // Form states
  const [district, setDistrict] = useState(currentSchoolDistrict || 'UBND XÃ XÍN MẦN');
  const [school, setSchool] = useState(currentSchoolName || 'TRƯỜNG PTDTBT TH CHÍ CÀ');
  const [grade, setGrade] = useState<GradeLevel>(4);
  const [subject, setSubject] = useState<SubjectType>('Toán');
  const [semester, setSemester] = useState<SemesterType>('Giữa Học kì I');
  const [textbook, setTextbook] = useState<TextbookType>('Kết nối tri thức với cuộc sống');
  const [duration, setDuration] = useState<number>(40);
  const [customTopics, setCustomTopics] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (key: string) => {
    const preset = standardPresets[key];
    if (preset) {
      // Clone and apply current school info
      const cloned: ExamPackage = {
        ...JSON.parse(JSON.stringify(preset)),
        id: `exam_${Date.now()}`,
        titleInfo: {
          ...preset.titleInfo,
          district: district,
          school: school,
        },
      };
      onSelectExam(cloned);
      onClose();
    }
  };

  const handleGenerateAi = async () => {
    setIsLoadingAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolDistrict: district,
          schoolName: school,
          subject,
          grade,
          semester,
          schoolYear: 'NĂM HỌC 2026 - 2027',
          textbook,
          duration,
          customTopics,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Có lỗi xảy ra khi tạo đề bằng AI.');
      }

      const generated = resData.data;

      const formattedPkg: ExamPackage = {
        id: `exam_${Date.now()}`,
        titleInfo: {
          district: generated.titleInfo?.district || district,
          school: generated.titleInfo?.school || school,
          examTitle: generated.titleInfo?.examTitle || `ĐỀ KIỂM TRA ĐỊNH KÌ ${semester.toUpperCase()}`,
          schoolYear: generated.titleInfo?.schoolYear || 'NĂM HỌC 2026 - 2027',
          subject: subject,
          grade: grade,
          semester: semester,
          textbook: textbook,
          duration: duration,
        },
        matrix: generated.matrix || [],
        specification: generated.specification || [],
        questions: (generated.questions || []).map((q: any, i: number) => ({
          ...q,
          number: i + 1,
          pointsText: q.pointsText || `${q.points} điểm`,
        })),
        readingPassage: generated.titleInfo?.readingPassage || generated.readingPassage || undefined,
        writingSection: generated.writingSection || undefined,
        answerKeys: generated.answerKey || generated.answerKeys || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSelectExam(formattedPkg);
      onClose();
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Không thể tạo đề. Bạn có thể chọn các bộ đề mẫu chuẩn có sẵn.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tạo Hoặc Chọn Đề Kiểm Tra Mới</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuẩn GDPT 2018 • Thông tư 27/2020/TT-BGDĐT • Đầy đủ Ma trận, Đặc tả, Đề thi & Hướng dẫn chấm
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 mt-4">
          <button
            type="button"
            onClick={() => setTab('presets')}
            className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
              tab === 'presets'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Library className="w-4 h-4" />
            Kho Đề Chuẩn Bộ GD&ĐT (Có Sẵn)
          </button>
          <button
            type="button"
            onClick={() => setTab('ai')}
            className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
              tab === 'ai'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Tạo Đề Bằng Trí Tuệ Nhân Tạo (Gemini AI)
          </button>
        </div>

        {/* Presets List */}
        {tab === 'presets' && (
          <div className="my-5 space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
              ⭐ <b>Bộ đề chuẩn hóa:</b> Đã được biên soạn chính xác theo ma trận tỉ lệ, bản đặc tả chuẩn từng câu hỏi, tuân thủ nghiêm ngặt quy tắc trình bày văn bản sư phạm tiểu học.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preset 1: Toán Lớp 4 */}
              <div
                onClick={() => handleSelectPreset('toan_lop4_gki')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all bg-white hover:bg-indigo-50/20 group"
              >
                <div className="flex items-start justify-between">
                  <div className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded font-bold text-xs">
                    TOÁN - LỚP 4
                  </div>
                  <span className="text-xs text-slate-400">40 phút</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-2 group-hover:text-indigo-600">
                  Đề kiểm tra Giữa Học kì I (10 câu, 10 điểm)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Số & phép tính (70%), Hình học & đo lường (30%). Trắc nghiệm M1-M2, Tự luận M1-M2-M3.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Trường PTDTBT TH Chí Cà</span>
                  <span>Chọn đề này →</span>
                </div>
              </div>

              {/* Preset 2: Tiếng Việt Lớp 4 */}
              <div
                onClick={() => handleSelectPreset('tiengviet_lop4_gki')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all bg-white hover:bg-indigo-50/20 group"
              >
                <div className="flex items-start justify-between">
                  <div className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                    TIẾNG VIỆT - LỚP 4
                  </div>
                  <span className="text-xs text-slate-400">70 phút</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-2 group-hover:text-indigo-600">
                  Đề kiểm tra Giữa Học kì I (Đọc hiểu & Viết)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Bài đọc "Cây xoài của ông" (295 chữ - đúng chuẩn 280-330 chữ). 11 câu hỏi Đọc hiểu + KTTV, Kèm đề Viết.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Trường PTDTBT TH Chí Cà</span>
                  <span>Chọn đề này →</span>
                </div>
              </div>

              {/* Preset 3: Toán Lớp 1 */}
              <div
                onClick={() => handleSelectPreset('toan_lop1_cki')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all bg-white hover:bg-indigo-50/20 group"
              >
                <div className="flex items-start justify-between">
                  <div className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded font-bold text-xs">
                    TOÁN - LỚP 1
                  </div>
                  <span className="text-xs text-slate-400">35 phút</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-2 group-hover:text-indigo-600">
                  Đề kiểm tra Cuối Học kì I (Có lưới ô vuông)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Trắc nghiệm 3 phương án (A, B, C). Đếm hình trên lưới ô vuông, cộng trừ trong phạm vi 10.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Trường PTDTBT TH Chí Cà</span>
                  <span>Chọn đề này →</span>
                </div>
              </div>

              {/* Preset 4: Tin học Lớp 4 */}
              <div
                onClick={() => handleSelectPreset('tinhoc_lop4_cki')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all bg-white hover:bg-indigo-50/20 group"
              >
                <div className="flex items-start justify-between">
                  <div className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded font-bold text-xs">
                    TIN HỌC - LỚP 4
                  </div>
                  <span className="text-xs text-slate-400">40 phút</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-2 group-hover:text-indigo-600">
                  Đề kiểm tra Cuối Học kì I (Lí thuyết & Thực hành)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  LT 6 điểm - TH 4 điểm (TN 6 câu, TL 2 câu, Thực hành máy tính 2 câu). Không trắc nghiệm ở Mức 3.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Trường PTDTBT TH Chí Cà</span>
                  <span>Chọn đề này →</span>
                </div>
              </div>

              {/* Preset 5: Khoa học Lớp 4 */}
              <div
                onClick={() => handleSelectPreset('khoahoc_lop4_gki')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all bg-white hover:bg-indigo-50/20 group"
              >
                <div className="flex items-start justify-between">
                  <div className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded font-bold text-xs">
                    KHOA HỌC - LỚP 4
                  </div>
                  <span className="text-xs text-slate-400">40 phút</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-2 group-hover:text-indigo-600">
                  Đề kiểm tra Giữa Học kì I (Nước & Không khí)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tỉ lệ 50-30-20%, 10 câu 10 điểm (Trắc nghiệm 60%, Tự luận 40%).
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Trường PTDTBT TH Chí Cà</span>
                  <span>Chọn đề này →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Generator Form */}
        {tab === 'ai' && (
          <div className="my-5 space-y-4">
            {aiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>{aiError}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Huyện/Thị xã/UBND:
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value.toUpperCase())}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="VD: UBND XÃ XÍN MẦN"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Trường Tiểu học:
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value.toUpperCase())}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="VD: TRƯỜNG PTDTBT TH CHÍ CÀ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Môn học:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectType)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="Toán">Toán</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Tin học">Tin học</option>
                  <option value="Khoa học">Khoa học</option>
                  <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
                  <option value="Công nghệ">Công nghệ</option>
                  <option value="Tự nhiên và Xã hội">Tự nhiên và Xã hội</option>
                  <option value="Đạo đức">Đạo đức</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lớp:</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(parseInt(e.target.value) as GradeLevel)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value={1}>Lớp 1 (Trắc nghiệm 3 phương án A, B, C)</option>
                  <option value={2}>Lớp 2 (Trắc nghiệm 3 phương án A, B, C)</option>
                  <option value={3}>Lớp 3 (Trắc nghiệm 3 phương án A, B, C)</option>
                  <option value={4}>Lớp 4 (Trắc nghiệm 4 phương án A, B, C, D)</option>
                  <option value={5}>Lớp 5 (Trắc nghiệm 4 phương án A, B, C, D)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kì kiểm tra:</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as SemesterType)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="Giữa Học kì I">Giữa Học kì I</option>
                  <option value="Cuối Học kì I">Cuối Học kì I</option>
                  <option value="Giữa Học kì II">Giữa Học kì II</option>
                  <option value="Cuối Năm học">Cuối Năm học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bộ sách giáo khoa:</label>
                <select
                  value={textbook}
                  onChange={(e) => setTextbook(e.target.value as TextbookType)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
                  <option value="Cánh Diều">Cánh Diều</option>
                  <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian làm bài:</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 40)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Yêu cầu nội dung trọng tâm / Gợi ý thêm:
                </label>
                <input
                  type="text"
                  value={customTopics}
                  onChange={(e) => setCustomTopics(e.target.value)}
                  placeholder="VD: Nhấn mạnh phép tính cộng trừ có nhớ, hình chữ nhật..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
              💡 <b>Hệ thống tự động áp dụng các quy chuẩn sư phạm:</b>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                <li>Đánh số liên tục từ Câu 1 đến hết, tuyệt đối không tách tiêu đề Trắc nghiệm / Tự luận.</li>
                <li>Xếp Trắc nghiệm M1 trước (NLC → ĐS → NC → ĐK), M2 sau; Tự luận M1 → M2 → M3.</li>
                <li>Mức 3 không có trắc nghiệm. Môn Tiếng Việt có bài đọc chuẩn số từ theo lớp.</li>
              </ul>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={isLoadingAi}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoadingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang thiết kế Ma trận & Đề kiểm tra...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Sinh Bộ Đề Hoàn Chỉnh Bằng AI
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
