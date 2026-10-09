import { useEffect } from 'react'
import { getFactorySnapshot, subscribeToLiveUpdates } from '../services/factoryApi'
import { loadSettings } from '../services/settingsService'
import { useFactoryStore } from './useFactoryStore'

/** Loads the factory snapshot once and keeps machine data live. */
export function useFactoryData() {
  const setSnapshot = useFactoryStore((s) => s.setSnapshot)
  const setMachines = useFactoryStore((s) => s.setMachines)
  const setError = useFactoryStore((s) => s.setError)

  useEffect(() => {
    let unsub = () => {}
    let cancelled = false
    loadSettings()
      .then((settings) => {
        if (!cancelled) useFactoryStore.getState().applySettings(settings, { display: true })
        return getFactorySnapshot()
      })
      .then((snap) => {
        if (cancelled) return
        setSnapshot(snap)
        unsub = subscribeToLiveUpdates(setMachines)
      })
      .catch((e) => setError(e.message))
    return () => {
      cancelled = true
      unsub()
    }
  }, [setSnapshot, setMachines, setError])
}
