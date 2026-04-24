import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PLANET_REMEDIES = {
  Su: {
    name: 'Sun (Sūrya)', color: '#f59e0b',
    gemstone: 'Ruby (Māṇikya)', metal: 'Gold', day: 'Sunday',
    mantra: 'Om Hrāṃ Hrīṃ Hraum Saḥ Sūryāya Namaḥ',
    charity: 'Donate wheat, jaggery, or copper on Sundays',
    fasting: 'Fast on Sundays',
    deity: 'Lord Viṣṇu / Sūrya Deva',
    color_wear: 'Orange, red, or gold',
    tips: ['Offer water to the Sun at sunrise', 'Respect father figures and authority', 'Practice Sūrya Namaskāra daily'],
  },
  Mo: {
    name: 'Moon (Chandra)', color: '#60a5fa',
    gemstone: 'Pearl (Motī) or Moonstone', metal: 'Silver', day: 'Monday',
    mantra: 'Om Śrāṃ Śrīṃ Śraum Saḥ Chandrāya Namaḥ',
    charity: 'Donate rice, milk, or white items on Mondays',
    fasting: 'Fast on Mondays',
    deity: 'Lord Śiva / Chandra Deva',
    color_wear: 'White or light blue',
    tips: ['Meditate near water bodies', 'Honor your mother', 'Drink water from a silver vessel'],
  },
  Ma: {
    name: 'Mars (Maṅgala)', color: '#f87171',
    gemstone: 'Red Coral (Moṅgā)', metal: 'Copper', day: 'Tuesday',
    mantra: 'Om Krāṃ Krīṃ Kraum Saḥ Bhaumāya Namaḥ',
    charity: 'Donate red lentils, red cloth, or copper on Tuesdays',
    fasting: 'Fast on Tuesdays',
    deity: 'Lord Hanumān / Kārttikeya',
    color_wear: 'Red or orange',
    tips: ['Recite Hanumān Chālīsā on Tuesdays', 'Avoid anger and impulsive decisions', 'Physical exercise and discipline'],
  },
  Me: {
    name: 'Mercury (Budha)', color: '#34d399',
    gemstone: 'Emerald (Panna)', metal: 'Bronze', day: 'Wednesday',
    mantra: 'Om Brāṃ Brīṃ Braum Saḥ Budhāya Namaḥ',
    charity: 'Donate green vegetables, books, or green cloth on Wednesdays',
    fasting: 'Fast on Wednesdays',
    deity: 'Lord Viṣṇu / Budha Deva',
    color_wear: 'Green or grey',
    tips: ['Read and study regularly', 'Practice clear communication', 'Feed birds, especially parrots'],
  },
  Jp: {
    name: 'Jupiter (Guru)', color: '#fbbf24',
    gemstone: 'Yellow Sapphire (Pukhraj)', metal: 'Gold', day: 'Thursday',
    mantra: 'Om Grāṃ Grīṃ Graum Saḥ Guruve Namaḥ',
    charity: 'Donate yellow items, turmeric, or books on Thursdays',
    fasting: 'Fast on Thursdays',
    deity: 'Lord Brahmā / Dattātreya',
    color_wear: 'Yellow or golden',
    tips: ['Respect teachers and elders', 'Study scriptures or philosophy', 'Offer bananas to Lord Viṣṇu on Thursdays'],
  },
  Ve: {
    name: 'Venus (Śukra)', color: '#f472b6',
    gemstone: 'Diamond (Hīrā) or White Sapphire', metal: 'Silver', day: 'Friday',
    mantra: 'Om Drāṃ Drīṃ Draum Saḥ Śukrāya Namaḥ',
    charity: 'Donate white items, rice, or perfume on Fridays',
    fasting: 'Fast on Fridays',
    deity: 'Goddess Lakṣmī / Śukra Deva',
    color_wear: 'White, pink, or light colors',
    tips: ['Worship Goddess Lakṣmī on Fridays', 'Appreciate beauty and art', 'Maintain cleanliness and elegance'],
  },
  Sa: {
    name: 'Saturn (Śani)', color: '#94a3b8',
    gemstone: 'Blue Sapphire (Nīlam) — consult astrologer first', metal: 'Iron', day: 'Saturday',
    mantra: 'Om Prāṃ Prīṃ Praum Saḥ Śanaiścarāya Namaḥ',
    charity: 'Donate black sesame, iron, or oil on Saturdays',
    fasting: 'Fast on Saturdays',
    deity: 'Lord Śiva / Śani Deva',
    color_wear: 'Black, dark blue, or grey',
    tips: ['Serve the poor and elderly', 'Light sesame oil lamp on Saturdays', 'Practice patience and discipline'],
  },
  Ra: {
    name: 'Rāhu', color: '#a78bfa',
    gemstone: 'Hessonite Garnet (Gomed)', metal: 'Lead/Mixed metals', day: 'Saturday',
    mantra: 'Om Bhrāṃ Bhrīṃ Bhraum Saḥ Rāhave Namaḥ',
    charity: 'Donate blue or black items, coconut, or mustard on Saturdays',
    fasting: 'Fast on Saturdays',
    deity: 'Goddess Durgā / Bhairava',
    color_wear: 'Dark blue or black',
    tips: ['Recite Durgā Saptaśatī', 'Avoid intoxicants', 'Meditate during Rāhu Kāla'],
  },
  Ke: {
    name: 'Ketu', color: '#fb923c',
    gemstone: "Cat's Eye (Lahsuniya)", metal: 'Mixed metals', day: 'Tuesday',
    mantra: 'Om Srāṃ Srīṃ Sraum Saḥ Ketave Namaḥ',
    charity: 'Donate grey or mixed-color items, sesame, or blankets',
    fasting: 'Fast on Tuesdays',
    deity: 'Lord Gaṇeśa / Chitragupta',
    color_wear: 'Grey or mixed colors',
    tips: ['Practice meditation and detachment', 'Worship Lord Gaṇeśa', 'Serve spiritual teachers'],
  },
};

