import React from 'react';
import { AnswerKeyItem } from '../types/exam';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

interface Props {
  answerKeys: AnswerKeyItem[];
  grade: number;
  subject: string;
  semester: string;
  onUpdateAnswerKeys: (keys: AnswerKeyItem[]) => void;
  isEditable?: boolean;
}

export const GradingGuideView: React.FC<Props> = ({
  answerKeys,
  grade,
  subject,
  semester,
  onUpdateAnswerKeys,
  isEditable = true,
}) => {
  const handleItemChange = (index: number, field: keyof AnswerKeyItem, value: any) => {
    const next = [...answerKeys];
    next[index] = { ...next[index], [field]: value };
    onUpdateAnswerKeys(next);
  };

  const handleAddItem = () => {
    const nextNum = answerKeys.length + 1;
    const newItem: AnswerKeyItem = {
      questionNumber: nextNum,
      format: 'multiple_choice',
      level: 'Mức 1',
      correctAnswer: 'A',
      guide: 'Hướng dẫn giải chi tiết...',
      scoreBreakdown: 'Chọn đúng được 0,5 điểm.',
    };
    onUpdateAnswerKeys([...answerKeys, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    if (answerKeys.length <= 1) return;
    const next = answerKeys.filter((_, i) => i !== index).map((k, idx) => ({
      ...k,
      questionNumber: idx + 1,
    }));
    onUpdateAnswerKeys(next);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN BIỂU ĐIỂM
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Môn: <span className="font-semibold text-slate-700">{subject}</span> — Lớp <span className="font-semibold text-slate-700">{grade}</span> ({semester})
          </p>
        </div>

        <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
          Chi tiết từng 0,25đ / 0,5đ chuẩn Thông tư 27
        </div>
      </div>

      {/* Answer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="p-3 text-center border-r border-slate-200 w-16 font-bold">Câu số</th>
                <th className="p-3 text-center border-r border-slate-200 w-24 font-bold">Mức độ</th>
                <th className="p-3 border-r border-slate-200 w-48 font-bold">Đáp án đúng / Lời giải</th>
                <th className="p-3 border-r border-slate-200 min-w-[260px] font-bold">Hướng dẫn giải chi tiết</th>
                <th className="p-3 border-r border-slate-200 min-w-[200px] font-bold">Biểu điểm thành phần</th>
                {isEditable && <th className="p-3 text-center w-12 font-bold">Xóa</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {answerKeys.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-2.5 text-center font-bold text-slate-800 border-r border-slate-200">
                    Câu {item.questionNumber}
                  </td>

                  <td className="p-2 border-r border-slate-200 text-center font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        item.level === 'Mức 1'
                          ? 'bg-blue-100 text-blue-800'
                          : item.level === 'Mức 2'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.level}
                    </span>
                  </td>

                  {/* Correct Answer */}
                  <td className="p-2 border-r border-slate-200 font-bold text-slate-800">
                    {isEditable ? (
                      <textarea
                        rows={2}
                        value={item.correctAnswer}
                        onChange={(e) => handleItemChange(idx, 'correctAnswer', e.target.value)}
                        className="w-full border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded p-1 resize-none bg-transparent font-bold"
                      />
                    ) : (
                      item.correctAnswer
                    )}
                  </td>

                  {/* Guide */}
                  <td className="p-2 border-r border-slate-200 text-slate-700">
                    {isEditable ? (
                      <textarea
                        rows={3}
                        value={item.guide}
                        onChange={(e) => handleItemChange(idx, 'guide', e.target.value)}
                        className="w-full border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded p-1 resize-y bg-transparent"
                      />
                    ) : (
                      <div className="whitespace-pre-line">{item.guide}</div>
                    )}
                  </td>

                  {/* Score breakdown */}
                  <td className="p-2 border-r border-slate-200 text-slate-800">
                    {isEditable ? (
                      <textarea
                        rows={3}
                        value={item.scoreBreakdown}
                        onChange={(e) => handleItemChange(idx, 'scoreBreakdown', e.target.value)}
                        className="w-full border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded p-1 resize-y bg-transparent"
                      />
                    ) : (
                      <div className="whitespace-pre-line">{item.scoreBreakdown}</div>
                    )}
                  </td>

                  {isEditable && (
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        disabled={answerKeys.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isEditable && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm câu đáp án
            </button>
            <div className="text-xs text-slate-500 italic">
              * Tự động xuất đầy đủ khi tải file Word hoặc in ấn
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
