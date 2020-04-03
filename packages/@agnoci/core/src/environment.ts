export enum EnvironmentKey {
  branch = 'branch',
  commit = 'commit'
}

type EnvironmentKeyResolver = () => keyof typeof EnvironmentKey
type KeyResolver = (key: string) => string

export interface EnvironmentResolver {
  [key: string]: string | EnvironmentKeyResolver
}

export interface Environment {
  [key: string]: string
}

export const keys = {
  branch: () => () => EnvironmentKey.branch,
  commit: () => () => EnvironmentKey.commit
}

export function resolveEnvironment (env: EnvironmentResolver, resolveKey: KeyResolver): Environment {
  return Object.keys(env).reduce<Environment>((prev, key) => {
    const value = env[key]
    
    if (typeof value === 'string') return { ...prev, [key]: value }

    const resolvedKey = value()

    return { ...prev, [key]: resolveKey(resolvedKey) }
  }, {})
}
