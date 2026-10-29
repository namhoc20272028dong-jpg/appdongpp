import React, { useState } from 'react';
import { ExamPackage, ExamQuestion, MathGridConfig } from '../types/exam';
import { MathGridGenerator } from './MathGridGenerator';
import {
  FileText,
  Grid,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  BookOpen,
} from 'lucide-react';

interface Props {
  pkg: ExamPackage;
  onUpdatePkg: (pkg: ExamPackage) => void;
  isEditable?: boolean;
}

export const ExamPaperView: React.FC<Props> = ({
  pkg,
  onUpdatePkg,
  isEditable = true,
}) => {
  const { titleInfo, questions, readingPassage, writingSection } = pkg;
  const [editingGridQuestionIndex, setEditingGridQuestionIndex] = useState<number | null>(null);

  // Handle Title Info changes
  const handleTitleChange = (field: keyof typeof titleInfo, val: any) => {
    onUpdatePkg({
      ...pkg,
      titleInfo: { ...pkg.titleInfo, [field]: val },
    });
  };

  // Handle Question changes
  const handleQuestionChange = (idx: number, field: keyof ExamQuestion, val: any) => {
    const nextQuestions = [...questions];
    nextQuestions[idx] = { ...nextQuestions[idx], [field]: val };
    onUpdatePkg({ ...pkg, questions: nextQuestions });
  };

  // Handle Option changes
  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const nextQuestions = [...questions];
    const q = nextQuestions[qIdx];
    if (q.options) {
      const nextOpts = [...q.options];
      nextOpts[optIdx] = val;
      q.options = nextOpts;
      onUpdatePkg({ ...pkg, questions: nextQuestions });
    }
  };

  // Move Question Up/Down
  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const nextQuestions = [...questions];
    const temp = nextQuestions[idx];
    nextQuestions[idx] = nextQuestions[targetIdx];
    nextQuestions[targetIdx] = temp;

    // Re-number consecutively 1..N
    nextQuestions.forEach((q, i) => {
      q.number = i + 1;
    });

    onUpdatePkg({ ...pkg, questions: nextQuestions });
  };

  // Delete Question
  const deleteQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    const nextQuestions = questions.filter((_, i) => i !== idx).map((q, i) => ({
      ...q,
      number: i + 1,
    }));
    onUpdatePkg({ ...pkg, questions: nextQuestions });
  };

  // Add Question
  const addQuestion = () => {
    const nextNum = questions.length + 1;
    const isPrimaryGrade = titleInfo.grade <= 3;
    const defaultOptions = isPrimaryGrade
      ? ['A. Phương án A', 'B. Phương án B', 'C. Phương án C']
      : ['A. Phương án A', 'B. Phương án B', 'C. Phương án C', 'D. Phương án D'];

    const newQ: ExamQuestion = {
      id: `q_${Date.now()}`,
      number: nextNum,
      points: 0.5,
      pointsText: '0,5 điểm',
      format: 'multiple_choice',
      level: 'Mức 1',
      topic: 'Kiến thức chung',
      content: 'Khoanh vào chữ cái đặt trước câu trả lời đúng:\nNội dung câu hỏi mới...',
      options: defaultOptions,
    };

    onUpdatePkg({ ...pkg, questions: [...questions, newQ] });
  };

  // Apply Math Grid
  const handleApplyGrid = (config: MathGridConfig) => {
    if (editingGridQuestionIndex !== null) {
      handleQuestionChange(editingGridQuestionIndex, 'gridConfig', config);
      setEditingGridQuestionIndex(null);
    }
  };

  // Count words in Reading Passage
  const currentWordCount = readingPassage
    ? readingPassage.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Editorial helper bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">ĐỀ KIỂM TRA ĐỊNH KÌ TIỂU HỌC</h2>
            <p className="text-xs text-slate-500">
              Quy chuẩn: Đánh số từ Câu 1 đến hết • Không ghi tiêu đề Trắc nghiệm/Tự luận • Trắc nghiệm M1 trước, M2 sau • Tự luận M1-M2-M3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditable && (
            <button
              type="button"
              onClick={addQuestion}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-indigo-200"
            >
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Exam Sheet Container (Formatted as A4 paper) */}
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-md border border-slate-200 max-w-4xl mx-auto font-serif text-slate-900 leading-normal printable-paper">
        {/* Header Block: School and Exam Title */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-300">
          <div className="col-span-5 text-center flex flex-col justify-start">
            {isEditable ? (
              <>
                <input
                  type="text"
                  value={titleInfo.district}
                  onChange={(e) => handleTitleChange('district', e.target.value.toUpperCase())}
                  className="font-sans font-bold text-xs uppercase text-center border-b border-transparent hover:border-slate-300 focus:border-indigo-500 pb-0.5 tracking-wider"
                  placeholder="UBND HUYỆN/XÃ..."
                />
                <input
                  type="text"
                  value={titleInfo.school}
                  onChange={(e) => handleTitleChange('school', e.target.value.toUpperCase())}
                  className="font-sans font-bold text-xs uppercase text-center border-b border-transparent hover:border-slate-300 focus:border-indigo-500 pb-0.5 mt-0.5 tracking-wider"
                  placeholder="TRƯỜNG TIỂU HỌC..."
                />
              </>
            ) : (
              <>
                <div className="font-sans font-bold text-xs uppercase tracking-wider">{titleInfo.district}</div>
                <div className="font-sans font-bold text-xs uppercase tracking-wider">{titleInfo.school}</div>
              </>
            )}
            <div className="w-16 h-0.5 bg-slate-800 mx-auto mt-1"></div>
          </div>

          <div className="col-span-7 text-center">
            {isEditable ? (
              <input
                type="text"
                value={titleInfo.examTitle}
                onChange={(e) => handleTitleChange('examTitle', e.target.value.toUpperCase())}
                className="font-sans font-bold text-sm md:text-base uppercase text-center w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-500"
              />
            ) : (
              <div className="font-sans font-bold text-sm md:text-base uppercase">{titleInfo.examTitle}</div>
            )}

            <div className="font-sans text-xs mt-0.5">{titleInfo.schoolYear}</div>

            <div className="font-sans font-bold text-xs md:text-sm text-slate-800 uppercase mt-0.5">
              MÔN: {titleInfo.subject.toUpperCase()} - LỚP {titleInfo.grade}
            </div>

            <div className="text-xs italic text-slate-600 mt-0.5">
              (Thời gian làm bài: {titleInfo.duration} phút - Không kể thời gian giao đề)
            </div>
          </div>
        </div>

        {/* Student identification & Score Table */}
        <div className="grid grid-cols-12 gap-0 my-5 border border-slate-400 rounded-sm overflow-hidden text-xs">
          <div className="col-span-6 p-3 border-r border-slate-400 space-y-2">
            <div>
              <span className="font-bold">Họ và tên học sinh:</span> ..............................................................
            </div>
            <div>
              <span className="font-bold">Lớp:</span> {titleInfo.grade}..... Trường Tiểu học: .................................................
            </div>
          </div>

          <div className="col-span-3 p-2 text-center border-r border-slate-400 flex flex-col justify-between">
            <span className="font-bold">ĐIỂM</span>
            <div className="h-10"></div>
          </div>

          <div className="col-span-3 p-2 text-center flex flex-col justify-between">
            <span className="font-bold">LỜI NHẬN XÉT CỦA THẦY CÔ GIÁO</span>
            <div className="h-10"></div>
          </div>
        </div>

        {/* READING PASSAGE SECTION (Cho môn Tiếng Việt) */}
        {readingPassage && (
          <div className="my-6 p-5 bg-slate-50/70 border border-slate-300 rounded-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-indigo-700 font-sans font-bold text-xs uppercase">
                <BookOpen className="w-4 h-4" /> BÀI ĐỌC HIỂU NGOÀI CHƯƠNG TRÌNH
              </div>
              <div className="text-[11px] font-sans px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                Độ dài: <b>{currentWordCount} chữ</b> (Quy chuẩn Lớp {titleInfo.grade}: {readingPassage.targetRangeText})
              </div>
            </div>

            <div className="text-center font-bold text-sm md:text-base uppercase text-slate-800 mb-1">
              {isEditable ? (
                <input
                  type="text"
                  value={readingPassage.title}
                  onChange={(e) =>
                    onUpdatePkg({
                      ...pkg,
                      readingPassage: { ...readingPassage, title: e.target.value },
                    })
                  }
                  className="font-bold text-center w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent"
                />
              ) : (
                readingPassage.title
              )}
            </div>

            {readingPassage.author && (
              <div className="text-right italic text-xs text-slate-600 mb-3">
                {readingPassage.author}
              </div>
            )}

            {isEditable ? (
              <textarea
                rows={8}
                value={readingPassage.content}
                onChange={(e) =>
                  onUpdatePkg({
                    ...pkg,
                    readingPassage: {
                      ...readingPassage,
                      content: e.target.value,
                      wordCount: e.target.value.trim().split(/\s+/).filter(Boolean).length,
                    },
                  })
                }
                className="w-full text-xs md:text-sm leading-relaxed p-2 border border-slate-300 rounded bg-white text-justify"
              />
            ) : (
              <div className="text-xs md:text-sm leading-relaxed text-justify space-y-2 indent-6 whitespace-pre-line">
                {readingPassage.content}
              </div>
            )}

            <div className="mt-3 text-xs italic font-sans font-semibold text-slate-700">
              * Dựa vào nội dung bài đọc trên, em hãy khoanh vào chữ cái đặt trước câu trả lời đúng và hoàn thành các bài tập dưới đây:
            </div>
          </div>
        )}

        {/* QUESTIONS LIST (Numbered 1 to N, strictly NO "Phần Trắc nghiệm", NO "Phần Tự luận") */}
        <div className="space-y-6 mt-4">
          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="group relative pb-4 border-b border-dashed border-slate-200 last:border-none"
            >
              {/* Question Control Toolbar for Teachers */}
              {isEditable && (
                <div className="absolute right-0 -top-2 hidden group-hover:flex items-center gap-1 bg-white shadow-md border border-slate-200 px-2 py-1 rounded-lg z-10 font-sans text-xs">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mr-1">
                    {q.level} • {q.format}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveQuestion(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"
                    title="Chuyển lên"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(idx, 'down')}
                    disabled={idx === questions.length - 1}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"
                    title="Chuyển xuống"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGridQuestionIndex(idx)}
                    className="p-1 hover:bg-emerald-50 rounded text-emerald-700 flex items-center gap-0.5"
                    title="Thêm/sửa lưới ô vuông"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(idx)}
                    disabled={questions.length <= 1}
                    className="p-1 hover:bg-rose-50 rounded text-rose-600 disabled:opacity-30"
                    title="Xóa câu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Standard Question Header: Câu X (điểm): unbold question */}
              <div className="text-sm md:text-base leading-relaxed">
                {/* Format strictly compliant with: Câu 1 (0,5 điểm): CÂU HỎI KO ĐẬM */}
                <span className="font-bold">Câu {q.number}</span>{' '}
                <span className="italic font-normal">
                  ({q.pointsText || `${q.points.toFixed(1).replace('.', ',')} điểm`}):
                </span>{' '}
                {isEditable ? (
                  <textarea
                    rows={2}
                    value={q.content}
                    onChange={(e) => handleQuestionChange(idx, 'content', e.target.value)}
                    className="w-full mt-1 p-1 text-sm border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded bg-transparent resize-y"
                  />
                ) : (
                  <span className="font-normal whitespace-pre-line">{q.content}</span>
                )}
              </div>

              {/* Math Grid visual rendering (nếu có) */}
              {q.gridConfig && (() => {
                const grid = q.gridConfig;
                return (
                  <div className="my-3 flex flex-col items-center p-3 bg-slate-50 border border-slate-300 rounded-md w-fit mx-auto">
                    <div
                      className="border border-slate-800 bg-slate-400"
                      style={{
                        display: 'grid',
                        gridTemplateRows: `repeat(${grid.rows}, ${grid.cellSize || 24}px)`,
                        gridTemplateColumns: `repeat(${grid.cols}, ${grid.cellSize || 24}px)`,
                        gap: '1px',
                      }}
                    >
                      {Array.from({ length: grid.rows }).map((_, r) =>
                        Array.from({ length: grid.cols }).map((_, c) => {
                          const isShaded =
                            r < (grid.shapeData?.height || 2) &&
                            c < (grid.shapeData?.width || 4);
                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`w-full h-full ${
                                isShaded ? 'bg-slate-300' : 'bg-white'
                              }`}
                            />
                          );
                        })
                      )}
                    </div>
                    {grid.shapeData?.label && (
                      <div className="text-xs italic text-slate-600 mt-2">
                        ({grid.shapeData.label})
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Options formatting: Placed at 1-tab indent (pl-6) */}
              {q.options && q.options.length > 0 && (
                <div className="pl-6 mt-2 space-y-1.5 text-xs md:text-sm">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      {isEditable ? (
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                          className="w-full p-1 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent"
                        />
                      ) : (
                        <div>{opt}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* True/False (Đúng ghi Đ, sai ghi S) */}
              {q.tfItems && q.tfItems.length > 0 && (
                <div className="pl-6 mt-2 space-y-1.5 text-xs md:text-sm">
                  {q.tfItems.map((item, tfIdx) => (
                    <div key={tfIdx} className="flex items-center justify-between">
                      {isEditable ? (
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const nextTf = [...(q.tfItems || [])];
                            nextTf[tfIdx] = e.target.value;
                            handleQuestionChange(idx, 'tfItems', nextTf);
                          }}
                          className="w-full p-1 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent"
                        />
                      ) : (
                        <div>{item}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Matching pairs (Nối cột) */}
              {q.matchingPairs && (
                <div className="my-2 overflow-x-auto">
                  <table className="w-11/12 mx-auto border border-slate-400 text-xs text-center">
                    <thead>
                      <tr className="bg-slate-100 font-bold border-b border-slate-400">
                        <th className="p-2 border-r border-slate-400 w-1/2">Cột A</th>
                        <th className="p-2 w-1/2">Cột B</th>
                      </tr>
                    </thead>
                    <tbody>
                      {q.matchingPairs.colA.map((itemA, pIdx) => (
                        <tr key={pIdx} className="border-b border-slate-300 last:border-none">
                          <td className="p-2 border-r border-slate-400 text-left font-medium">{itemA}</td>
                          <td className="p-2 text-left font-medium">{q.matchingPairs?.colB[pIdx] || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Essay or Practical lines */}
              {q.format === 'essay' && (
                <div className="mt-3 text-xs italic text-slate-400 font-sans space-y-4">
                  <div className="text-slate-600">Bài làm:</div>
                  <div className="border-b border-dotted border-slate-400 h-4"></div>
                  <div className="border-b border-dotted border-slate-400 h-4"></div>
                  {q.points >= 1.5 && (
                    <>
                      <div className="border-b border-dotted border-slate-400 h-4"></div>
                      <div className="border-b border-dotted border-slate-400 h-4"></div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Writing Section for Tiếng Việt */}
        {writingSection && (
          <div className="mt-8 pt-6 border-t-2 border-slate-800">
            <div className="font-sans font-bold text-sm md:text-base uppercase text-center mb-4">
              B. KIỂM TRA VIẾT (10 điểm)
            </div>

            {writingSection.dictationTitle && (
              <div className="mb-6">
                <div className="font-bold text-xs md:text-sm">
                  1. Chính tả (Nghe - viết){' '}
                  <span className="font-normal italic">
                    ({writingSection.dictationPoints || 4} điểm)
                  </span>
                  :
                </div>
                <div className="text-center font-bold text-xs md:text-sm my-2">
                  {writingSection.dictationTitle}
                </div>
                <div className="italic text-xs md:text-sm pl-8 leading-relaxed whitespace-pre-line text-slate-800">
                  {writingSection.dictationContent}
                </div>
              </div>
            )}

            {writingSection.essayPrompt && (
              <div>
                <div className="font-bold text-xs md:text-sm">
                  2. Tập làm văn{' '}
                  <span className="font-normal italic">
                    ({writingSection.essayPoints || 6} điểm)
                  </span>
                  :
                </div>
                <div className="mt-2 pl-4 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line">
                  {writingSection.essayPrompt}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid Generator Modal */}
      {editingGridQuestionIndex !== null && (
        <MathGridGenerator
          initialConfig={questions[editingGridQuestionIndex]?.gridConfig}
          onApply={handleApplyGrid}
          onCancel={() => setEditingGridQuestionIndex(null)}
        />
      )}
    </div>
  );
};
