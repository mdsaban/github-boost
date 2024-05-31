import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'

import Header from './Header'
import Footer from './Footer'
import Empty from './Empty'

import './style.css'
const div = document.createElement('div')
div.id = '__root'
document.body.appendChild(div)
import {
  getStorage,
  setStorage,
  collapseAllFiles,
  uncollapseAllFiles,
  addCustomLineChange,
  removeCustomLineChange,
  dimFiles,
  removeDimFiles,
} from '../../utils'

const rootContainer = document.querySelector('#__root')
if (!rootContainer) throw new Error("Can't find Content root element")
const root = createRoot(rootContainer)
// const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

const toggleDimFiles = (isChecked) => {
  if (isChecked) dimFiles()
  else removeDimFiles()
}

const toggleCustomLine = (isChecked) => {
  if (isChecked) addCustomLineChange()
  else removeCustomLineChange()
}

const initExtension = () => {
  const form = document.querySelectorAll('.Layout-main .file')
  form.forEach((item) => {
    observer.observe(item, {
      attributes: true,
    })
  })
  setTimeout(async () => {
    let customLines = await getStorage('customLines')
    let dimFiles = await getStorage('dimFiles')
    toggleCustomLine(customLines)
    toggleDimFiles(dimFiles)
  }, 500)
}

var observer = new MutationObserver(function (mutations) {
  mutations.forEach(async function (mutation) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-file-user-viewed') {
      const dimFiles = await getStorage('dimFiles')
      toggleDimFiles(dimFiles)
      if (document.querySelector('#customLines')?.checked) addCustomLineChange()
    }
  })
})

