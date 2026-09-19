import React from 'react';
import { Wind, Flame, Mountain } from 'lucide-react';

interface DoshaChartProps {
  vataPct: number;
  pittaPct: number;
  kaphaPct: number;
  dominantDosha: string;
}

export const DoshaChart: React.FC<DoshaChartProps> = ({
  vataPct,
  pittaPct,
  kaphaPct,
  dominantDosha,
}) => {
  const doshas = [
    {
      name: 'Vata',
      element: 'Air & Ether (Vayu & Akasha)',
      pct: vataPct,
      color: 'bg-sky-500',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      barColor: 'from-sky-400 to-blue-600',
      icon: Wind,
      traits: 'Movement, quick thinking, light, dry, enthusiastic, flexible',
    },
    {
      name: 'Pitta',
      element: 'Fire & Water (Tejas & Jala)',
      pct: pittaPct,
      color: 'bg-rose-500',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      barColor: 'from-amber-400 to-rose-600',
      icon: Flame,
      traits: 'Transformation, sharp intellect, digestion, focused, ambitious',
    },
    {
      name: 'Kapha',
      element: 'Earth & Water (Prithvi & Jala)',
      pct: kaphaPct,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      barColor: 'from-emerald-400 to-teal-600',
      icon: Mountain,
      traits: 'Structure, stability, endurance, calm, compassionate, grounded',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Percentage distribution visualizer */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h3 className="text-lg font-bold text-stone-900 mb-4 font-serif-heading">
          Tridoshic Composition Breakdown
        </h3>

        {/* Multi-segmented distribution bar */}
        <div className="w-full h-5 rounded-full overflow-hidden flex shadow-inner bg-stone-100 mb-6">
          <div
            style={{ width: `${vataPct}%` }}
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-1000 ease-out"
            title={`Vata: ${vataPct}%`}
          />
          <div
            style={{ width: `${pittaPct}%` }}
            className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-1000 ease-out"
            title={`Pitta: ${pittaPct}%`}
          />
          <div
            style={{ width: `${kaphaPct}%` }}
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 transition-all duration-1000 ease-out"
            title={`Kapha: ${kaphaPct}%`}
          />
        </div>

        {/* Detailed Dosha Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {doshas.map((d) => {
            const Icon = d.icon;
            const isDominant =
              dominantDosha.includes(d.name.toUpperCase()) ||
              dominantDosha === 'TRIDOSHA';

            return (
              <div
                key={d.name}
                className={`p-5 rounded-xl border ${d.borderColor} ${d.bgColor} relative overflow-hidden transition-all duration-300 ${
                  isDominant ? 'ring-2 ring-ayur-accent shadow-md' : 'opacity-90'
                }`}
              >
                {isDominant && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-ayur-accent text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Dominant
                  </div>
                )}

                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${d.color} text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">{d.name}</h4>
                    <p className="text-[11px] text-stone-500">{d.element}</p>
                  </div>
                </div>

                <div className="my-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-black text-stone-900 font-serif-heading">
                      {d.pct}%
                    </span>
                  </div>
                  <div className="w-full bg-white/70 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${d.barColor}`}
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mt-2">{d.traits}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
