import { createFileRoute } from '@tanstack/react-router'
import { UniversalImport, type ImportField } from '@/components/UniversalImport'

export const Route = createFileRoute('/ja/idioms/import')({
  component: IdiomsImportPage,
})

const importFields: ImportField[] = [
  { name: 'idiom', label: '惯用语', required: true },
  { name: 'reading', label: '读音', required: true },
  { name: 'meaning', label: '意思', required: true },
  { name: 'literal_meaning', label: '字面意思', required: false },
  { name: 'examples', label: '例句', required: false, isArray: true },
  { name: 'origin', label: '出处/来源', required: false },
  { name: 'level', label: '难度等级', required: false, options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
]

function IdiomsImportPage() {
  const handleImport = async (data: any[], mode: 'flat' | 'nested') => {
    console.log('导入惯用语数据:', { data, mode })
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  return (
    <UniversalImport
      title="导入日语惯用语"
      description="支持嵌套模式和 Flat 模式，可文本粘贴或使用样本数据"
      backLink="/ja/idioms"
      templates={[]}
      fields={importFields}
      onImport={handleImport}
    />
  )
}

export default IdiomsImportPage