const App = () => {
  const [isOptionPanelClosed, setIsOptionPanelClosed] = useState(false)
  const [regexAppliedCount, setRegexAppliedCount] = useState(0)
  const [regexPattern, setRegexPattern] = useState(
    '.*\\.(png|svg|jpg|jpeg|gif|bmp|webp|mp4|mov|avi|mkv|webm)', // use double back slash because prettier removes one
  )
  const [isDimFilesChecked, setIsDimFilesChecked] = useState(false)
  const [isCustomLinesChecked, setIsCustomLinesChecked] = useState(false)
  const [isPRPage, setIsPRPage] = useState(false)

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action !== 'iconClicked') return
    await setStorage('isOptionPanelClosed', false)
    setIsOptionPanelClosed(false)
  })

  const checkIfOnPRPage = () => {
    const prPageObserver = new MutationObserver(function (mutations) {
      if (isPRPage) return
      for (const mutation of mutations) {
        if (document.querySelector('.diffbar-item progress-bar')) {
          setIsPRPage(true)
          break
        } else {
          setIsPRPage(false)
        }
      }
    })

    prPageObserver.observe(document.body, {
      childList: true, // Observe direct child additions or removals
      subtree: true, // Observe all descendants
      attributes: false, // Observe attribute changes
    })
  }

  const init = async () => {
    const isOptionPanelClosed = await getStorage('isOptionPanelClosed')
    const regexPattern = await getStorage('regexPattern')
    const dimFiles = await getStorage('dimFiles')
    const customLines = await getStorage('customLines')
    setRegexPattern(regexPattern)
    setIsDimFilesChecked(dimFiles)
    setIsCustomLinesChecked(customLines)
    if (isOptionPanelClosed === false) return
    await setStorage('isOptionPanelClosed', true)
    setIsOptionPanelClosed(true)
  }

  useEffect(() => {
    if (isPRPage) initExtension()
  }, [isPRPage])

  useEffect(() => {
    init()
    checkIfOnPRPage()
  }, [])

  const closePanel = async () => {
    await setStorage('isOptionPanelClosed', true)
    setIsOptionPanelClosed(true)
  }

  const resetRegexAppliedCount = () => {
    setTimeout(() => {
      setRegexAppliedCount(0)
    }, 5000)
  }

  const applyRegex = (type) => {
    if (!regexPattern) return
    setStorage('regexPattern', regexPattern)
    let fileNames = document.querySelectorAll('.file:not([data-file-user-viewed]) .file-info a')
    if (type === 'unview')
      fileNames = document.querySelectorAll('.file[data-file-user-viewed] .file-info a')
    fileNames.forEach((file) => {
      if (file.innerText.match(new RegExp(regexPattern))) {
        setRegexAppliedCount((prev) => prev + 1)
        file.closest('.file')?.querySelector('.js-reviewed-toggle')?.click()
        resetRegexAppliedCount()
      }
    })
  }

  const handleToggleDimFiles = (e) => {
    toggleDimFiles(e.target.checked)
    setIsDimFilesChecked(e.target.checked)
  }

  const handleToggleCustomLine = (e) => {
    toggleCustomLine(e.target.checked)
    setIsCustomLinesChecked(e.target.checked)
  }

  if (!isPRPage) {
    return (
      <div className={`${isOptionPanelClosed ? 'hidden' : 'block'}`}>
        <div className='max-h-[calc(100%-40px)] w-96 bg-gradient-to-t from-[#191d23] to-[#0d1117] !text-white fixed right-4 top-5 z-[1000000] rounded-lg shadow-xl p-3 border-[0.5px] border-gray-800'>
          <Header closePanel={closePanel} />
          <Empty />
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className={`${isOptionPanelClosed ? 'hidden' : 'block'}`}>
      <div className='max-h-[calc(100%-40px)] w-96 bg-gradient-to-t from-[#191d23] to-[#0d1117] !text-white fixed right-4 top-5 z-[1000000] rounded-lg shadow-xl p-3 border-[0.5px] border-gray-800'>
        <Header closePanel={closePanel} />

        <div className='flex items-center my-2'>
          <input
            id='dimFiles'
            type='checkbox'
            className='cursor-pointer w-4 h-4'
            onChange={handleToggleDimFiles}
            checked={isDimFilesChecked}
          />
          <label for='dimFiles' className='ml-2 font-normal cursor-pointer'>
            Dim viewed files
          </label>
        </div>
        <hr className='bg-white opacity-20' />

        <div className='flex items-center my-2'>
          <input
            id='customLines'
            type='checkbox'
            className='cursor-pointer w-4 h-4'
            onChange={handleToggleCustomLine}
            checked={isCustomLinesChecked}
          />
          <label for='customLines' className='ml-2 font-normal cursor-pointer'>
            Show remaining line of codes to review
          </label>
        </div>
        <hr className='bg-white opacity-20' />

        <div className='text-sm font-normal text-gray-500 mt-2'>
          <div className='text-white mb-1'>
            Auto View files
            <span className='opacity-60'> (write regex for files or directories) </span>
          </div>
          <textarea
            value={regexPattern}
            id='regexArea'
            rows='3'
            className='w-full p-2 rounded mb-2 bg-black break-all tracking-wider text-white leading-relaxed	'
            onChange={(e) => setRegexPattern(e.target.value)}
          ></textarea>
          <div className='flex gap-2 mb-2 items-center'>
            <button
              className='py-2 px-3 rounded bg-[#2e343f] text-white'
              onClick={() => applyRegex('view')}
            >
              Mark Viewed
            </button>
            <button
              className='py-2 px-3 rounded bg-[#2e343f] text-white'
              onClick={() => applyRegex('unview')}
            >
              Mark Unviewed
            </button>
          </div>
          {regexAppliedCount ? (
            <div className='text-white'>{regexAppliedCount} files updated</div>
          ) : (
            ''
          )}
        </div>
        <hr className='bg-white opacity-20' />

        <div className='text-sm font-normal text-gray-500 mt-2'>
          <div className='text-white mb-2'>Collapse/Uncollapse all files</div>
          <div className='flex gap-2 items-center'>
            <button
              className='py-2 px-3 rounded bg-[#2e343f] text-white'
              onClick={collapseAllFiles}
            >
              Collapse
            </button>
            <button
              className='py-2 px-3 rounded bg-[#2e343f] text-white'
              onClick={uncollapseAllFiles}
            >
              Uncollapse
            </button>
          </div>
        </div>
        <hr className='bg-white opacity-20 my-2' />
        <Footer />
      </div>
    </div>
  )
}

root.render(
  <div>
    <App />
  </div>,
)
