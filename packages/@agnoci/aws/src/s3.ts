import * as agnoci from '@agnoci/core'

interface SyncParameters {
  'dryrun'?: boolean,
  'quiet'?: boolean,
  'include'?: string,
  'exclude'?: string,
  'acl'?: string,
  'follow-symlinks'?: boolean,
  'no-follow-symlinks'?: boolean,
  'no-guess-mime-type'?: boolean,
  'sse'?: 'AES256' | 'aws:kms',
  'sse-c'?: string,
  'sse-c-key'?: string,
  'sse-kms-key-id'?: string,
  'sse-c-copy-source-key'?: string,
  'storage-class'?: 'STANDARD' | 'REDUCED_REDUNDANCY' | 'STANDARD_IA' | 'ONEZONE_IA' | 'INTELLIGENT_TIERING' | 'GLACIER' | 'DEEP_ARCHIVE',
  'grants'?: string,
  'website-redirect'?: string,
  'content-type'?: string,
  'cache-control'?: string,
  'content-disposition'?: string,
  'content-encoding'?: string,
  'content-language'?: string,
  'expires'?: string,
  'source-region'?: string,
  'only-show-errors'?: boolean,
  'no-progress'?: boolean,
  'page-size'?: number,
  'ignore-glacier-warnings'?: boolean,
  'force-glacier-transfer'?: boolean,
  'request-payer'?: boolean,
  'metadata'?: { [key: string]: string },
  'metadata-directive'?: string,
  'size-only'?: boolean,
  'extact-timestamps'?: boolean,
  'delete'?: boolean
}

export function sync (source: string, destination: string, params?: SyncParameters, opts?: agnoci.NodeOpts): agnoci.Node {
  const baseCommand = `aws s3 sync ${source} ${destination}`
  const args: string[] = []

  for (const key in params) {
    let value = params[key]

    if (typeof value === 'object') value = JSON.stringify(value)
    args.push(`--${key} ${value}`)    
  }

  return agnoci.command(`${baseCommand} ${args.join(' ')}`, opts)
}
