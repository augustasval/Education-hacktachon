'use client';

import { useMathTutorStore } from '@/lib/store';
import ToggleSwitch from './ToggleSwitch';

export default function StepByStepToggle() {
  const { stepByStepMode, setStepByStepMode } = useMathTutorStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Learning Preferences
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose how detailed you want the explanations to be.
          </p>
        </div>

        <ToggleSwitch
          checked={stepByStepMode}
          onChange={setStepByStepMode}
          label="Step-by-step Mode"
          description="Get detailed, numbered explanations breaking down each step of the solution process"
        />

        {stepByStepMode && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <div className="font-medium text-blue-800 mb-1">Step-by-step Mode Enabled</div>
                <div className="text-blue-700">
                  You'll receive detailed explanations with numbered steps, intermediate calculations, and clear reasoning for each mathematical operation.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
