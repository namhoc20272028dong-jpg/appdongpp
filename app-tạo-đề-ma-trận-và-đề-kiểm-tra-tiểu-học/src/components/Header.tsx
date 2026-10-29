import React, { useState } from 'react';
import { ExamPackage } from '../types/exam';
import { exportExamToWord } from '../utils/exportWord';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  Bookmark,
  Sparkles,
  Grid,
  FileSpreadsheet,
  CheckSquare,
  LayoutGrid,
} from 'lucide-react';

interface Props {
  pkg: ExamPackage;
  activeTab: 'matrix' | 'spec' | 'exam' | 'guide' | 'grid';
  setActiveTab: (tab: 'matrix' | 'spec' | 'exam' | 'guide' | 'grid') => void;
  onOpenConfigModal: () => void;
  onOpenSavedDrawer: () => void;
  onSaveCurrentExam: () => void;
  savedCount: number;
}

export const Header: React.FC<Props> = ({
  pkg,
  activeTab,
  setActiveTab,
  onOpenConfigModal,
  onOpenSavedDrawer,
  onSaveCurrentExam,
  savedCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let fullText = `${pkg.titleInfo.district}\n${pkg.titleInfo.school}\n${pkg.titleInfo.examTitle}\n${pkg.titleInfo.schoolYear}\nMÔN: ${pkg.titleInfo.subject} - LỚP ${pkg.titleInfo.grade}\nThời gian: ${pkg.titleInfo.duration} phút\n\n`;

    if (pkg.readingPassage) {
      fullText += `--- BÀI ĐỌC HIỂU ---\n${pkg.readingPassage.title}\n${pkg.readingPassage.content}\n\n`;
    }

    pkg.questions.forEach((q) => {
      fullText += `Câu ${q.number} (${q.pointsText || `${q.points} điểm`}): ${q.content}\n`;
      if (q.options) {
        q.options.forEach((opt) => (fullText += `    ${opt}\n`));
      }
      if (q.tfItems) {
        q.tfItems.forEach((item) => (fullText += `    ${item}\n`));
      }
      fullText += `\n`;
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm print:hidden">
      {/* Top Brand & Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md font-bold text-lg">
            TH
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight flex items-center gap-2">
              APP TẠO ĐỀ MA TRẬN VÀ ĐỀ KIỂM TRA TIỂU HỌC
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] bg-emerald-100 text-emerald-800 rounded font-semibold">
                GDPT 2018
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Chuyên gia ma trận 2 chiều, đặc tả chuẩn Thông tư 27 & đề thi định kì Lớp 1 - 5
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* New / Change Exam */}
          <button
            type="button"
            onClick={onOpenConfigModal}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Tạo / Đổi Đề Mới
          </button>

          {/* Export to Word with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Xuất Word (.doc) ▾
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 shadow-xl rounded-xl p-1 z-50 text-xs font-medium divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    exportExamToWord(pkg, 'all');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-slate-800 font-bold flex items-center justify-between"
                >
                  <span>Xuất trọn bộ 4 phần</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Khuyên dùng</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportExamToWord(pkg, 'exam');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-slate-700"
                >
                  Chỉ xuất Đề kiểm tra
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportExamToWord(pkg, 'matrix');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-slate-700"
                >
                  Chỉ xuất Khung Ma trận
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportExamToWord(pkg, 'spec');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-slate-700"
                >
                  Chỉ xuất Bản đặc tả
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportExamToWord(pkg, 'guide');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-slate-700"
                >
                  Chỉ xuất Hướng dẫn chấm
                </button>
              </div>
            )}
          </div>

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="In ấn trực tiếp khổ giấy A4 chuẩn"
          >
            <Printer className="w-3.5 h-3.5" /> In A4 / PDF
          </button>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Đã sao chép!' : 'Sao chép'}
          </button>

          {/* Save to Bank */}
          <button
            type="button"
            onClick={onSaveCurrentExam}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" /> Lưu Đề
          </button>

          {/* Open Saved Drawer */}
          <button
            type="button"
            onClick={onOpenSavedDrawer}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative"
            title="Ngân hàng đề đã lưu"
          >
            <LayoutGrid className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50/80 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-1 py-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'matrix'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              1. Khung Ma Trận
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('spec')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'spec'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              2. Bản Đặc Tả
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exam')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'exam'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              3. Đề Kiểm Tra (A4)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'guide'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
              4. Hướng Dẫn Chấm & Biểu Điểm
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'grid'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-amber-600" />
              Lưới Ô Vuông Toán Học
            </button>
          </div>

          {/* Quick Active Exam Summary */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-700">{pkg.titleInfo.subject}</span>
            <span>•</span>
            <span>Lớp {pkg.titleInfo.grade}</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">{pkg.titleInfo.semester}</span>
            <span>•</span>
            <span>{pkg.titleInfo.school}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
