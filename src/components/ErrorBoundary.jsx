import { Component } from 'react'
import Button from './Button'
import Icon from './Icon'
export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(e) { console.error(e) }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="card mx-auto max-w-lg text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-urgent-bg text-urgent-fg"><Icon name="alert" /></span>
        <h2>Algo deu errado</h2>
        <p className="mb-4 mt-1 text-muted">Não foi possível exibir esta tela.</p>
        <Button onClick={() => this.setState({ error: null })}>Tentar novamente</Button>
      </div>
    )
  }
}
