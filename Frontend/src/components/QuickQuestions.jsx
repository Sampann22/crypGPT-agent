/**
 * Quick questions sidebar component
 * Shows preset questions users can click to ask
 */
export function QuickQuestions({ onSelectQuestion }) {
  const questions = [
    'What is CrypGPT?',
    'What are the tokenomics?',
    'What is the roadmap?',
    'What are the use cases?',
    'How does the network work?'
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">
        Quick Questions
      </p>
      <div className="space-y-2">
        {questions.map((question) => (
          <button
            key={question}
            onClick={() => onSelectQuestion(question)}
            className="w-full text-left text-xs p-2 rounded hover:bg-slate-100 text-slate-700 transition font-medium"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
