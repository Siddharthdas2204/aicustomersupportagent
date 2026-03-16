import { useParams } from 'react-router-dom'
import SupportWidget from '../../components/widget/SupportWidget'

const WidgetView = () => {
  const { kbId } = useParams()
  return (
    <div className="bg-transparent h-screen w-screen overflow-hidden">
      <SupportWidget kbId={kbId} />
    </div>
  )
}

export default WidgetView
