import { createFileRoute } from '@tanstack/react-router'
import { UniversalImport, type ImportField } from '@/components/UniversalImport'

export const Route = createFileRoute('/ja/texts/import')({
  component: TextsImportPage,
})

const importFields: ImportField[] = [
  { name: 'title', label: '标题', required: true },
  { name: 'content', label: '内容', required: true },
  { name: 'translation', label: '翻译', required: false },
  { name: 'vocabulary', label: '词汇列表', required: false, isArray: true },
  { name: 'grammar_points', label: '语法点', required: false, isArray: true },
  { name: 'level', label: '难度等级', required: false, options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
  { name: 'source', label: '来源', required: false },
]

function TextsImportPage() {
  const handleImport = async (data: any[], mode: 'flat' | 'nested') => {
    console.log('导入课文数据:', { data, mode })
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  return (
    <UniversalImport
      title="导入日语课文"
      description="支持嵌套模式和 Flat 模式，可文本粘贴或使用样本数据"
      backLink="/ja/texts"
      templates={[]}
      fields={importFields}
      onImport={handleImport}
    />
  )
}

export default TextsImportPage
