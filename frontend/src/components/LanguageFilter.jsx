const LANGUAGES = [
  { key: 'all', label: 'All' },
  { key: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { key: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { key: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { key: 'English', label: 'English' },
  { key: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { key: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
];

export default function LanguageFilter({ activeLanguage, onLanguageChange }) {
  return (
    <div className="w-full px-6 md:px-14 pb-2.5 pt-0.5 flex items-center gap-2 overflow-x-auto">
      <span className="text-label-badge uppercase font-bold tracking-wider shrink-0 flex items-center gap-1 mr-1 text-[#B3B3B3]">
        <span className="material-symbols-outlined text-[14px]" style={{ color: '#ffb4aa' }}>translate</span>
        Languages:
      </span>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.key}
          onClick={() => onLanguageChange(lang.key)}
          className={`lang-pill shrink-0 flex items-center gap-1 ${
            activeLanguage === lang.key ? 'lang-pill-active' : 'lang-pill-inactive'
          }`}
        >
          <span>{lang.label}</span>
          {lang.native && (
            <span className="text-label-badge opacity-70">({lang.native})</span>
          )}
        </button>
      ))}
    </div>
  );
}
