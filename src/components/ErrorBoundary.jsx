import { Component } from 'react'
import { RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('PulseFit crashed:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center bg-bg p-6 text-fg">
        <div className="glass max-w-md p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-orange-400/15 text-3xl">😵‍💫</div>
          <h1 className="text-2xl font-bold">We pulled a muscle.</h1>
          <p className="mt-2 text-muted">
            Something went wrong on our side. Your progress is safe — give it another rep.
          </p>
          <button className="btn-primary mt-6" onClick={() => window.location.reload()}>
            <RotateCcw size={16} /> Reload PulseFit
          </button>
        </div>
      </div>
    )
  }
}
