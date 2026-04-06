import { createFileRoute } from '@tanstack/react-router'
import { UniversalImport, type ImportField } from '@/components/UniversalImport'

export const Route = createFileRoute('/ja/vocabulary/import')({
  component: VocabularyImportPage,
})

const importFields: ImportField[] = [
  { name: 'term', label: '词条', required: true },
  { name: 'kana', label: '假名读音', required: true },
  { name: 'accent', label: '音调', required: false },
  { name: 'pos', label: '词性', required: true, type: 'select', options: ['名詞', '動詞', 'イ形容詞', 'ナ形容詞', '副詞', '助詞', '接続詞'] },
  { name: 'glosses', label: '释义', required: true, isArray: true },
  { name: 'examples', label: '例句', required: false, isArray: true },
  { name: 'level', label: 'JLPT等级', required: false, options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
]

function VocabularyImportPage() {
  const handleImport = async (data: any[], mode: 'flat' | 'nested') => {
    // TODO: 调用后端 API 导入数据
    console.log('导入词汇数据:', { data, mode })
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 实际项目中应该调用：
    // const response = await fetch('/api/learning/import/vocabulary/', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ data, mode })
    // })
    
    // if (!response.ok) throw new Error('导入失败')
  }

  return (
    <UniversalImport
      title="导入日语词汇"
      description="支持嵌套模式和 Flat 模式，可文本粘贴或使用样本数据"
      backLink="/ja/vocabulary"
      templates={[]}
      fields={importFields}
      onImport={handleImport}
    />
  )
}

export default VocabularyImportPage
