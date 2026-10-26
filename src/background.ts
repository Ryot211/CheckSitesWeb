import { getBadge } from './core/badge'
import { analyzeUrl } from './core/url-analyzer'

function updateBadge(tabId: number, url: string) {
  const score = url.startsWith('http') ? analyzeUrl(url).score : 0
  const badge = getBadge(score)

  chrome.action.setBadgeText({ tabId, text: badge.text })
  chrome.action.setBadgeBackgroundColor({ tabId, color: badge.color })
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateBadge(tabId, tab.url ?? '')
  }
})
