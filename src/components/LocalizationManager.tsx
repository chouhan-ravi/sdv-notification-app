/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Rule, CarOwnerSetting, RuleTranslation } from '../types';
import { 
  Globe, 
  Languages, 
  Check, 
  Save, 
  Sparkles, 
  User, 
  Car, 
  AlertCircle, 
  Eye, 
  Info,
  RefreshCw
} from 'lucide-react';

interface TranslationManagerProps {
  rules: Rule[];
  userSettings: CarOwnerSetting[];
  onUpdateRule: (updatedRule: Rule) => void;
  onUpdateUserSettings: (updatedSettings: CarOwnerSetting[]) => void;
  triggerToast: (msg: string) => void;
}

const SUPPORTED_LOCALES = [
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸', greeting: 'Hola' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷', greeting: 'Bonjour' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪', greeting: 'Hallo' },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳', greeting: '你好' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵', greeting: 'こんにちは' }
];

// Pre-seeded high quality translations for the default rules to make the experience feel incredibly rich
const PRE_SEEDED_TRANSLATIONS: Record<string, Record<string, { title: string; body: string }>> = {
  RULE_REM_START_SUCCESS_CONFIRM: {
    es: {
      title: "Arranque Remoto Exitoso",
      body: "Su motor está en marcha. La temperatura de la cabina es de {vehicle_state_snapshot.hvac_status.cabin_temp_c}°C."
    },
    fr: {
      title: "Démarrage à Distance Réussi",
      body: "Votre moteur tourne. La température de l'habitacle est de {vehicle_state_snapshot.hvac_status.cabin_temp_c}°C."
    },
    de: {
      title: "Fernstart Erfolgreich",
      body: "Ihr Motor läuft. Die Kabinentemperatur beträgt {vehicle_state_snapshot.hvac_status.cabin_temp_c}°C."
    },
    zh: {
      title: "远程启动成功",
      body: "您的发动机正在运行。车厢温度为 {vehicle_state_snapshot.hvac_status.cabin_temp_c}°C。"
    },
    ja: {
      title: "リモート起動成功",
      body: "エンジンが始動しました。車内温度は {vehicle_state_snapshot.hvac_status.cabin_temp_c}°C です。"
    }
  },
  RULE_ENGINE_OVERHEAT: {
    es: {
      title: "ALERTA: Sobrecalentamiento del Motor",
      body: "¡Peligro crítico de temperatura! Temperatura del refrigerante: {vehicle_state_snapshot.engine_coolant_temp_c}°C. Por favor, deténgase inmediatamente."
    },
    fr: {
      title: "ALERTE: Surchauffe Moteur",
      body: "Danger de température critique! Liquide de refroidissement: {vehicle_state_snapshot.engine_coolant_temp_c}°C. Veuillez vous arrêter immédiatement."
    },
    de: {
      title: "WARNUNG: Motorüberhitzung",
      body: "Kritische Temperaturgefahr! Kühlmitteltemperatur: {vehicle_state_snapshot.engine_coolant_temp_c}°C. Bitte sofort anhalten."
    },
    zh: {
      title: "警告：发动机过热",
      body: "关键温度危险！冷却液温度：{vehicle_state_snapshot.engine_coolant_temp_c}°C。请立即停车。"
    },
    ja: {
      title: "警告：エンジン過熱",
      body: "致命的な温度異常！冷却水温度: {vehicle_state_snapshot.engine_coolant_temp_c}°C。ただちに停車してください。"
    }
  },
  RULE_CHARGE_LIMIT_REACHED: {
    es: {
      title: "Carga de Batería Completa",
      body: "Su vehículo ha alcanzado el límite de carga establecido. SOC actual: {vehicle_state_snapshot.battery_soc_pct}%."
    },
    fr: {
      title: "Recharge Batterie Terminée",
      body: "Votre véhicule a atteint sa limite de charge définie. SOC actuel: {vehicle_state_snapshot.battery_soc_pct}%."
    },
    de: {
      title: "Ladegrenze Erreicht",
      body: "Ihr Fahrzeug hat das eingestellte Ladelimit erreicht. Aktueller SOC: {vehicle_state_snapshot.battery_soc_pct}%."
    },
    zh: {
      title: "电池充电已达上限",
      body: "您的车辆已达到设定的充电限制。当前电量 (SOC)：{vehicle_state_snapshot.battery_soc_pct}%。"
    },
    ja: {
      title: "充電制限到達",
      body: "充電が設定された上限に達しました。現在の充電状態 (SOC): {vehicle_state_snapshot.battery_soc_pct}%。"
    }
  }
};

