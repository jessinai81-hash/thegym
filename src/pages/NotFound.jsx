import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Page from '../components/Page.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function NotFound() {
  return (
    <Page>
      <EmptyState
        icon={Compass}
        title="Wrong turn at the squat rack"
        message="That page doesn’t exist (yet). Let’s get you back to your training."
        action={
          <Link to="/dashboard" className="btn-primary !py-2.5">
            Back to dashboard
          </Link>
        }
      />
    </Page>
  )
}
