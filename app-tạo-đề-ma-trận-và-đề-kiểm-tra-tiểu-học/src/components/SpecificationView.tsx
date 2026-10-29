import React from 'react';
import { SpecificationItem, QuestionLevel, QuestionFormat } from '../types/exam';
import { Plus, Trash2, FileSpreadsheet } from 'lucide-react';

interface Props {
  specification: SpecificationItem[];
  grade: number;
  subject: string;
  semester: string;
  onUpdateSpecification: (spec: SpecificationItem[]) => void;
  isEditable?: boolean;
}

export const SpecificationView: React.FC<Props> = ({
  specification,
  grade,
  subject,
  semester,
  onUpdateSpecification,
  isEditable = true,
}) => {
  const handleItemChange = (index: number, field: keyof SpecificationItem, value: any) => {
    const next = [...specification];
    next[index] = { ...next[index], [field]: value };
    onUpdateSpecification(next);
  };

  const handleAddItem = () => {
    const nextStt = specification.length + 1;
    const newItem: SpecificationItem = {
      id: `spec_${Date.now()}`,
      stt: nextStt,
      topic: 'Chủ đề mới',
      content: 'Nội dung kiến thức / Kĩ năng',
      level: 'Mức 1',
      competence: 'Yêu cầu cần đạt theo chuẩn GDPT 2018',
      format: 'multiple_choice',
      formatLabel: 'TN nhiều lựa chọn',
      questionNumber: `Câu ${nextStt}`,
      points: 0.5,
    };
    onUpdateSpecification([...specification, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    if (specification.length <= 1) return;
    const next = specification.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      stt: idx + 1,
    }));
    onUpdateSpecification(next);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            BẢNG ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Môn: <span className="font-semibold text-slate-700">{subject}</span> — Lớp <span className="font-semibold text-slate-700">{grade}</span> ({semester})
          </p>
        </div>

        <div className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
          Tổng số câu đặc tả: <b>{specification.length}</b> câu
        </div>
      </div>

      <div className="p-3 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-lg text-xs text-blue-900 leading-relaxed">
        📌 <b>Lưu ý nghiệp vụ sư phạm:</b> Mỗi câu hỏi trong đề kiểm tra tương ứng với một dòng đặc tả riêng biệt, chỉ rõ mức độ tư duy (Biết – Hiểu – Vận dụng) và Yêu cầu cần đạt chuẩn Chương trình GDPT 2018.
      </div>

      {/* Specification Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="p-3 text-center border-r border-slate-200 w-12 font-bold">STT</th>
                <th className="p-3 border-r border-slate-200 w-44 font-bold">Chủ đề / Mạch nội dung</th>
                <th className="p-3 border-r border-slate-200 w-48 font-bold">Đơn vị kiến thức / Kĩ năng</th>
                <th className="p-3 text-center border-r border-slate-200 w-24 font-bold">Mức độ</th>
                <th className="p-3 border-r border-slate-200 min-w-[240px] font-bold">Yêu cầu cần đạt (GDPT 2018)</th>
                <th className="p-3 text-center border-r border-slate-200 w-36 font-bold">Hình thức</th>
                <th className="p-3 text-center border-r border-slate-200 w-20 font-bold">Câu số</th>
                <th className="p-3 text-center border-r border-slate-200 w-16 font-bold">Điểm</th>
                {isEditable && <th className="p-3 text-center w-12 font-bold">Xóa</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {specification.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-2.5 text-center font-bold text-slate-600 border-r border-slate-200">
                    {item.stt}
                  </td>

                  {/* Topic */}
                  <td className="p-2 border-r border-slate-200">
                    {isEditable ? (
                      <textarea
                        rows={2}
                        value={item.topic}
                        onChange={(e) => handleItemChange(idx, 'topic', e.target.value)}
                        className="w-full border border-transparent hover:border-slate-300 focus:border-blue-500 rounded p-1 resize-none bg-transparent"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{item.topic}</span>
                    )}
                  </td>

                  {/* Content Unit */}
                  <td className="p-2 border-r border-slate-200">
                    {isEditable ? (
                      <textarea
                        rows={2}
                        value={item.content}
                        onChange={(e) => handleItemChange(idx, 'content', e.target.value)}
                        className="w-full border border-transparent hover:border-slate-300 focus:border-blue-500 rounded p-1 resize-none bg-transparent"
                      />
                    ) : (
                      item.content
                    )}
                  </td>

                  {/* Level */}
                  <td className="p-2 border-r border-slate-200 text-center">
                    {isEditable ? (
                      <select
                        value={item.level}
                        onChange={(e) => handleItemChange(idx, 'level', e.target.value as QuestionLevel)}
                        className={`text-xs rounded font-bold px-1.5 py-1 border ${
                          item.level === 'Mức 1'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.level === 'Mức 2'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <option value="Mức 1">Mức 1</option>
                        <option value="Mức 2">Mức 2</option>
                        <option value="Mức 3">Mức 3</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.level === 'Mức 1'
                            ? 'bg-blue-100 text-blue-800'
                            : item.level === 'Mức 2'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.level}
                      </span>
                    )}
                  </td>

                  {/* Competence Requirement */}
                  <td className="p-2 border-r border-slate-200">
                    {isEditable ? (
                      <textarea
                        rows={2}
                        value={item.competence}
                        onChange={(e) => handleItemChange(idx, 'competence', e.target.value)}
                        className="w-full border border-transparent hover:border-slate-300 focus:border-blue-500 rounded p-1 resize-none bg-transparent"
                      />
                    ) : (
                      <span className="text-slate-700">{item.competence}</span>
                    )}
                  </td>

                  {/* Format */}
                  <td className="p-2 border-r border-slate-200 text-center">
                    {isEditable ? (
                      <select
                        value={item.format}
                        onChange={(e) => {
                          const val = e.target.value as QuestionFormat;
                          const labels: Record<QuestionFormat, string> = {
                            multiple_choice: 'TN nhiều lựa chọn',
                            true_false: 'TN Đúng sai',
                            matching: 'TN Nối cột',
                            fill_blank: 'TN Điền khuyết',
                            essay: 'Tự luận',
                            practical: 'Thực hành',
                          };
                          handleItemChange(idx, 'format', val);
                          handleItemChange(idx, 'formatLabel', labels[val] || val);
                        }}
                        className="text-xs border border-slate-200 rounded px-1.5 py-1"
                      >
                        <option value="multiple_choice">TN nhiều lựa chọn</option>
                        <option value="true_false">TN Đúng sai</option>
                        <option value="matching">TN Nối cột</option>
                        <option value="fill_blank">TN Điền khuyết</option>
                        <option value="essay">Tự luận</option>
                        <option value="practical">Thực hành</option>
                      </select>
                    ) : (
                      <span>{item.formatLabel || item.format}</span>
                    )}
                  </td>

                  {/* Question Number */}
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-800">
                    {isEditable ? (
                      <input
                        type="text"
                        value={item.questionNumber}
                        onChange={(e) => handleItemChange(idx, 'questionNumber', e.target.value)}
                        className="w-16 text-center border border-slate-200 rounded p-1 text-xs font-bold"
                      />
                    ) : (
                      item.questionNumber
                    )}
                  </td>

                  {/* Points */}
                  <td className="p-2 border-r border-slate-200 text-center font-semibold text-blue-700">
                    {isEditable ? (
                      <input
                        type="number"
                        step={0.25}
                        min={0.25}
                        value={item.points}
                        onChange={(e) => handleItemChange(idx, 'points', parseFloat(e.target.value) || 0)}
                        className="w-12 text-center border border-slate-200 rounded p-1 text-xs font-semibold"
                      />
                    ) : (
                      `${item.points.toFixed(1).replace('.', ',')} đ`
                    )}
                  </td>

                  {isEditable && (
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        disabled={specification.length <= 1}
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
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm dòng đặc tả
            </button>
            <div className="text-xs text-slate-500 italic">
              * Khớp thứ tự và mức độ tương ứng với từng câu trong đề kiểm tra
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
