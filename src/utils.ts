export const getStorage = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key])
    })
  })
}

export const setStorage = (key, value) => {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        [key]: value,
      },
      () => {
        resolve(value)
      },
    )
  })
}

export const collapseAllFiles = () => {
  document.querySelectorAll('.file').forEach((item) => {
    if (item.classList.contains('Details--on')) {
      item.querySelector('.js-details-target')?.click()
    }
  })
}

export const uncollapseAllFiles = () => {
  document.querySelectorAll('.file').forEach((item) => {
    if (!item.classList.contains('Details--on')) {
      item.querySelector('.js-details-target')?.click()
    }
  })
}

const reduceOpacityOfTree = () => {
  let allItems = document.querySelectorAll('file-tree [data-file-user-viewed]')
  allItems.forEach((item) => {
    let closestItem = item.closest('[data-tree-entry-type="directory"]')
    let isEvery = true
    if (closestItem == null) return
    closestItem.querySelectorAll('li').forEach((item) => {
      if (item.style.opacity != '0.3') {
        isEvery = false
      }
    })
    if (isEvery) {
      closestItem.style.opacity = 0.3
    }
  })
}

const parseChanges = (input) => {
  const additions = parseInt(input.match(/(\d+) addition/)?.[1] || 0)
  const deletions = parseInt(input.match(/(\d+) deletion/)?.[1] || 0)
  return { additions, deletions }
}

const calculate = () => {
  let allFiles = document.querySelectorAll(
    '.file:not([data-file-user-viewed]) .file-header .file-info .sr-only',
  )
  let totalChanges = { additions: 0, deletions: 0 }
  for (let file of allFiles) {
    totalChanges.additions += parseChanges(file.innerText).additions
    totalChanges.deletions += parseChanges(file.innerText).deletions
  }
  return totalChanges
}

export const addCustomLineChange = () => {
  // add new div element before "nav aria-label="Pull request tabs"" and do not add if already exists
  const { additions, deletions } = calculate()
  const diffstat = document.querySelector('.diffstat')
  const linesAdded = diffstat?.querySelector('.color-fg-success')
  const linesRemoved = diffstat?.querySelector('.color-fg-danger')

  if (!linesAdded || !linesRemoved) return

  const spanAdded = linesAdded.querySelector('span') || document.createElement('span')
  spanAdded.innerHTML = `+${additions}/`
  spanAdded.className = 'customLines-elem'
  linesAdded.insertBefore(spanAdded, linesAdded.firstChild)

  const spanRemoved = linesRemoved.querySelector('span') || document.createElement('span')
  spanRemoved.innerHTML = `-${deletions}/`
  spanRemoved.className = 'customLines-elem'
  linesRemoved.insertBefore(spanRemoved, linesRemoved.firstChild)
  setStorage('customLines', true)
}

export const removeCustomLineChange = () => {
  const elem = document.querySelectorAll('.customLines-elem')
  elem.forEach((item) => item.remove())
  setStorage('customLines', false)
}

export const dimFiles = () => {
  const modifyOpacity = (item) => {
    if (item.hasAttribute('data-file-user-viewed')) {
      item.style.opacity = 0.3
    } else {
      item.style.opacity = 1
    }
  }

  for (let item of document.querySelectorAll('file-tree [role="treeitem"]')) {
    modifyOpacity(item)
  }
  for (let item of document.querySelectorAll('.Layout-main .file')) {
    modifyOpacity(item)
  }

  reduceOpacityOfTree()
  setStorage('dimFiles', true)
}

export const removeDimFiles = () => {
  for (let item of document.querySelectorAll('file-tree [role="treeitem"]')) {
    item.style.opacity = 1
  }
  for (let item of document.querySelectorAll('.Layout-main .file')) {
    item.style.opacity = 1
  }
  setStorage('dimFiles', false)
}
