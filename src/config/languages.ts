// 多语言学习平台配置
export interface LanguageFeatures {
  hasKanji?: boolean;
  hasTones?: boolean;
  hasConjugation?: boolean;
  hasGender?: boolean;
  hasCases?: boolean;
  hasHonorifics?: boolean;
  hasPhoneticScript?: boolean;
}

export interface ImportField {
  name: string;
  label: string;
  required: boolean;
  isArray?: boolean;
  type?: 'string' | 'number' | 'select' | 'array';
  options?: string[];
}

export interface ImportTemplate {
  name: string;
  format: 'csv' | 'json' | 'yaml' | 'excel' | 'anki';
  module: string;
  description?: string;
}

export interface LearningModule {
  id: string;
  name: string;
  icon: string;
  description?: string;
  submodules?: string[];
  nodeTypes?: string[];
  fields?: string[];
  importFormats: ('csv' | 'json' | 'yaml' | 'excel' | 'anki')[];
  importFields: ImportField[];
  templates?: ImportTemplate[];
  config?: Record<string, any>;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  writingSystem: 'latin' | 'hanzi' | 'kana' | 'hangul' | 'cyrillic' | 'mixed';
  direction: 'ltr' | 'rtl';
  features: LanguageFeatures;
  modules: LearningModule[];
  levels: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// 日语配置
export const japaneseConfig: LanguageConfig = {
  code: 'ja',
  name: 'Japanese',
  nativeName: '日本語',
  flag: '🇯🇵',
  writingSystem: 'mixed',
  direction: 'ltr',
  features: {
    hasKanji: true,
    hasConjugation: true,
    hasHonorifics: true,
    hasPhoneticScript: true,
  },
  levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
  colors: { primary: '#DC2626', secondary: '#1E3A8A', accent: '#F59E0B' },
  modules: [
    {
      id: 'vocabulary',
      name: '词汇',
      icon: 'BookOpen',
      description: '日语词汇学习，包含词条、读音、义项、例句',
      submodules: ['n5', 'n4', 'n3', 'n2', 'n1'],
      nodeTypes: ['TERM_ROOT', 'READING', 'SENSE', 'GLOSS', 'EXAMPLE', 'FORM'],
      importFormats: ['yaml', 'json', 'csv'],
      importFields: [
        { name: 'term', label: '词条', required: true },
        { name: 'kana', label: '假名读音', required: true },
        { name: 'accent', label: '音调', required: false },
        { name: 'pos', label: '词性', required: true, type: 'select', options: ['名詞', '動詞', 'イ形容詞', 'ナ形容詞', '副詞'] },
        { name: 'meanings', label: '释义', required: true, isArray: true },
        { name: 'examples', label: '例句', required: false, isArray: true },
        { name: 'jlpt', label: 'JLPT等级', required: false, options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
      ],
      templates: [
        { name: 'JLPT N5词汇表', format: 'yaml', module: 'vocabulary', description: '完整N5词汇，含读音、义项、例句' },
        { name: 'CSV简单格式', format: 'csv', module: 'vocabulary', description: '词条,假名,释义' },
      ],
    },
    {
      id: 'grammar',
      name: '语法',
      icon: 'GitBranch',
      description: '日语语法点，包含接续、用法说明、例句',
      submodules: ['n5', 'n4', 'n3', 'n2', 'n1'],
      importFormats: ['yaml', 'json'],
      importFields: [
        { name: 'grammar_point', label: '语法点', required: true },
        { name: 'pattern', label: '接续模式', required: true },
        { name: 'meaning', label: '意思', required: true },
        { name: 'examples', label: '例句', required: true, isArray: true },
        { name: 'jlpt', label: 'JLPT等级', required: false },
      ],
    },
    {
      id: 'texts',
      name: '课文',
      icon: 'BookText',
      description: '日语课文、会话、阅读材料',
      submodules: ['n5', 'n4', 'n3', 'n2', 'n1'],
      importFormats: ['yaml', 'json'],
      importFields: [
        { name: 'title', label: '标题', required: true },
        { name: 'content', label: '课文内容', required: true },
        { name: 'translation', label: '翻译', required: false },
        { name: 'vocabulary', label: '词汇列表', required: false, isArray: true },
        { name: 'level', label: '等级', required: false },
      ],
    },
    {
      id: 'idioms',
      name: '惯用语',
      icon: 'Quote',
      description: '日语惯用语、成语',
      importFormats: ['yaml', 'json'],
      importFields: [
        { name: 'idiom', label: '惯用语', required: true },
        { name: 'reading', label: '读音', required: true },
        { name: 'meaning', label: '意思', required: true },
        { name: 'examples', label: '例句', required: false, isArray: true },
      ],
    },
  ],
};

// 英语配置
export const englishConfig: LanguageConfig = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  flag: '🇬🇧',
  writingSystem: 'latin',
  direction: 'ltr',
  features: { hasConjugation: true },
  levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  colors: { primary: '#1D4ED8', secondary: '#7C3AED', accent: '#F59E0B' },
  modules: [
    {
      id: 'vocabulary',
      name: 'Vocabulary',
      icon: 'BookOpen',
      importFormats: ['csv', 'json', 'excel', 'anki'],
      importFields: [
        { name: 'word', label: 'Word', required: true },
        { name: 'phonetic', label: 'IPA', required: false },
        { name: 'pos', label: 'Part of Speech', required: true },
        { name: 'meanings', label: 'Meanings', required: true, isArray: true },
        { name: 'cefr', label: 'CEFR Level', required: false, options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
      ],
    },
    {
      id: 'grammar',
      name: 'Grammar',
      icon: 'GitBranch',
      importFormats: ['yaml', 'json'],
      importFields: [
        { name: 'title', label: 'Grammar Point', required: true },
        { name: 'explanation', label: 'Explanation', required: true },
        { name: 'examples', label: 'Examples', required: true, isArray: true },
      ],
    },
  ],
};

// 中文配置
export const chineseConfig: LanguageConfig = {
  code: 'zh',
  name: 'Chinese',
  nativeName: '中文',
  flag: '🇨🇳',
  writingSystem: 'hanzi',
  direction: 'ltr',
  features: { hasKanji: true, hasTones: true, hasPhoneticScript: true },
  levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
  colors: { primary: '#DC2626', secondary: '#F59E0B', accent: '#7C3AED' },
  modules: [
    {
      id: 'vocabulary',
      name: '词汇',
      icon: 'BookOpen',
      importFormats: ['csv', 'json', 'yaml'],
      importFields: [
        { name: 'word', label: '词语', required: true },
        { name: 'pinyin', label: '拼音', required: true },
        { name: 'tone', label: '声调', required: false },
        { name: 'meanings', label: '释义', required: true, isArray: true },
        { name: 'hsk', label: 'HSK等级', required: false },
      ],
    },
    {
      id: 'characters',
      name: '汉字',
      icon: 'Pencil',
      importFormats: ['csv', 'json'],
      importFields: [
        { name: 'character', label: '汉字', required: true },
        { name: 'pinyin', label: '拼音', required: true },
        { name: 'strokes', label: '笔画数', required: false, type: 'number' },
        { name: 'radical', label: '部首', required: false },
      ],
    },
    {
      id: 'chengyu',
      name: '成语',
      icon: 'Quote',
      importFormats: ['csv', 'json'],
      importFields: [
        { name: 'idiom', label: '成语', required: true },
        { name: 'pinyin', label: '拼音', required: true },
        { name: 'meaning', label: '意思', required: true },
      ],
    },
  ],
};

export const languages: LanguageConfig[] = [japaneseConfig, englishConfig, chineseConfig];

export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return languages.find(lang => lang.code === code);
}

export function getLanguageModule(langCode: string, moduleId: string): LearningModule | undefined {
  const lang = getLanguageConfig(langCode);
  return lang?.modules.find(m => m.id === moduleId);
}

export default languages;
