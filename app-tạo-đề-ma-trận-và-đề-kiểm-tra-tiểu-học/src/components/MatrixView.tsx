import React from 'react';
import { MatrixRow } from '../types/exam';
import { CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';

interface Props {
  matrix: MatrixRow[];
  grade: number;
  subject: string;
  semester: string;
  onUpdateMatrix: (matrix: MatrixRow[]) => void;
  isEditable?: boolean;
}

export const MatrixView: React.FC<Props> = ({
  matrix,
  grade,
  subject,
  semester,
  onUpdateMatrix,
  isEditable = true,
}) => {
  // Aggregate statistics
  const totalM1Points = matrix.reduce((sum, r) => sum + (r.m1_tn_points || 0) + (r.m1_tl_points || 0), 0);
  const totalM2Points = matrix.reduce((sum, r) => sum + (r.m2_tn_points || 0) + (r.m2_tl_points || 0), 0);
  const totalM3Points = matrix.reduce((sum, r) => sum + (r.m3_tl_points || 0), 0);

  const totalTNPoints = matrix.reduce((sum, r) => sum + (r.m1_tn_points || 0) + (r.m2_tn_points || 0), 0);
  const totalTLPoints = matrix.reduce((sum, r) => sum + (r.m1_tl_points || 0) + (r.m2_tl_points || 0) + (r.m3_tl_points || 0), 0);

  const totalPoints = totalM1Points + totalM2Points + totalM3Points;
  const totalQuestions = matrix.reduce((sum, r) => sum + (r.total_count || 0), 0);

  const m1Pct = totalPoints > 0 ? Math.round((totalM1Points / totalPoints) * 100) : 0;
  const m2Pct = totalPoints > 0 ? Math.round((totalM2Points / totalPoints) * 100) : 0;
  const m3Pct = totalPoints > 0 ? Math.round((totalM3Points / totalPoints) * 100) : 0;

  const tnPct = totalPoints > 0 ? Math.round((totalTNPoints / totalPoints) * 100) : 0;
  const tlPct = totalPoints > 0 ? Math.round((totalTLPoints / totalPoints) * 100) : 0;

  // Check GDPT 2018 guidelines
  const isRatioStandard = m1Pct >= 40 && m1Pct <= 60 && m2Pct >= 20 && m2Pct <= 40 && m3Pct >= 10 && m3Pct <= 30;

  const handleRowChange = (index: number, field: keyof MatrixRow, value: any) => {
    const next = [...matrix];
    next[index] = { ...next[index], [field]: value };

    // Auto recalculate row totals
    const r = next[index];
    const rowPoints =
      (r.m1_tn_points || 0) +
      (r.m1_tl_points || 0) +
      (r.m2_tn_points || 0) +
      (r.m2_tl_points || 0) +
      (r.m3_tl_points || 0);

    const rowCount =
      (r.m1_tn_count || 0) +
      (r.m1_tl_count || 0) +
      (r.m2_tn_count || 0) +
      (r.m2_tl_count || 0) +
      (r.m3_tl_count || 0);

    r.total_points = rowPoints;
    r.total_count = rowCount;

    onUpdateMatrix(next);
  };

  const handleAddRow = () => {
    const newRow: MatrixRow = {
      id: `row_${Date.now()}`,
      topic: 'Chủ đề / Mạch kiến thức mới',
      m1_tn_count: 1,
      m1_tn_points: 0.5,
      m1_tl_count: 0,
      m1_tl_points: 0,
      m2_tn_count: 1,
      m2_tn_points: 0.5,
      m2_tl_count: 0,
      m2_tl_points: 0,
      m3_tn_count: 0,
      m3_tn_points: 0,
      m3_tl_count: 1,
      m3_tl_points: 1.0,
      total_count: 3,
      total_points: 2.0,
      percentage: 20,
    };
    onUpdateMatrix([...matrix, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (matrix.length <= 1) return;
    const next = matrix.filter((_, i) => i !== index);
    onUpdateMatrix(next);
  };

  return (
    <div className="space-y-6">
      {/* Title & Guidelines banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Môn: <span className="font-semibold text-slate-700">{subject}</span> — Lớp <span className="font-semibold text-slate-700">{grade}</span> ({semester})
          </p>
        </div>

        {/* Indicator badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium ${isRatioStandard ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            {isRatioStandard ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
            <span>Tỉ lệ Mức 1-2-3: <b>{m1Pct}% – {m2Pct}% – {m3Pct}%</b> (Chuẩn: 50-30-20%)</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            Tỉ lệ TN/TL: <b>{tnPct}% / {tlPct}%</b>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
            Tổng điểm: <b>{totalPoints.toFixed(1).replace('.', ',')} đ</b> ({totalQuestions} câu)
          </div>
        </div>
      </div>

      {/* Strict rule notice */}
      <div className="p-3.5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <b>Quy định bắt buộc theo GDPT 2018 & Thông tư 27:</b> Không tạo câu hỏi trắc nghiệm ở Mức 3 (Vận dụng); toàn bộ câu hỏi Mức 3 phải là Tự luận hoặc Thực hành.
          Mỗi chủ đề/bài có nhiều câu hỏi thì mỗi câu hỏi ứng với một đặc tả riêng.
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 text-xs">
                <th rowSpan={3} className="p-3 border-r border-slate-200 min-w-[200px] text-center font-bold">
                  Chủ đề / Mạch kiến thức
                </th>
                <th colSpan={4} className="p-2 border-r border-slate-200 text-center font-bold bg-blue-50/50">
                  Mức 1 (Biết)
                </th>
                <th colSpan={4} className="p-2 border-r border-slate-200 text-center font-bold bg-amber-50/50">
                  Mức 2 (Hiểu)
                </th>
                <th colSpan={2} className="p-2 border-r border-slate-200 text-center font-bold bg-emerald-50/50">
                  Mức 3 (Vận dụng)
                </th>
                <th rowSpan={3} className="p-2 border-r border-slate-200 text-center font-bold bg-slate-50 min-w-[60px]">
                  Tổng câu
                </th>
                <th rowSpan={3} className="p-2 border-r border-slate-200 text-center font-bold bg-slate-50 min-w-[60px]">
                  Tổng điểm
                </th>
                <th rowSpan={3} className="p-2 border-r border-slate-200 text-center font-bold bg-slate-50 min-w-[50px]">
                  Tỉ lệ
                </th>
                {isEditable && (
                  <th rowSpan={3} className="p-2 text-center font-bold bg-slate-50 min-w-[40px]">
                    Thao tác
                  </th>
                )}
              </tr>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs text-center">
                <th colSpan={2} className="p-1.5 border-r border-slate-200 bg-blue-50/30">Trắc nghiệm</th>
                <th colSpan={2} className="p-1.5 border-r border-slate-200 bg-blue-50/30">Tự luận</th>
                <th colSpan={2} className="p-1.5 border-r border-slate-200 bg-amber-50/30">Trắc nghiệm</th>
                <th colSpan={2} className="p-1.5 border-r border-slate-200 bg-amber-50/30">Tự luận</th>
                <th colSpan={2} className="p-1.5 border-r border-slate-200 bg-emerald-50/30 text-emerald-800 font-semibold">Tự luận (Không TN)</th>
              </tr>
              <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-200 text-[11px] text-center">
                <th className="p-1 border-r border-slate-200">Câu</th>
                <th className="p-1 border-r border-slate-200">Điểm</th>
                <th className="p-1 border-r border-slate-200">Câu</th>
                <th className="p-1 border-r border-slate-200">Điểm</th>
                <th className="p-1 border-r border-slate-200">Câu</th>
                <th className="p-1 border-r border-slate-200">Điểm</th>
                <th className="p-1 border-r border-slate-200">Câu</th>
                <th className="p-1 border-r border-slate-200">Điểm</th>
                <th className="p-1 border-r border-slate-200">Câu</th>
                <th className="p-1 border-r border-slate-200">Điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {matrix.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-2.5 border-r border-slate-200 font-medium text-slate-800">
                    {isEditable ? (
                      <textarea
                        rows={2}
                        value={row.topic}
                        onChange={(e) => handleRowChange(idx, 'topic', e.target.value)}
                        className="w-full text-xs border border-transparent hover:border-slate-300 focus:border-blue-500 rounded p-1 resize-none bg-transparent"
                      />
                    ) : (
                      row.topic
                    )}
                  </td>

                  {/* Mức 1: TN */}
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      min={0}
                      value={row.m1_tn_count}
                      onChange={(e) => handleRowChange(idx, 'm1_tn_count', parseInt(e.target.value) || 0)}
                      className="w-10 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      value={row.m1_tn_points}
                      onChange={(e) => handleRowChange(idx, 'm1_tn_points', parseFloat(e.target.value) || 0)}
                      className="w-12 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>

                  {/* Mức 1: TL */}
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      min={0}
                      value={row.m1_tl_count}
                      onChange={(e) => handleRowChange(idx, 'm1_tl_count', parseInt(e.target.value) || 0)}
                      className="w-10 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      value={row.m1_tl_points}
                      onChange={(e) => handleRowChange(idx, 'm1_tl_points', parseFloat(e.target.value) || 0)}
                      className="w-12 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>

                  {/* Mức 2: TN */}
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      min={0}
                      value={row.m2_tn_count}
                      onChange={(e) => handleRowChange(idx, 'm2_tn_count', parseInt(e.target.value) || 0)}
                      className="w-10 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      value={row.m2_tn_points}
                      onChange={(e) => handleRowChange(idx, 'm2_tn_points', parseFloat(e.target.value) || 0)}
                      className="w-12 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>

                  {/* Mức 2: TL */}
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      min={0}
                      value={row.m2_tl_count}
                      onChange={(e) => handleRowChange(idx, 'm2_tl_count', parseInt(e.target.value) || 0)}
                      className="w-10 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      value={row.m2_tl_points}
                      onChange={(e) => handleRowChange(idx, 'm2_tl_points', parseFloat(e.target.value) || 0)}
                      className="w-12 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>

                  {/* Mức 3: TL ONLY */}
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      min={0}
                      value={row.m3_tl_count}
                      onChange={(e) => handleRowChange(idx, 'm3_tl_count', parseInt(e.target.value) || 0)}
                      className="w-10 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="p-1.5 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      value={row.m3_tl_points}
                      onChange={(e) => handleRowChange(idx, 'm3_tl_points', parseFloat(e.target.value) || 0)}
                      className="w-12 text-center border border-slate-200 rounded p-1 text-xs"
                      disabled={!isEditable}
                    />
                  </td>

                  {/* Totals */}
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-800 bg-slate-50/50">
                    {row.total_count}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-blue-700 bg-slate-50/50">
                    {row.total_points.toFixed(1).replace('.', ',')}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center text-slate-600 bg-slate-50/50">
                    {totalPoints > 0 ? Math.round((row.total_points / totalPoints) * 100) : 0}%
                  </td>

                  {isEditable && (
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        disabled={matrix.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30"
                        title="Xóa dòng ma trận"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-slate-100 font-bold text-slate-800 text-xs">
                <td className="p-2.5 border-r border-slate-200 text-center uppercase tracking-wider">
                  TỔNG CỘNG
                </td>
                <td colSpan={4} className="p-2 border-r border-slate-200 text-center text-blue-800 bg-blue-50/60">
                  {totalM1Points.toFixed(1).replace('.', ',')} đ ({m1Pct}%)
                </td>
                <td colSpan={4} className="p-2 border-r border-slate-200 text-center text-amber-800 bg-amber-50/60">
                  {totalM2Points.toFixed(1).replace('.', ',')} đ ({m2Pct}%)
                </td>
                <td colSpan={2} className="p-2 border-r border-slate-200 text-center text-emerald-800 bg-emerald-50/60">
                  {totalM3Points.toFixed(1).replace('.', ',')} đ ({m3Pct}%)
                </td>
                <td className="p-2 border-r border-slate-200 text-center text-slate-900 bg-slate-200/70">
                  {totalQuestions}
                </td>
                <td className="p-2 border-r border-slate-200 text-center text-rose-700 bg-slate-200/70">
                  {totalPoints.toFixed(1).replace('.', ',')} đ
                </td>
                <td className="p-2 border-r border-slate-200 text-center bg-slate-200/70">
                  100%
                </td>
                {isEditable && <td className="p-1"></td>}
              </tr>
            </tbody>
          </table>
        </div>

        {isEditable && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddRow}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm mạch kiến thức / chủ đề
            </button>
            <div className="text-xs text-slate-500 italic">
              * Tỉ lệ được tự động đồng bộ sang Bản đặc tả và Đề kiểm tra
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
