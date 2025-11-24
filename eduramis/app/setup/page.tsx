import GradeSelector from '@/components/GradeSelector';
import TopicSelector from '@/components/TopicSelector';
import StepByStepToggle from '@/components/StepByStepToggle';
import Link from 'next/link';

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Setup Your Math Tutoring Session
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your grade level and the math topic you'd like help with. 
            We'll tailor our responses to be perfect for your learning level.
          </p>
        </div>

        {/* Setup Form */}
        <div className="space-y-8">
          {/* Grade Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <GradeSelector />
          </div>

          {/* Topic Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <TopicSelector />
          </div>

          {/* Step-by-step Mode */}
          <StepByStepToggle />

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <Link
              href="/tutor"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Tutoring Session
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 mb-1">1. Choose Your Grade</div>
              <div className="text-blue-700">Select your current grade level for age-appropriate explanations</div>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-1">2. Pick a Topic</div>
              <div className="text-blue-700">Choose the specific math area you need help with</div>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-1">3. Set Preferences</div>
              <div className="text-blue-700">Enable step-by-step mode for detailed explanations</div>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-1">4. Start Learning</div>
              <div className="text-blue-700">Get personalized help from our AI tutor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
