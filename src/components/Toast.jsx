import { useApp } from '../context'
import Icon from './Icon'

// As regiões ao vivo ficam sempre no DOM; só o conteúdo muda. Assim os leitores de tela anunciam toda mensagem.
export default function Toast() {
  const { msg } = useApp()
  return (
    <div className="toast">
      <div role="status">{msg?.type === 'ok' && <p className="toast-msg ok"><Icon name="check" className="mt-0.5 text-zest" />{msg.text}</p>}</div>
      <div role="alert">{msg?.type === 'error' && <p className="toast-msg error"><Icon name="alert" className="mt-0.5" />{msg.text}</p>}</div>
    </div>
  )
}
