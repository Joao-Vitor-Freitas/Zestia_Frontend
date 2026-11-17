import { Component } from 'react'
import Button from './Button'

export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(e) { console.error(e) }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="card space-y-3">
        <h2>Algo deu errado</h2>
        <p className="text-sm text-muted">Não foi possível exibir esta tela.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => this.setState({ error: null })}>Tentar novamente</Button>
          {this.props.onResetHome && (
            <Button
              variant="sec"
              onClick={() => {
                this.setState({ error: null })
                this.props.onResetHome()
              }}
            >
              Voltar para Ofertas
            </Button>
          )}
        </div>
      </div>
    )
  }
}