export default function TranslationManager({
  rules,
  userSettings,
  onUpdateRule,
  onUpdateUserSettings,
  triggerToast
}: TranslationManagerProps) {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const [activeLocaleCode, setActiveLocaleCode] = useState<string>('es');

  // Find currently selected rule
  const currentRule = rules.find(r => r.id === selectedRuleId) || rules[0];

  // Translation states for currently active rule + active locale
  const activeTranslation = currentRule?.translations?.find(t => t.locale === activeLocaleCode) || {
    locale: activeLocaleCode,
    notificationTitle: '',
    notificationBody: ''
  };

  const [inputTitle, setInputTitle] = useState(activeTranslation.notificationTitle);
  const [inputBody, setInputBody] = useState(activeTranslation.notificationBody);

  // Sync state when selected rule or active locale changes
  React.useEffect(() => {
    if (currentRule) {
      const trans = currentRule.translations?.find(t => t.locale === activeLocaleCode);
      setInputTitle(trans?.notificationTitle || '');
      setInputBody(trans?.notificationBody || '');
    }
  }, [selectedRuleId, activeLocaleCode, currentRule]);

  // Handle saving translation for the selected rule
  const handleSaveTranslation = () => {
    if (!currentRule) return;

    // Placeholders validator
    const originalPlaceholders = currentRule.notificationBody.match(/\{([^}]+)\}/g) || [];
    const translatedPlaceholders = inputBody.match(/\{([^}]+)\}/g) || [];

    const missing = originalPlaceholders.filter(p => !translatedPlaceholders.includes(p));
    if (missing.length > 0) {
      if (!window.confirm(`Warning: The translated body is missing some dynamic telemetry placeholders from the original text (${missing.join(', ')}). Saving might result in incomplete live telemetry rendering for car owners. Save anyway?`)) {
        return;
      }
    }

    const nextTranslations = [...(currentRule.translations || [])];
    const existingIndex = nextTranslations.findIndex(t => t.locale === activeLocaleCode);

    const newTrans: RuleTranslation = {
      locale: activeLocaleCode,
      notificationTitle: inputTitle,
      notificationBody: inputBody
    };

    if (existingIndex >= 0) {
      nextTranslations[existingIndex] = newTrans;
    } else {
      nextTranslations.push(newTrans);
    }

    const updatedRule: Rule = {
      ...currentRule,
      translations: nextTranslations
    };

    onUpdateRule(updatedRule);
    triggerToast(`Translation saved for rule [${currentRule.ruleKey}] in ${SUPPORTED_LOCALES.find(l => l.code === activeLocaleCode)?.name}`);
  };

  // AI-Assisted Auto-translation Simulation
  const handleAIAssist = () => {
    if (!currentRule) return;

    const ruleKey = currentRule.ruleKey;
    const seeded = PRE_SEEDED_TRANSLATIONS[ruleKey]?.[activeLocaleCode];

    if (seeded) {
      setInputTitle(seeded.title);
      setInputBody(seeded.body);
      triggerToast('AI Assistant populated authentic pre-translated templates!');
    } else {
      // Procedural generator that retains placeholders
      const placeHolderMatches = currentRule.notificationBody.match(/\{([^}]+)\}/g) || [];
      
      let generatedTitle = `[${activeLocaleCode.toUpperCase()}] ` + currentRule.notificationTitle;
      let generatedBody = `[${activeLocaleCode.toUpperCase()}] ` + currentRule.notificationBody;

      if (activeLocaleCode === 'es') {
        generatedTitle = `Confirmación: ` + currentRule.notificationTitle;
        generatedBody = `Aviso del sistema: ` + currentRule.notificationBody + ` (Traducido automáticamente)`;
      } else if (activeLocaleCode === 'fr') {
        generatedTitle = `Notification: ` + currentRule.notificationTitle;
        generatedBody = `Alerte du véhicule: ` + currentRule.notificationBody + ` (Traduit automatiquement)`;
      } else if (activeLocaleCode === 'de') {
        generatedTitle = `Fahrzeug-Meldung: ` + currentRule.notificationTitle;
        generatedBody = `Systemwarnung: ` + currentRule.notificationBody + ` (Automatisch übersetzt)`;
      }

      setInputTitle(generatedTitle);
      setInputBody(generatedBody);
      triggerToast('Procedural translator formulated local templates!');
    }
  };

  // Update preferred language for a specific car owner
  const handleUpdateOwnerLanguage = (id: string, language: string) => {
    const updated = userSettings.map(setting => {
      if (setting.id === id) {
        return { ...setting, language };
      }
      return setting;
    });
    onUpdateUserSettings(updated);
    triggerToast('Updated vehicle owner language preference');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 font-display uppercase tracking-wide flex items-center">
              <Languages className="h-5 w-5 text-fuchsia-400 mr-2 shrink-0 animate-pulse" />
              Notification Locale & i18n Studio
            </h2>
            <p className="text-slate-400 text-xs font-sans max-w-2xl leading-relaxed">
              Define multi-language translated templates for vehicle notifications. Intercept raw CAN-bus telemetry thresholds and render customized warnings according to each car owner's registered language preferences.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-850 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">i18n ENGINE: COMPILED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: RULE SELECTOR & TEMPLATE FORM */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            
            {/* Rule Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                Select Notification Ingestion Rule
              </label>
              <select
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700 font-mono cursor-pointer"
              >
                {rules.map(rule => (
                  <option key={rule.id} value={rule.id}>
                    {rule.name} ({rule.ruleKey})
                  </option>
                ))}
              </select>
            </div>

            {currentRule && (
              <div className="space-y-5">
                
                {/* Default English Reference View */}
                <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-slate-400 font-mono flex items-center">
                      <Globe className="h-3.5 w-3.5 text-indigo-400 mr-1.5" />
                      DEFAULT TEMPLATE REFERENCE (English - en)
                    </span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-500/20">
                      Primary
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">DEFAULT TITLE</span>
                      <p className="text-sm font-semibold text-slate-200">{currentRule.notificationTitle}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">DEFAULT BODY TEMPLATE</span>
                      <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-900/50 p-2 rounded border border-slate-850">
                        {currentRule.notificationBody}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Target Locale Tabs */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                    Target Translation Locale
                  </label>
                  <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    {SUPPORTED_LOCALES.map(loc => (
                      <button
                        key={loc.code}
                        type="button"
                        onClick={() => setActiveLocaleCode(loc.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                          activeLocaleCode === loc.code
                            ? 'bg-fuchsia-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        <span>{loc.flag}</span>
                        <span>{loc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Translation Form Inputs */}
                <div className="space-y-4 pt-2 border-t border-slate-850">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-fuchsia-400 font-mono uppercase flex items-center">
                      <Languages className="h-4 w-4 mr-1.5" />
                      Configure {SUPPORTED_LOCALES.find(l => l.code === activeLocaleCode)?.name} Text
                    </span>
                    
                    <button
                      type="button"
                      onClick={handleAIAssist}
                      className="text-[10px] font-mono font-bold bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20 px-2.5 py-1 rounded-lg border border-fuchsia-500/30 flex items-center space-x-1 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      <span>AI AUTO-TRANSLATE</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-400">
                        TRANSLATED TITLE
                      </label>
                      <input
                        type="text"
                        value={inputTitle}
                        onChange={(e) => setInputTitle(e.target.value)}
                        placeholder={`e.g. ${SUPPORTED_LOCALES.find(l => l.code === activeLocaleCode)?.greeting}...`}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-fuchsia-500 transition font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono font-bold text-slate-400">
                          TRANSLATED BODY TEMPLATE
                        </label>
                        <span className="text-[9px] font-mono text-slate-500">
                          Keep matching {"{placeholders}"}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={inputBody}
                        onChange={(e) => setInputBody(e.target.value)}
                        placeholder="Type translated alert template..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-fuchsia-500 transition font-mono whitespace-pre-wrap"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveTranslation}
                      className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg flex items-center space-x-2 transition shadow-lg shadow-fuchsia-600/10"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Locale Template</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: CAR OWNER LANG PREFERENCES & SIMULATOR LOG LINK */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Owner Preference Registry Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center">
                <User className="h-4 w-4 text-indigo-400 mr-1.5" />
                Owner Language Prefs
              </h3>
              <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 border border-slate-850">
                {userSettings.length} Owners
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Simulate push notifications by changing any registered car owner's preferred locale. Matches will deliver dynamically in the chosen language.
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {userSettings.map(setting => {
                const activeLang = setting.language || 'en';
                return (
                  <div key={setting.id} className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        <span>{setting.userId}</span>
                      </div>
                      
                      <div className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {setting.vin.substring(0, 6)}...
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                      <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center">
                        <Car className="h-3 w-3 mr-1 text-slate-500" />
                        {setting.categoryKey}
                      </span>
                      
                      <select
                        value={activeLang}
                        onChange={(e) => handleUpdateOwnerLanguage(setting.id, e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded px-1.5 py-0.5 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-fuchsia-500 cursor-pointer"
                      >
                        <option value="en">🇺🇸 English</option>
                        <option value="es">🇪🇸 Spanish</option>
                        <option value="fr">🇫🇷 French</option>
                        <option value="de">🇩🇪 German</option>
                        <option value="zh">🇨🇳 Chinese</option>
                        <option value="ja">🇯🇵 Japanese</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* i18n Verification / Telemetry Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center">
              <Eye className="h-4 w-4 text-fuchsia-400 mr-1.5" />
              i18n Translation Sandbox
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-normal">
              Below is the active translation registry status for the selected rule. If a customer is registered in a language that has no configured template, the gateway defaults safely to the English fallback.
            </p>

            <div className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 space-y-3">
              <div className="text-xs font-bold text-slate-300 font-mono pb-1.5 border-b border-slate-900 flex justify-between">
                <span>LOCALE MATRIX</span>
                <span className="text-fuchsia-400 font-mono">STATUS</span>
              </div>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-400">
                  <span>🇺🇸 English (en)</span>
                  <span className="text-emerald-400 text-[10px] flex items-center">
                    <Check className="h-3 w-3 mr-1" /> ACTIVE (fallback)
                  </span>
                </div>
                {SUPPORTED_LOCALES.map(loc => {
                  const isTranslated = currentRule?.translations?.some(t => t.locale === loc.code && t.notificationBody);
                  return (
                    <div key={loc.code} className="flex justify-between items-center text-slate-400">
                      <span>{loc.flag} {loc.name.split(' ')[0]} ({loc.code})</span>
                      {isTranslated ? (
                        <span className="text-emerald-400 text-[10px] flex items-center font-bold">
                          <Check className="h-3 w-3 mr-1" /> CONFIGURED
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px] flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> FALLBACK TO EN
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
