import React, { useState, useEffect } from 'react';
import { ExamPackage } from './types/exam';
import { standardPresets } from './data/standardPresets';
import { Header } from './components/Header';
import { MatrixView } from './components/MatrixView';
import { SpecificationView } from './components/SpecificationView';
import { ExamPaperView } from './components/ExamPaperView';
import { GradingGuideView } from './components/GradingGuideView';
import { MathGridGenerator } from './components/MathGridGenerator';
import { ExamConfigModal } from './components/ExamConfigModal';
import { SavedExamsDrawer } from './components/SavedExamsDrawer';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  BookmarkCheck,
  FileText,
  Sliders,
  Info,
} from 'lucide-react';

export default function App() {
  // Current active exam package (Default: Toán Lớp 4 - Giữa HKI as requested)
  const [pkg, setPkg] = useState<ExamPackage>(() => {
    return standardPresets['toan_lop4_gki'];
  });

  const [activeTab, setActiveTab] = useState<'matrix' | 'spec' | 'exam' | 'guide' | 'grid'>('exam');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved exams in localStorage
  const [savedExams, setSavedExams] = useState<ExamPackage[]>(() => {
    try {
      const data = localStorage.getItem('tieu_hoc_saved_exams');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('tieu_hoc_saved_exams', JSON.stringify(savedExams));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedExams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveCurrentExam = () => {
    const existingIdx = savedExams.findIndex((e) => e.id === pkg.id);
    let next: ExamPackage[];
    if (existingIdx >= 0) {
      next = [...savedExams];
      next[existingIdx] = { ...pkg, updatedAt: new Date().toISOString() };
    } else {
      next = [{ ...pkg, updatedAt: new Date().toISOString() }, ...savedExams];
    }
    setSavedExams(next);
    showToast('Đã lưu đề vào ngân hàng cá nhân thành công!');
  };

  const handleDeleteSavedExam = (id: string) => {
    setSavedExams(savedExams.filter((e) => e.id !== id));
    showToast('Đã xóa bộ đề khỏi ngân hàng.');
  };

  const handleQuickSwitch = (key: string) => {
    if (standardPresets[key]) {
      setPkg(standardPresets[key]);
      showToast(`Đã chuyển sang đề mẫu ${standardPresets[key].titleInfo.subject} Lớp ${standardPresets[key].titleInfo.grade}!`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        pkg={pkg}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConfigModal={() => setConfigModalOpen(true)}
        onOpenSavedDrawer={() => setSavedDrawerOpen(true)}
        onSaveCurrentExam={handleSaveCurrentExam}
        savedCount={savedExams.length}
      />

      {/* Quick Subject & Grade Selector Ribbon */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Chọn mẫu nhanh:
            </span>
            <button
              type="button"
              onClick={() => handleQuickSwitch('toan_lop4_gki')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                pkg.id === 'toan_lop4_gki'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              📐 Toán 4 (GKI - Chuẩn 10 câu)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('tiengviet_lop4_gki')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                pkg.id === 'tiengviet_lop4_gki'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              📖 Tiếng Việt 4 (Đọc hiểu 295 chữ + Viết)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('toan_lop1_cki')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                pkg.id === 'toan_lop1_cki'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🔢 Toán 1 (CKI - Lưới ô vuông)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('tinhoc_lop4_cki')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                pkg.id === 'tinhoc_lop4_cki'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              💻 Tin học 4 (LT 6đ - TH 4đ)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('khoahoc_lop4_gki')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                pkg.id === 'khoahoc_lop4_gki'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🌱 Khoa học 4 (Nước & Không khí)
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Click trực tiếp vào bất kì câu hỏi nào để chỉnh sửa nội dung tức thì</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {activeTab === 'matrix' && (
          <MatrixView
            matrix={pkg.matrix}
            grade={pkg.titleInfo.grade}
            subject={pkg.titleInfo.subject}
            semester={pkg.titleInfo.semester}
            onUpdateMatrix={(matrix) => setPkg({ ...pkg, matrix })}
          />
        )}

        {activeTab === 'spec' && (
          <SpecificationView
            specification={pkg.specification}
            grade={pkg.titleInfo.grade}
            subject={pkg.titleInfo.subject}
            semester={pkg.titleInfo.semester}
            onUpdateSpecification={(specification) => setPkg({ ...pkg, specification })}
          />
        )}

        {activeTab === 'exam' && (
          <ExamPaperView
            pkg={pkg}
            onUpdatePkg={setPkg}
          />
        )}

        {activeTab === 'guide' && (
          <GradingGuideView
            answerKeys={pkg.answerKeys}
            grade={pkg.titleInfo.grade}
            subject={pkg.titleInfo.subject}
            semester={pkg.titleInfo.semester}
            onUpdateAnswerKeys={(answerKeys) => setPkg({ ...pkg, answerKeys })}
          />
        )}

        {activeTab === 'grid' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Công Cụ Vẽ Lưới Ô Vuông Độc Lập</h3>
            <p className="text-xs text-slate-500 mb-4">
              Vẽ nhanh lưới ô vuông toán học để chèn vào các bài toán đếm hình, tính chu vi và diện tích ở tiểu học.
            </p>
            <MathGridGenerator
              onApply={(config) => {
                showToast('Đã lưu cấu hình lưới ô vuông!');
                setActiveTab('exam');
              }}
              onCancel={() => setActiveTab('exam')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <b>App Tạo Đề Ma Trận và Đề Kiểm Tra Tiểu Học</b> — Bản quyền sư phạm GDPT 2018 (Thông tư 27/2020/TT-BGDĐT)
          </div>
          <div className="text-slate-400">
            Hỗ trợ đầy đủ Lớp 1 - 5 • Toán, Tiếng Việt, Tin học, Khoa học, LS&ĐL, Công nghệ
          </div>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <ExamConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSelectExam={(newPkg) => {
          setPkg(newPkg);
          showToast(`Đã tải bộ đề ${newPkg.titleInfo.subject} Lớp ${newPkg.titleInfo.grade}!`);
        }}
        currentSchoolDistrict={pkg.titleInfo.district}
        currentSchoolName={pkg.titleInfo.school}
      />

      <SavedExamsDrawer
        isOpen={savedDrawerOpen}
        onClose={() => setSavedDrawerOpen(false)}
        savedExams={savedExams}
        onLoadExam={(loaded) => {
          setPkg(loaded);
          showToast(`Đã mở đề ${loaded.titleInfo.subject} Lớp ${loaded.titleInfo.grade}!`);
        }}
        onDeleteSavedExam={handleDeleteSavedExam}
      />
    </div>
  );
}
