import { Component } from 'react'
import Button from './Button'
export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(e) { console.error(e) }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="card">
        <h2>Algo deu errado</h2>
        <p className="mb-3">Não foi possível exibir esta tela.</p>
        <Button onClick={() => this.setState({ error: null })}>Tentar novamente</Button>
      </div>
    )
  }
}
