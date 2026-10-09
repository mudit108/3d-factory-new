// Places every worker from the EMS roster in the scene.
import { useMemo } from 'react'
import { loomPlacements } from '../data/layout'
import { useFactoryStore } from '../hooks/useFactoryStore'
import { Worker } from '../components/Worker'
import { Interactive } from '../components/Interactive'

// Named posts for non-operator staff. Paths are [x, z] waypoints (ping-pong).
const POSTS = {
  'yarn-keeper': { position: [-42.4, 0, -7.5], rotation: -Math.PI / 2 },
  'yarn-carrier': { position: [-42.4, 0, -4], path: [[-42.4, -4], [-42.4, 12.4], [-35.2, 12.4], [-35.2, -2.2], [-16, -2.2]], speed: 1.1, pause: 2.2, vest: true },
  'roll-mover': { position: [20.6, 0, -2.2], path: [[20.6, -2.2], [27.0, -2.2], [27.0, -8.2], [38.5, -8.2]], speed: 1.0, pause: 2.4, vest: true, carryColor: '#e2ddcf' },
  'fg-keeper': { position: [41.5, 0, -17.2], rotation: Math.PI },
}

function postFor(worker, machinesById) {
  const loom = loomPlacements.find((p) => p.id === worker.station)
  if (loom) {
    const m = machinesById[loom.id]
    const [x, , z] = loom.position
    if (m?.status === 'maintenance') return { position: [x - 2.35, 0, z + 0.35], rotation: Math.PI / 2 }
    if (m?.status === 'idle') return { position: [x + 1.2, 0, z + 1.75], rotation: Math.PI * 0.85 }
    return { position: [x + 0.2, 0, z + 1.6], rotation: Math.PI }
  }
  return POSTS[worker.station] || { position: [0, 0, 0], rotation: 0 }
}

export default function WorkersLayer() {
  const workers = useFactoryStore((s) => s.workers)
  const machines = useFactoryStore((s) => s.machines)
  const statusKey = machines.map((m) => m.status).join(',')
  const machinesById = useMemo(
    () => Object.fromEntries(machines.map((m) => [m.id, m])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusKey],
  )
  const placed = useMemo(() => workers.map((w, i) => ({ w, i, post: postFor(w, machinesById) })), [workers, machinesById])

  return (
    <group>
      {placed.map(({ w, i, post }) => (
        <Interactive key={w.id} type="worker" id={w.id} label={`${w.name} (${w.id})`} sub={w.role}>
          <Worker
            appearance={w.appearance}
            activity={w.activity}
            position={post.position}
            rotation={post.rotation ?? 0}
            path={post.path}
            speed={post.speed}
            pause={post.pause}
            vest={post.vest}
            carryColor={post.carryColor}
            seed={i + 1}
            scale={0.96 + ((i * 37) % 9) / 100}
          />
        </Interactive>
      ))}
    </group>
  )
}