function RemedyCard({ planet, data, isWeak }) {
  const [open, setOpen] = useState(isWeak);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${data.color}25` }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ background: data.color + '0a' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: data.color + '20', color: data.color }}>
          {planet}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-100 sanskrit">{data.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">Gemstone: {data.gemstone.split(' (')[0]} · Day: {data.day}</div>
        </div>
        {isWeak && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(239,68,68,0.15)', color:'#fca5a5' }}>Needs attention</span>}
        {open ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0"/> : <ChevronDown size={14} className="text-gray-500 flex-shrink-0"/>}
      </button>

      {open && (
        <div className="px-4 py-4 border-t border-white/[0.05] space-y-3" style={{ background: data.color + '06' }}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Gemstone', value: data.gemstone },
              { label: 'Metal', value: data.metal },
              { label: 'Deity', value: data.deity },
              { label: 'Wear Color', value: data.color_wear },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg p-2.5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                <div className="text-xs font-medium text-gray-200">{value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg p-3" style={{ background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.15)' }}>
            <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Mantra</div>
            <div className="text-xs font-medium text-purple-200 sanskrit leading-relaxed">{data.mantra}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Practices</div>
            <ul className="space-y-1.5">
              {[data.charity, data.fasting, ...data.tips].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: data.color }}/>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const DEBILITATION = { Su:6, Mo:7, Ma:3, Me:11, Jp:9, Ve:5, Sa:0 };

export default function Remedies({ chartData }) {
  if (!chartData) return null;
  const { planets } = chartData;

  const weakPlanets = Object.entries(DEBILITATION)
    .filter(([p, sign]) => Math.floor(planets[p] / 30) === sign)
    .map(([p]) => p);

  const order = [...weakPlanets, ...Object.keys(PLANET_REMEDIES).filter(p => !weakPlanets.includes(p))];

  return (
    <div className="glass-dark glow-purple">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Remedies & Upāya</div>
        <div className="text-xs text-gray-500 mt-0.5">Gemstones, mantras, and practices for planetary balance</div>
        {weakPlanets.length > 0 && (
          <div className="mt-2 text-xs text-amber-400/80 flex items-center gap-1.5">
            ⚠️ Debilitated planets in your chart: {weakPlanets.map(p => PLANET_REMEDIES[p]?.name.split(' ')[0]).join(', ')} — remedies shown first
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        {order.map(p => PLANET_REMEDIES[p] && (
          <RemedyCard key={p} planet={p} data={PLANET_REMEDIES[p]} isWeak={weakPlanets.includes(p)} />
        ))}
      </div>
      <div className="px-5 py-3 border-t border-white/[0.05] text-xs text-gray-600 text-center">
        Consult a qualified Jyotiṣī before wearing gemstones. Mantras and charity are always safe.
      </div>
    </div>
  );
}
