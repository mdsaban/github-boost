console.log('background script loaded')
import { getStorage, setStorage } from '../../utils'

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'iconClicked' })
})
