import { createFileRoute } from '@tanstack/react-router'
import { UniversalImport, type ImportField } from '@/components/UniversalImport'

export const Route = createFileRoute('/ja/grammar/import')({
  component: GrammarImportPage,
})

const importFields: ImportField[] = [
  { name: 'grammar_point', label: '语法点', required: true },
  { name: 'pattern', label: '接续模式', required: true },
  { name: 'meaning', label: '意思', required: true },
  { name: 'explanation', label: '详细解释', required: false },
  { name: 'examples', label: '例句', required: true, isArray: true },
  { name: 'level', label: 'JLPT等级', required: false, options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
  { name: 'related_grammar', label: '相关语法', required: false, isArray: true },
]

function GrammarImportPage() {
  const handleImport = async (data: any[], mode: 'flat' | 'nested') => {
    console.log('导入语法数据:', { data, mode })
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  return (
    <UniversalImport
      title="导入日语语法"
      description="支持嵌套模式和 Flat 模式，可文本粘贴或使用样本数据"
      backLink="/ja/grammar"
      templates={[]}
      fields={importFields}
      onImport={handleImport}
    />
  )
}

export default GrammarImportPage
