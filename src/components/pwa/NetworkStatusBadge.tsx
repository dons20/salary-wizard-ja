import { Badge } from '../shared/Badge'

type NetworkStatusBadgeProps = {
  online: boolean
}

export function NetworkStatusBadge({ online }: NetworkStatusBadgeProps) {
  return (
    <Badge tone={online ? 'success' : 'warning'} dataTestId="network-status-badge">
      {online ? 'Online' : 'Offline'}
    </Badge>
  )
}