import MathTutorChat from '@/components/MathTutorChat';

export default function TutorPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Math Tutor</h1>
              <p className="text-sm text-gray-500">
                Get personalized help with your math questions
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">GPT-4o Mini</span>
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <MathTutorChat />
      </div>
    </div>
  );
}
