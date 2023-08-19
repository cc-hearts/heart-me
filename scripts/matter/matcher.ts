import { hasOwn } from '@cc-heart/utils'

function objectTransformMatter(data: Record<string, string>) {
  let matter = '---\n'
  Object.entries(data).forEach(([key, value]) => {
    matter += `${key}: ${value}\n`
  })
  return `${matter}---`
}

export function replaceMdMatter(
  md: string,
  defaultMatters: Record<string, string>
) {
  const matchMatterRegex = /^---[\w\W]*?---/gm
  const [matcher] = md.trim().match(matchMatterRegex) || []
  if (typeof matcher === 'string') {
    let matterList = matcher.split('\n')
    const len = matterList.length
    matterList = matterList.slice(1, len - 1)
    const matters = matterList.reduce<Record<string, string>>((acc, matter) => {
      const [key, value] = matter.split(':')
      acc[key] = value.trim()
      return acc
    }, {})
    if (hasOwn(matters, 'date')) return
    const matter = objectTransformMatter({ ...matters, ...defaultMatters })
    return md.replace(matchMatterRegex, matter)
  }
}
