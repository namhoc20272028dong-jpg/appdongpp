import React from 'react';
import { ExamPackage } from '../types/exam';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedExams: ExamPackage[];
  onLoadExam: (pkg: ExamPackage) => void;
  onDeleteSavedExam: (id: string) => void;
}

export const SavedExamsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  savedExams,
  onLoadExam,
  onDeleteSavedExam,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Ngân Hàng Đề Của Bạn</h3>
                <p className="text-xs text-slate-500">{savedExams.length} bộ đề đã lưu trong trình duyệt</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-3 overflow-y-auto max-h-[75vh]">
            {savedExams.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Chưa có đề nào được lưu. Bạn có thể nhấn nút "Lưu đề" ở thanh công cụ phía trên!
              </div>
            ) : (
              savedExams.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3.5 border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all bg-slate-50/50 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[11px]">
                        {ex.titleInfo.subject} - Lớp {ex.titleInfo.grade}
                      </span>
                      <span className="text-[11px] text-slate-400">{ex.titleInfo.duration} phút</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mt-1.5">
                      {ex.titleInfo.examTitle}
                    </h4>
                    <p className="text-xs text-slate-500">{ex.titleInfo.school}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-1">
                    <button
                      type="button"
                      onClick={() => onDeleteSavedExam(ex.id)}
                      className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadExam(ex);
                        onClose();
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Mở đề này <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
