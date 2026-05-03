import { Badge } from '../shared/Badge'

type NetworkStatusBadgeProps = {
  online: boolean
}

export function NetworkStatusBadge({ online }: NetworkStatusBadgeProps) {
  return <Badge tone={online ? 'success' : 'warning'}>{online ? 'Online' : 'Offline'}</Badge>
}