import React, { useState } from 'react';
import { MathGridConfig } from '../types/exam';
import { Grid, Check, RotateCcw } from 'lucide-react';

interface Props {
  initialConfig?: MathGridConfig;
  onApply: (config: MathGridConfig) => void;
  onCancel: () => void;
}

export const MathGridGenerator: React.FC<Props> = ({ initialConfig, onApply, onCancel }) => {
  const [rows, setRows] = useState(initialConfig?.rows || 4);
  const [cols, setCols] = useState(initialConfig?.cols || 6);
  const [cellSize] = useState(30);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (initialConfig?.shapeData?.width && initialConfig?.shapeData?.height) {
      for (let r = 0; r < initialConfig.shapeData.height; r++) {
        for (let c = 0; c < initialConfig.shapeData.width; c++) {
          set.add(`${r}-${c}`);
        }
      }
    } else {
      // Default sample 4x2
      set.add('0-0');
      set.add('0-1');
      set.add('0-2');
      set.add('0-3');
      set.add('1-0');
      set.add('1-1');
      set.add('1-2');
      set.add('1-3');
    }
    return set;
  });

  const [label, setLabel] = useState(initialConfig?.shapeData?.label || 'Mỗi ô vuông là 1 cm²');

  const toggleCell = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const next = new Set(selectedCells);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedCells(next);
  };

  const selectRectangle = (w: number, h: number) => {
    const next = new Set<string>();
    for (let r = 0; r < Math.min(h, rows); r++) {
      for (let c = 0; c < Math.min(w, cols); c++) {
        next.add(`${r}-${c}`);
      }
    }
    setSelectedCells(next);
  };

  const clearAll = () => {
    setSelectedCells(new Set());
  };

  const handleSave = () => {
    const config: MathGridConfig = {
      rows,
      cols,
      cellSize,
      shapeType: 'count_squares',
      shapeData: {
        x: 0,
        y: 0,
        width: cols,
        height: rows,
        label: label,
      },
    };
    onApply(config);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Công Cụ Tạo Hình Trên Lưới Ô Vuông</h3>
              <p className="text-xs text-slate-500">Chuẩn GDPT 2018 Toán Tiểu học (Lớp 1 - 5)</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-5">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Số hàng (dòng):</label>
              <input
                type="number"
                min={2}
                max={10}
                value={rows}
                onChange={(e) => setRows(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Số cột:</label>
              <input
                type="number"
                min={2}
                max={12}
                value={cols}
                onChange={(e) => setCols(Math.max(2, Math.min(12, parseInt(e.target.value) || 2)))}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hình mẫu nhanh:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => selectRectangle(3, 3)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  Vuông 3x3
                </button>
                <button
                  type="button"
                  onClick={() => selectRectangle(5, 2)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  Chữ nhật 5x2
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2.5 py-1 text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 rounded font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Xóa ô
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú chú giải dưới hình:</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="VD: Mỗi ô vuông nhỏ là 1 cm²"
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 leading-relaxed">
              💡 <b>Mẹo sư phạm:</b> Nhấp chuột trực tiếp vào từng ô vuông để tô màu hoặc bỏ tô màu hình vẽ câu hỏi kiểm tra!
            </div>
          </div>

          {/* Interactive Grid Canvas Preview */}
          <div className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 overflow-auto">
            <div className="mb-2 text-xs font-medium text-slate-500">
              Đang tô màu: <span className="font-bold text-emerald-600">{selectedCells.size}</span> ô vuông
            </div>

            <div
              className="inline-block bg-white border-2 border-slate-700 shadow-sm rounded p-1"
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                gap: '1px',
                backgroundColor: '#94a3b8',
              }}
            >
              {Array.from({ length: rows }).map((_, r) =>
                Array.from({ length: cols }).map((_, c) => {
                  const isSelected = selectedCells.has(`${r}-${c}`);
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => toggleCell(r, c)}
                      className={`w-full h-full transition-colors flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-white hover:bg-blue-100 text-slate-300'
                      }`}
                      title={`Tọa độ: hàng ${r + 1}, cột ${c + 1}`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })
              )}
            </div>

            {label && (
              <div className="mt-3 text-xs italic text-slate-600 font-medium">
                ({label})
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow"
          >
            <Check className="w-4 h-4" /> Áp dụng hình vào câu hỏi
          </button>
        </div>
      </div>
    </div>
  );
};
