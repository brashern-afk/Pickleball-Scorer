import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface ColorCustomizerProps {
  onClose: () => void;
}

const presets = [
  { name: 'Classic Blue', court: '#3B82F6', kitchen: '#F472B6' },
  { name: 'Forest Green', court: '#166534', kitchen: '#FBBF24' },
  { name: 'Dusk Purple', court: '#581C87', kitchen: '#F97316' },
  { name: 'Ruby Red', court: '#991B1B', kitchen: '#67E8F9' },
  { name: 'Ocean Teal', court: '#0d9488', kitchen: '#f0abfc' },
  { name: 'Graphite Gray', court: '#4b5563', kitchen: '#f59e0b' },
  { name: 'Sunset Orange', court: '#f97316', kitchen: '#4338ca' },
  { name: 'High Contrast', court: '#1f2937', kitchen: '#d1d5db' },
];

const ColorCustomizer: React.FC<ColorCustomizerProps> = ({ onClose }) => {
  const { settings, setSettings } = useSettings();

  const handlePresetClick = (courtColor: string, kitchenColor: string) => {
    setSettings({ courtColor, kitchenColor });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm">
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-300">Color Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </header>
        <div className="p-4">
          <p className="text-gray-300 mb-4">Select a court color theme:</p>
          <div className="grid grid-cols-2 gap-4">
            {presets.map(preset => (
              <button 
                key={preset.name}
                onClick={() => handlePresetClick(preset.court, preset.kitchen)}
                className={`p-2 rounded-lg border-2 transition-colors ${settings.courtColor === preset.court ? 'border-yellow-400' : 'border-transparent'}`}
              >
                <div className="w-full h-16 rounded-md flex overflow-hidden">
                  <div className="w-1/2 h-full" style={{backgroundColor: preset.court}}></div>
                  <div className="w-1/2 h-full" style={{backgroundColor: preset.kitchen}}></div>
                </div>
                <span className="text-sm mt-2 block">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorCustomizer;