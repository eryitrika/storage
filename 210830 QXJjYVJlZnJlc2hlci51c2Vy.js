// ==UserScript==
// @name            Arca Refresher
// @namespace       LeKAKiD
// @description     Arca Live Extension
// @downloadURL     https://github.com/lekakid/ArcaRefresher/releases/latest/download/ArcaRefresher.user.js
// @homepageURL     https://github.com/lekakid/ArcaRefresher
// @supportURL      https://arca.live/b/namurefresher
// @match           https://*.arca.live/*
// @match           https://arca.live/*
// @exclude-match   https://st*.arca.live/*
// @noframes
// @run-at          document-start
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_xmlhttpRequest
// @grant           GM_getResourceText
// @version         2.18.2
// @author          LeKAKiD
// @require         https://cdn.jsdelivr.net/combine/npm/@violentmonkey/dom,npm/@violentmonkey/ui
// @require         https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js
// @require         https://unpkg.com/jszip@3.1.5/dist/jszip.min.js
// @require         https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.min.js
// @resource        colorpicker https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/nano.min.css
// ==/UserScript==

(function () {
'use strict';

const AREvents = {
  ArticleChange: [],
  CommentChange: []
};
function initialize() {
  for (const event of Object.keys(AREvents)) {
    document.addEventListener(`AR_${event}`, () => {
      for (const {
        callback
      } of AREvents[event]) {
        try {
          callback();
        } catch (error) {
          console.error(error);
        }
      }
    });
  }
}
function addAREventListener(event, callback) {
  AREvents[event].push(callback);
  AREvents[event].sort((a, b) => a.priority - b.priority);
}
function dispatchAREvent(event) {
  document.dispatchEvent(new Event(`AR_${event}`));
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var css_248z = ".hidden {\r\n  display: none !important;\r\n}\r\n\r\n.fade-in {\r\n  animation: fadein 0.25s;\r\n  animation-fill-mode: forwards;\r\n}\r\n\r\n.fade-out {\r\n  animation: fadeout 0.25s;\r\n  animation-fill-mode: forwards;\r\n}\r\n\r\n@keyframes fadein {\r\n  from {\r\n    opacity: 0;\r\n  }\r\n  to {\r\n    opacity: 1;\r\n  }\r\n}\r\n\r\n@keyframes fadeout {\r\n  from {\r\n    opacity: 1;\r\n  }\r\n  to {\r\n    opacity: 0;\r\n  }\r\n}\r\n";

const request = {};
async function waitForElement(selector, ignoreLoadEvent) {
  if (request[selector]) {
    if (request[selector].load) return request[selector].exist;
    return request[selector].promise;
  }

  const exist = !!document.querySelector(selector);

  if (exist) {
    request[selector] = {
      load: true,
      exist,
      promise: Promise.resolve(exist)
    };
    return exist;
  }

  request[selector] = {
    load: false,
    exist: false,
    promise: new Promise(resolve => {
      const onload = () => {
        observer.disconnect();
        request[selector].load = true;
        request[selector].exist = false;
        resolve(false);
      };

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          request[selector].load = true;
          request[selector].exist = true;

          if (!ignoreLoadEvent) {
            window.removeEventListener('load', onload);
          }

          resolve(true);
        }
      });

      if (!ignoreLoadEvent) {
        window.addEventListener('load', onload);
      }

      observer.observe(document, {
        childList: true,
        subtree: true
      });
    })
  };
  return request[selector].promise;
}

async function initilaize() {
  await waitForElement('head');
  document.head.append(VM.createElement("style", null, css_248z));
}
function useFade(DOMElement, defaultValue) {
  let visible = defaultValue || false;
  DOMElement.addEventListener('animationend', e => {
    DOMElement.classList.remove('fade-in');
    DOMElement.classList.remove('fade-out');

    if (!visible) {
      DOMElement.classList.add('hidden');
    }
  });

  if (!visible) {
    DOMElement.classList.add('hidden');
  }

  return () => {
    DOMElement.classList.remove('hidden');

    if (visible) {
      DOMElement.classList.add('fade-out');
      visible = false;
    } else {
      DOMElement.classList.add('fade-in');
      visible = true;
    }

    return visible;
  };
}

var css_248z$1 = ".body .nav-control {\r\n  z-index: 3000;\r\n}\r\n\r\n#refresherSetting {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  background-color: rgba(0, 0, 0, 0.7);\r\n  z-index: 5000;\r\n\r\n  display: flex;\r\n  justify-content: center;\r\n  align-content: center;\r\n}\r\n\r\n#refresherSetting .background {\r\n  width: 700px;\r\n  height: calc(100% - 4rem);\r\n  border: 1px solid var(--color-border-outer);\r\n  background-color: var(--color-bg-main);\r\n  margin: 2rem;\r\n  padding: 2rem;\r\n  z-index: 500;\r\n\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n#refresherSetting .search {\r\n  padding-bottom: 1rem;\r\n}\r\n\r\n#refresherSetting .settings {\r\n  flex-grow: 1;\r\n\r\n  width: 100%;\r\n  overflow-y: scroll;\r\n}\r\n\r\n#refresherSetting .btn-grid {\r\n  bottom: 0;\r\n  width: 100%;\r\n  height: auto;\r\n  padding-top: 0.5rem;\r\n\r\n  display: grid;\r\n  grid-template-columns: repeat(6, 1fr);\r\n  grid-template-areas: 'export import reset . . save';\r\n}\r\n\r\n#refresherSetting .btn-grid button:nth-child(1) {\r\n  grid-area: export;\r\n}\r\n#refresherSetting .btn-grid button:nth-child(2) {\r\n  grid-area: import;\r\n}\r\n#refresherSetting .btn-grid button:nth-child(3) {\r\n  grid-area: reset;\r\n}\r\n#refresherSetting .btn-grid button:nth-child(4) {\r\n  grid-area: save;\r\n}\r\n\r\n#refresherSetting .group {\r\n  border: 1px solid var(--color-border-outer);\r\n  border-radius: 0.25rem;\r\n  margin-bottom: 2rem;\r\n  padding: 0.25rem;\r\n}\r\n\r\n#refresherSetting .item {\r\n  margin: 0 0.25rem;\r\n  padding: 0.5rem;\r\n}\r\n\r\n#refresherSetting .item:first-child {\r\n  margin-top: 0;\r\n}\r\n\r\n#refresherSetting .item:last-child {\r\n  margin-bottom: 0;\r\n}\r\n\r\n#refresherSetting .item.default {\r\n  display: grid;\r\n  grid-template-columns: 9fr 3fr;\r\n  grid-template-areas:\r\n    '   header   setting'\r\n    'description .';\r\n  grid-column-gap: 0.5rem;\r\n}\r\n\r\n#refresherSetting .item:not(:last-child):not(.lastChild) {\r\n  border-bottom: 1px solid var(--color-border-outer);\r\n}\r\n\r\n#refresherSetting .item.wide {\r\n  display: grid;\r\n  grid-template-columns: 1fr;\r\n  grid-template-areas:\r\n    'header'\r\n    'setting'\r\n    'description';\r\n}\r\n\r\n#refresherSetting .item > label {\r\n  grid-area: header;\r\n  margin-bottom: 0.25rem;\r\n  height: 100%;\r\n\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n\r\n#refresherSetting .item.default > label {\r\n  border-right: 1px solid var(--color-border-inner);\r\n}\r\n\r\n#refresherSetting .item > p {\r\n  grid-area: description;\r\n  margin-bottom: 0;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n#refresherSetting .item.wide > p {\r\n  padding-left: 0.5rem;\r\n}\r\n\r\n#refresherSetting .item > div {\r\n  grid-area: setting;\r\n  margin: 0.5rem;\r\n}\r\n\r\n#refresherSetting select,\r\n#refresherSetting textarea,\r\n#refresherSetting input[type='text'],\r\n#refresherSetting input[type='number'] {\r\n  display: block;\r\n  width: 100%;\r\n  margin: 0;\r\n  padding: 0.5rem 0.75rem;\r\n  color: var(--color-text-color);\r\n  background-color: var(--color-bg-main);\r\n  border: 1px solid var(--color-border-outer);\r\n}\r\n\r\n#refresherSetting input[type='checkbox'] {\r\n  margin: 0.25rem;\r\n}\r\n\r\n#refresherSetting input[disabled] {\r\n  background-color: var(--color-bg-body);\r\n}\r\n#refresherSetting select {\r\n  overflow: scroll;\r\n}\r\n\r\n#refresherSetting label {\r\n  display: inline-flex;\r\n  align-items: center;\r\n}\r\n\r\n@media screen and (max-width: 768px) {\r\n  #refresherSetting .background {\r\n    padding: 1rem;\r\n  }\r\n  #refresherSetting .btn-grid {\r\n    display: grid;\r\n    grid-template-columns: repeat(3, 1fr);\r\n    grid-template-areas:\r\n      'export import reset'\r\n      '. . .'\r\n      'save save save';\r\n    grid-row-gap: 0.25rem;\r\n  }\r\n  #refresherSetting .item.default {\r\n    display: grid;\r\n    grid-template-columns: 1fr;\r\n    grid-template-areas:\r\n      'header'\r\n      'setting'\r\n      'description';\r\n  }\r\n\r\n  #refresherSetting .item.default > label {\r\n    border-right: none;\r\n  }\r\n}\r\n";

const validateConfigHandlers = [];
const saveConfigHandlers = [];
const loadConfigHandlers = [];
const settingContainer = VM.createElement("div", {
  className: "settings"
});
const GroupList = [];
const exportAnchor = VM.createElement("a", {
  download: "setting.txt"
});
/**
 * 스크립트 설정 버튼을 누르면 나오는 설정창에 모듈의 설정을 추가해줍니다.
 * @param {Object} param                            파라미터 오브젝트
 * @param {string} param.header                     설정 그룹 이름
 * @param {Array} param.group                       설정 그룹
 * @param {Element} param.group.title               표기할 설정명
 * @param {Element} param.group.description         표기할 설정 부연설명
 * @param {Element} param.group.item                상호작용할 엘리먼트
 * @param {string} [param.group.type]               설정 표기 방식
 * @param {Object} param.configHandler              콜백함수 오브젝트
 * @param {function} param.configHandler.validate   설정 저장 전 유효성 검증 함수
 * @param {function} param.configHandler.save       설정 저장
 * @param {function} param.configHandler.load       설정 불러오기
 */

function addSetting({
  header,
  group,
  configHandler: {
    validate,
    save,
    load
  }
}) {
  const itemElementList = [];
  const itemList = group.map(({
    title,
    description,
    content,
    type
  }) => {
    const item = VM.createElement("div", {
      className: `item ${type || 'default'}`
    }, description && VM.createElement("p", null, description), VM.createElement("label", null, title), VM.createElement("div", null, content));
    itemElementList.push({
      text: title,
      element: item
    });
    return item;
  });
  const groupElement = VM.createElement("div", {
    className: "group"
  }, itemList);
  GroupList.push({
    text: header,
    element: groupElement,
    items: itemElementList
  });
  if (validate) validateConfigHandlers.push(validate);
  saveConfigHandlers.push(save);
  loadConfigHandlers.push(load);
  settingContainer.append(VM.createElement("div", {
    className: "section"
  }, VM.createElement("h5", null, header), groupElement));
}
/**
 * 설정 값을 가져옵니다.
 * @param {Object} keyObject           { key, defaultValue }
 * @param {string} keyObject.key       키 값
 * @param {*} keyObject.defaultValue   값이 없을 시 기본값
 * @return {*}                         저장된 설정 값
 */

function getValue({
  key,
  defaultValue
}) {
  if (Array.isArray(defaultValue)) {
    return GM_getValue(key, [...defaultValue]);
  }

  if (typeof defaultValue === 'object') {
    return GM_getValue(key, _extends({}, defaultValue));
  }

  return GM_getValue(key, defaultValue);
}
/**
 * 설정 값을 저장합니다.
 * @param {Object} param  { key, ...rest }
 * @param {*} value       저장할 값
 */

function setValue({
  key
}, value) {
  GM_setValue(key, value);
}

function importConfig(JSONString) {
  const data = JSON.parse(JSONString);

  for (const key of Object.keys(data)) {
    GM_setValue(key, data[key]);
  }
}

function exportConfig() {
  const keys = GM_listValues();
  const config = {};

  for (const key of keys) {
    config[key] = GM_getValue(key);
  }

  const result = JSON.stringify(config);
  return result;
}

function resetConfig() {
  const keys = GM_listValues();

  for (const key of keys) {
    GM_deleteValue(key);
  }
}

async function initialize$1() {
  await waitForElement('.content-wrapper'); // 설정 버튼 엘리먼트

  const showBtn = VM.createElement("li", {
    className: "nav-item dropdown",
    id: "showSetting"
  }, VM.createElement("a", {
    "aria-expanded": "false",
    className: "nav-link",
    href: "#"
  }, VM.createElement("span", {
    className: "d-none d-sm-block"
  }, "\uC2A4\uD06C\uB9BD\uD2B8 \uC124\uC815"), VM.createElement("span", {
    className: "d-block d-sm-none"
  }, VM.createElement("span", {
    className: "ion-gear-a"
  }))));
  showBtn.addEventListener('click', event => {
    event.preventDefault();
    toggleFunction();
    document.body.style.overflow = 'hidden';

    for (const func of loadConfigHandlers) {
      func();
    }
  });
  document.querySelector('ul.navbar-nav').append(showBtn); // 설정 메뉴 엘리먼트

  function onSearch(event) {
    const value = event.target.value;

    if (value) {
      GroupList.forEach(({
        text,
        element,
        items
      }) => {
        if (text.indexOf(value) === -1) {
          let searchCount = 0;
          let lastIndex = 0;
          items.forEach(({
            text: itemText,
            element: itemElement
          }, index) => {
            if (itemText.indexOf(value) > -1) {
              searchCount += 1;
              lastIndex = index;
              itemElement.classList.remove('hidden');
              itemElement.classList.remove('lastChild');
            } else {
              itemElement.classList.add('hidden');
            }
          });
          items[lastIndex].element.classList.add('lastChild');

          if (searchCount) {
            element.parentNode.classList.remove('hidden');
          } else {
            element.parentNode.classList.add('hidden');
          }
        } else {
          element.parentNode.classList.remove('hidden');
          items.forEach(({
            element: itemElement
          }) => {
            itemElement.classList.remove('hidden');
            itemElement.classList.remove('lastChild');
          });
        }
      });
    } else {
      GroupList.forEach(({
        element,
        items
      }) => {
        element.parentNode.classList.remove('hidden');
        items.forEach(({
          element: itemElement
        }) => {
          itemElement.classList.remove('hidden');
          itemElement.classList.remove('lastChild');
        });
      });
    }
  }

  function onSearchClick(event) {
    event.target.select();
  }

  function onExport() {
    const data = exportConfig();
    const textfile = new Blob([data], {
      type: 'text/plain'
    });
    const textURL = window.URL.createObjectURL(textfile);
    window.URL.revokeObjectURL(exportAnchor.href);
    exportAnchor.href = textURL;
    exportAnchor.click();
  }

  async function onImport() {
    const file = await new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'text/plain';

      input.onchange = event => {
        resolve(event.target.files[0]);
      };

      input.click();
    });
    const data = await new Promise(resolve => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.readAsText(file);
    });

    try {
      importConfig(data);
      window.location.reload();
    } catch (error) {
      alert(`올바르지 않은 데이터입니다.\n${error}`);
      console.error(error);
    }
  }

  function onReset() {
    if (!window.confirm('모든 설정이 초기화 됩니다. 계속하시겠습니까?')) return;
    resetConfig();
    window.location.reload();
  }

  function onSave() {
    for (const validate of validateConfigHandlers) {
      try {
        validate();
      } catch (error) {
        alert(`저장 중 오류가 발생했습니다.\n${error}`);
        return;
      }
    }

    for (const save of saveConfigHandlers) {
      save();
    }

    window.location.reload();
  }

  const configContainer = VM.createElement("div", {
    id: "refresherSetting"
  }, VM.createElement("style", null, css_248z$1), VM.createElement("div", {
    className: "background"
  }, VM.createElement("h4", null, "Arca Refresher ", GM_info.script.version), VM.createElement("div", {
    className: "search"
  }, VM.createElement("input", {
    type: "text",
    placeholder: "\uC124\uC815 \uAC80\uC0C9",
    onClick: onSearchClick,
    onInput: onSearch
  })), settingContainer, VM.createElement("div", {
    className: "btn-grid"
  }, VM.createElement("button", {
    className: "btn btn-primary",
    onClick: onExport
  }, "\uB0B4\uBCF4\uB0B4\uAE30"), VM.createElement("button", {
    className: "btn btn-secondary",
    onClick: onImport
  }, "\uAC00\uC838\uC624\uAE30"), VM.createElement("button", {
    className: "btn btn-danger",
    onClick: onReset
  }, "\uCD08\uAE30\uD654"), VM.createElement("button", {
    className: "btn btn-arca",
    onClick: onSave
  }, "\uC800\uC7A5"))));
  const toggleFunction = useFade(configContainer);
  configContainer.addEventListener('mousedown', event => {
    if (event.target.closest('.background')) return;
    toggleFunction();
    document.body.style.overflow = '';
  });
  const contentWrapper = document.querySelector('.content-wrapper');
  contentWrapper.insertAdjacentElement('afterend', configContainer);
}

var css_248z$2 = "#context-wrapper {\r\n  z-index: 20;\r\n}\r\n\r\n#context-wrapper.mobile {\r\n  display: flex;\r\n  justify-content: center;\r\n  background-color: rgba(0, 0, 0, 0.5);\r\n}\r\n\r\n#context-wrapper.mobile #context-menu {\r\n  width: 80%;\r\n  align-self: center;\r\n}\r\n\r\n#context-menu {\r\n  position: fixed;\r\n  width: 300px;\r\n  padding: 0.5rem;\r\n  border: 1px solid var(--color-border-outer);\r\n  background-color: var(--color-bg-main);\r\n  pointer-events: auto;\r\n  color: var(--color-text-color);\r\n}\r\n\r\n#context-menu .devider {\r\n  height: 1px;\r\n  margin: 0.5rem 0;\r\n  overflow: hidden;\r\n  background-color: var(--color-border-inner);\r\n}\r\n\r\nhtml.theme-dark #context-menu .devider {\r\n  background-color: var(--color-border-outer);\r\n}\r\n\r\n#context-menu .item {\r\n  display: block;\r\n  width: 100%;\r\n  padding: 3px 20px;\r\n  clear: both;\r\n  font-weight: 400;\r\n  color: var(--color-text-color);\r\n  white-space: nowrap;\r\n  border: 0;\r\n}\r\n\r\n#context-menu .item:hover,\r\n#context-menu .item:focus {\r\n  color: var(--color-text-color);\r\n  background-color: var(--color-bg-focus);\r\n  text-decoration: none;\r\n}\r\n\r\n#context-wrapper {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n";

const USE_CONTEXT_MENU = {
  key: 'useContextMenu',
  defaultValue: true
};
const eventList = {
  clickOnImage: []
};
const contextMenuView = VM.createElement("div", {
  className: "menu",
  id: "context-menu"
});
const contextMenuWrapper = VM.createElement("div", {
  className: "hidden",
  id: "context-wrapper"
}, VM.createElement("style", null, css_248z$2), contextMenuView);
let mobile = false;
async function load() {
  try {
    setupSetting();
    await waitForElement('body');
    initialize$2();
  } catch (error) {
    console.error(error);
  }
}

function setupSetting() {
  const useContextMenu = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  addSetting({
    header: '컨텍스트 메뉴',
    group: [{
      title: '컨텍스트 메뉴',
      content: useContextMenu
    }],
    configHandler: {
      save() {
        setValue(USE_CONTEXT_MENU, useContextMenu.value === 'true');
      },

      load() {
        useContextMenu.value = getValue(USE_CONTEXT_MENU);
      }

    }
  });
}

function initialize$2() {
  if (!getValue(USE_CONTEXT_MENU)) return;
  document.body.append(contextMenuWrapper);

  if (window.outerWidth <= 768) {
    mobile = true;
    contextMenuWrapper.classList.add('mobile');
  }

  function callEvent(event) {
    if (!contextMenuWrapper.classList.contains('hidden')) {
      hide();
      return;
    }

    if (event.target.closest('.article-body')) {
      if (event.target.closest('img, video:not([controls])')) {
        contextMenuView.dataset.url = `${event.target.src}${event.target.tagName === 'VIDEO' ? '.gif' : ''}?type=orig`;
        removeMenuAll();
        appendMenu(eventList.clickOnImage);
        show(event);
        event.preventDefault();
      }
    }
  }

  if (mobile) {
    document.addEventListener('touchstart', event => {
      if (event.touches.length === 2) {
        callEvent(event);
      }
    });
  } else {
    document.addEventListener('contextmenu', callEvent);
  }

  document.addEventListener('click', event => {
    if (contextMenuWrapper.classList.contains('hidden')) return;
    if (event.target.closest('#context-menu')) return;
    hide();
    event.preventDefault();
  });
  document.addEventListener('scroll', () => {
    hide();
  });
}

function show(event) {
  contextMenuWrapper.classList.remove('hidden');

  if (!mobile) {
    const x = event.clientX + 2;
    const rect = contextMenuView.getBoundingClientRect();
    let y;

    if (event.clientY + rect.height > window.innerHeight) {
      y = event.clientY - rect.height - 2;
    } else {
      y = event.clientY + 2;
    }

    contextMenuView.setAttribute('style', `left: ${x}px; top: ${y}px`);
  }
}

function hide() {
  contextMenuWrapper.classList.add('hidden');
}
function addMenuGroup(event, contextElement) {
  if (!eventList[event]) {
    console.error('[ContextMenu.registContextMenu] 존재하지 않는 이벤트 등록');
    return;
  }

  eventList[event].push(contextElement);
}

function appendMenu(elementArray) {
  let count = 0;

  for (const element of elementArray) {
    if (count > 0) contextMenuView.append(VM.createElement("div", {
      className: "devider"
    }));
    contextMenuView.append(element);
    count += 1;
  }
}

function removeMenuAll() {
  while (contextMenuView.childElementCount) {
    contextMenuView.removeChild(contextMenuView.children[0]);
  }
}

function createMenu(MenuItem) {
  const {
    text,
    description,
    onClick
  } = MenuItem;
  const menuItem = VM.createElement("a", {
    href: "#",
    className: "item",
    title: description || false
  }, text);
  menuItem.addEventListener('click', onClick);
  return menuItem;
}
function getContextData(name) {
  return contextMenuView.dataset[name];
}

// CONTAINER LOAD CHECK SELECTOR
const HEADER_LOADED = '.content-wrapper';
const BOARD_LOADED = 'form.search-form';
const ARTICLE_LOADED = 'div.included-article-list';
const COMMENT_LOADED = '#comment form.write-area, #comment .alert';
const WRITE_LOADED = '.fr-box';
const AUDIT_LOADED = '.board-audit-list + a.btn'; // CONTAINER SELECTOR

const BOARD_VIEW = 'div.board-article-list .list-table, div.included-article-list .list-table';
const ARTICLE_VIEW = '.article-wrapper';
const AUDIT_VIEW = '.board-audit-list'; // CONTAINER ITEM SELECTOR

const BOARD_CATEGORIES = '.board-category a';
const BOARD_ARTICLES = 'a.vrow:not(.notice)';
const USER_INFO = 'span.user-info';

/**
 * 게시물 상단 헤더 메뉴에 버튼을 추가합니다.
 * @param {Object} param                파라미터 오브젝트
 * @param {string} param.text           버튼 텍스트
 * @param {string} param.icon           버튼 좌측에 붙을 아이콘
 * @param {string} [param.description]  버튼에 마우스를 올려두면 표시될 설명
 * @param {Function} param.onClick      버튼을 클릭 시 호출할 콜백 함수
 */
function addButton({
  text,
  icon,
  description,
  onClick
}) {
  const headerMenu = document.querySelector('.edit-menu');
  if (!headerMenu) return;
  const element = VM.createElement("a", {
    href: "#",
    title: description
  }, icon && VM.createElement("span", {
    className: icon
  }), ` ${text}`);
  element.addEventListener('click', onClick);
  headerMenu.prepend(VM.createElement(VM.Fragment, null, element, headerMenu.childElementCount > 0 && VM.createElement("span", {
    className: "sep"
  })));
}

const CHANNEL_TITLE = '.board-title span + a:not([class])';
function parseChannelID() {
  try {
    const pathname = window.location.pathname;
    return pathname.match(/\/b\/[0-9a-zA-Z]{4,20}/g)[0].replace('/b/', '').toLowerCase();
  } catch (error) {
    return '';
  }
}
function parseChannelTitle() {
  const channelTitle = document.querySelector(CHANNEL_TITLE);
  return channelTitle ? channelTitle.textContent.replace(' 채널', '') : '';
}
function parseChannelCategory(isReverseMap) {
  const channelCategoryList = document.querySelectorAll(BOARD_CATEGORIES);
  const result = {};
  channelCategoryList.forEach(e => {
    if (e.href.indexOf('category=') > -1) {
      const id = decodeURI(e.href.split('category=')[1].split('&')[0]);
      const text = e.textContent;

      if (isReverseMap) {
        result[text] = id;
      } else {
        result[id] = text;
      }
    } else {
      result['일반'] = '일반';
    }
  });
  return result;
}
function parseUserInfo(infoElement) {
  if (infoElement.dataset.info) {
    return infoElement.dataset.info;
  }

  const dataElement = infoElement.querySelector('[data-filter]');
  const data = dataElement.dataset.filter;
  const id = data.match(/#[0-9]{8}|[0-9]{1,3}\.[0-9]{1,3}|^[^,#]+$/g)[0];
  let info;

  if (data.indexOf('#') > -1) {
    info = `${dataElement.textContent}${id}`;
  }

  if (data.indexOf(',') > -1) {
    info = `${dataElement.textContent}(${id})`;
  } else {
    info = id;
  }

  infoElement.dataset.info = info;
  return info;
}
function parseUserID(infoElement) {
  if (infoElement.dataset.id) {
    return infoElement.dataset.id;
  }

  const data = infoElement.querySelector('[data-filter]').dataset.filter;
  let id = data.match(/#[0-9]{8}|[0-9]{1,3}\.[0-9]{1,3}|^[^,#]+$/g)[0];

  if (data.indexOf(',') > -1) {
    id = `(${id})`;
  }

  infoElement.dataset.id = id;
  return id;
}

var AnonymousNick = {
  load: load$1
};
const DefaultPrefix = ['웃는', '화난', '불쌍한', '즐거운', '건장한', '해탈한', '광기의', '귀여운', '곱슬머리', '개구쟁이', '자신있는', '방구석', '노래하는', '책읽는', '구르는', '비틀거리는', '힘든', '순수한', '행복한', '불닭먹는'];
const DefaultSuffix = ['미호', '캬루', '둘리', '도바킨', '테레사', '윾돌이', '보노보노', '다비', '공룡', '아야'];

async function load$1() {
  try {
    if (await waitForElement(ARTICLE_LOADED)) {
      addArticleMenu();
    }
  } catch (error) {
    console.error(error);
  }
}

function addArticleMenu() {
  addButton({
    text: '익명화',
    icon: 'ion-wand',
    description: '게시물 작성자와 댓글 작성자를 일시적 익명으로 만듭니다.',

    onClick(event) {
      event.preventDefault();
      const userElements = document.querySelectorAll('.article-wrapper .user-info');
      const avatarElements = document.querySelectorAll('.article-wrapper .avatar');
      avatarElements.forEach(e => {
        e.remove();
      });
      const users = new Set();
      userElements.forEach(e => {
        users.add(parseUserID(e));
      });
      const alterNicks = new Set();
      let overcount = 1;

      while (alterNicks.size < users.size) {
        if (alterNicks.size < DefaultPrefix.length * DefaultSuffix.length) {
          const numPrefix = Math.floor(Math.random() * DefaultPrefix.length);
          const numSuffix = Math.floor(Math.random() * DefaultSuffix.length);
          alterNicks.add(`${DefaultPrefix[numPrefix]} ${DefaultSuffix[numSuffix]}`);
        } else {
          alterNicks.add(`비둘기 ${`${overcount += 1}`.padStart(4, '0')}`);
        }
      }

      const alterTable = {};

      for (let i = 0; i < users.size; i += 1) {
        alterTable[[...users][i]] = [...alterNicks][i];
      }

      userElements.forEach(e => {
        e.textContent = alterTable[parseUserID(e)];
      });
    }

  });
}

function getTimeStr(datetime) {
  const date = new Date(datetime);
  let hh = date.getHours();
  let mm = date.getMinutes();

  if (hh.toString().length === 1) {
    hh = `0${hh}`;
  }

  if (mm.toString().length === 1) {
    mm = `0${mm}`;
  }

  return `${hh}:${mm}`;
}
function getDateStr(datetime) {
  const date = new Date(datetime);
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hh = date.getHours();
  let mm = date.getMinutes();
  let ss = date.getSeconds();

  if (month.toString().length === 1) {
    month = `0${month}`;
  }

  if (day.toString().length === 1) {
    day = `0${day}`;
  }

  if (hh.toString().length === 1) {
    hh = `0${hh}`;
  }

  if (mm.toString().length === 1) {
    mm = `0${mm}`;
  }

  if (ss.toString().length === 1) {
    ss = `0${ss}`;
  }

  return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
}
function in24(datetime) {
  const target = new Date(datetime);
  const criteria = new Date();
  criteria.setHours(criteria.getHours() - 24);
  if (target > criteria) return true;
  return false;
}

var css_248z$3 = "@keyframes light {\r\n  0% {\r\n    background-color: rgb(246, 247, 239);\r\n  }\r\n  100% {\r\n    background-color: rgba(255, 255, 255, 0);\r\n  }\r\n}\r\n\r\n@keyframes loaderspin {\r\n  0% {\r\n    transform: rotate(0deg);\r\n    box-shadow: 0 0 15px #3d414d;\r\n  }\r\n  5% {\r\n    box-shadow: 0 0 -10px #3d414d;\r\n  }\r\n  15% {\r\n    box-shadow: 0 0 0px #3d414d;\r\n  }\r\n  100% {\r\n    transform: rotate(360deg);\r\n    box-shadow: 0 0 0px #3d414d;\r\n  }\r\n}\r\n\r\n#autoRefresher {\r\n  border: 6px solid #d3d3d3;\r\n  border-top: 6px solid #3d414d;\r\n  border-radius: 50%;\r\n  position: fixed;\r\n  bottom: 30px;\r\n  left: 10px;\r\n  width: 40px;\r\n  height: 40px;\r\n  z-index: 20;\r\n}\r\n\r\n.target {\r\n  background-color: #e6aaaa;\r\n}\r\n\r\n.badge {\r\n  transition: none;\r\n}\r\n";

var AutoRefresher = {
  load: load$2
};
const REFRESH_TIME = {
  key: 'refreshTime',
  defaultValue: 5
};
const HIDE_REFRESHER = {
  key: 'hideRefresher',
  defaultValue: false
};
let refreshTime = 0;
let loader = null;
let loopInterval = null;

async function load$2() {
  try {
    setupSetting$1();
    if (await waitForElement(ARTICLE_LOADED)) return;

    if (await waitForElement(BOARD_LOADED)) {
      apply();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$1() {
  const refreshTimeSelect = VM.createElement("select", null, VM.createElement("option", {
    value: "0"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "5"
  }, "5\uCD08"), VM.createElement("option", {
    value: "10"
  }, "10\uCD08"), VM.createElement("option", {
    value: "20"
  }, "20\uCD08"), VM.createElement("option", {
    value: "30"
  }, "30\uCD08"), VM.createElement("option", {
    value: "60"
  }, "1\uBD84"));
  const hideRefreshSign = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uBCF4\uC784"), VM.createElement("option", {
    value: "true"
  }, "\uC228\uAE40"));
  addSetting({
    header: '자동 새로고침',
    group: [{
      title: '갱신 시간 설정',
      content: refreshTimeSelect
    }, {
      title: '회전하는 원 애니메이션 숨김',
      content: hideRefreshSign
    }],
    configHandler: {
      save() {
        setValue(REFRESH_TIME, Number(refreshTimeSelect.value));
        setValue(HIDE_REFRESHER, hideRefreshSign.value === 'true');
      },

      load() {
        refreshTimeSelect.value = getValue(REFRESH_TIME);
        hideRefreshSign.value = getValue(HIDE_REFRESHER);
      }

    }
  });
}

function apply() {
  refreshTime = getValue(REFRESH_TIME);
  if (refreshTime === 0) return;
  const articleList = document.querySelector('div.board-article-list .list-table');
  loader = VM.createElement("div", {
    id: "autoRefresher",
    className: getValue(HIDE_REFRESHER) ? 'hidden' : ''
  }, VM.createElement("style", null, css_248z$3));
  articleList.append(loader);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();else if (loopInterval == null) start();
  });
  articleList.addEventListener('click', event => {
    if (event.target.tagName !== 'INPUT') return;

    if (event.target.classList.contains('batch-check-all')) {
      if (event.target.checked) stop();else start();
    } else {
      const btns = articleList.querySelectorAll('.batch-check');

      for (const btn of btns) {
        if (btn.checked) {
          stop();
          return;
        }
      }

      start();
    }
  });
  start();
}

function swapNewArticle(newArticles) {
  const articleList = document.querySelector('div.board-article-list .list-table');
  const oldArticles = [...document.querySelectorAll('a.vrow:not(.notice-unfilter)')];
  let insertLocation = document.querySelector('a.vrow:not(.notice)');

  for (const n of newArticles) {
    const existingArticle = oldArticles.find(o => o.pathname === n.pathname);

    if (existingArticle) {
      existingArticle.replaceWith(n);
    } else {
      n.setAttribute('style', 'animation: light 0.5s');
      articleList.insertBefore(n, insertLocation);
      insertLocation = n;
    }

    const lazywrapper = n.querySelector('noscript');
    if (lazywrapper) lazywrapper.replaceWith(lazywrapper.firstChild);
    const time = n.querySelector('time');

    if (time && in24(time.dateTime)) {
      time.innerText = getTimeStr(time.dateTime);
    }
  }

  const noticeUnfilterBtn = articleList.querySelector('.notice-unfilter');

  if (noticeUnfilterBtn) {
    const firstArticle = articleList.querySelector('a.vrow:not(.notice)');
    firstArticle.insertAdjacentElement('beforebegin', noticeUnfilterBtn);
  }

  dispatchAREvent('ArticleChange');
}

async function routine() {
  try {
    const newArticles = await new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('GET', window.location.href);
      req.responseType = 'document';
      req.timeout = 10000;

      req.onload = () => {
        const rootView = req.response.querySelector('div.board-article-list .list-table');
        const articles = rootView.querySelectorAll('a.vrow:not(.notice-unfilter)');
        resolve(articles);
      };

      req.ontimeout = () => {
        reject(new Error('[AutoRefresher] 연결 시간 초과'));
      };

      req.onerror = () => {
        reject(new Error('[AutoRefresher] 연결 거부'));
      };

      req.send();
    });
    swapNewArticle(newArticles);
  } catch (error) {
    console.error(error);
  }

  animate();
}

function animate() {
  loader.removeAttribute('style');
  setTimeout(() => {
    loader.setAttribute('style', `animation: loaderspin ${refreshTime}s ease-in-out`);
  }, 50);
}

function setLoop() {
  loopInterval = setInterval(() => routine(), refreshTime * 1000);
}

function start() {
  animate();
  setLoop();
}

function stop() {
  clearInterval(loopInterval);
  loopInterval = null;
}

var ArticleRemover = {
  load: load$3
};
const AUTO_REMOVE_USER = {
  key: 'autoRemoveUser',
  defaultValue: []
};
const AUTO_REMOVE_KEYWORD = {
  key: 'autoRemoveKeyword',
  defaultValue: []
};
const USE_AUTO_REMOVER_TEST = {
  key: 'useAutoRemoverTest',
  defaultValue: true
};

async function load$3() {
  try {
    setupSetting$2();

    if (await waitForElement(BOARD_LOADED)) {
      addAREventListener('ArticleChange', {
        priority: 999,
        callback: remove
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$2() {
  const removeTestMode = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  const removeKeywordList = VM.createElement("textarea", {
    rows: "6",
    placeholder: "\uD655\uC778 \uC2DC \uC0AD\uC81C\uD560 \uD0A4\uC6CC\uB4DC\uB97C \uC785\uB825, \uC904\uBC14\uAFC8\uC73C\uB85C \uAD6C\uBCC4\uD569\uB2C8\uB2E4."
  });
  const removeUserList = VM.createElement("textarea", {
    rows: "6",
    placeholder: "\uD655\uC778 \uC2DC \uC0AD\uC81C\uD560 \uC791\uC131\uC790\uB97C \uC785\uB825, \uC904\uBC14\uAFC8\uC73C\uB85C \uAD6C\uBCC4\uD569\uB2C8\uB2E4."
  });
  addSetting({
    header: '자동 삭제',
    group: [{
      title: '테스트 모드',
      description: '게시물을 삭제하는 대신 어떤 게시물이 선택되는지 붉은색으로 보여줍니다.',
      content: removeTestMode
    }, {
      title: '키워드 목록',
      content: removeKeywordList,
      type: 'wide'
    }, {
      title: '유저 목록',
      content: removeUserList,
      type: 'wide'
    }],
    configHandler: {
      validate() {
        try {
          const removeKeywordConfig = removeKeywordList.value.split('\n').filter(i => i !== '');
          RegExp(removeKeywordConfig);
        } catch (error) {
          removeKeywordList.focus();
          throw new Error('게시물 삭제 키워드 목록이 정규식 규칙을 위반했습니다.');
        }

        try {
          const removeUserConfig = removeUserList.value.split('\n').filter(i => i !== '');
          RegExp(removeUserConfig);
        } catch (error) {
          removeUserList.focus();
          throw new Error('게시물 삭제 유저 목록이 정규식 규칙을 위반했습니다.');
        }
      },

      save() {
        setValue(USE_AUTO_REMOVER_TEST, removeTestMode.value === 'true');
        setValue(AUTO_REMOVE_KEYWORD, removeKeywordList.value.split('\n').filter(i => i !== ''));
        setValue(AUTO_REMOVE_USER, removeUserList.value.split('\n').filter(i => i !== ''));
      },

      load() {
        removeTestMode.value = getValue(USE_AUTO_REMOVER_TEST);
        removeKeywordList.value = getValue(AUTO_REMOVE_KEYWORD).join('\n');
        removeUserList.value = getValue(AUTO_REMOVE_USER).join('\n');
      }

    }
  });
}

function remove() {
  const form = document.querySelector('.batch-delete-form');
  if (form == null) return false;
  const userlist = getValue(AUTO_REMOVE_USER);
  const keywordlist = getValue(AUTO_REMOVE_KEYWORD);
  const testMode = getValue(USE_AUTO_REMOVER_TEST);
  const articles = document.querySelectorAll('a.vrow:not(.notice)');
  const articleid = [];
  articles.forEach(item => {
    const titleElement = item.querySelector('.col-title');
    const userElement = item.querySelector('.user-info');
    if (!titleElement || !userElement) return;
    const title = titleElement.innerText;
    const author = parseUserID(userElement);
    const checkbox = item.querySelector('.batch-check');
    const authorAllow = userlist.length === 0 ? false : new RegExp(userlist.join('|')).test(author);
    const titleAllow = keywordlist.length === 0 ? false : new RegExp(keywordlist.join('|')).test(title);

    if (titleAllow || authorAllow) {
      if (testMode) {
        item.classList.add('target');
      } else {
        articleid.push(checkbox.getAttribute('data-id'));
      }
    }
  });

  if (articleid.length > 0 && !testMode) {
    form.querySelector('input[name="articleIds"]').value = articleid.join(',');
    form.submit();
    return true;
  }

  return false;
}

var MuteStyle = {"wrapper":"MuteContent-module_wrapper__f1VbG","item":"MuteContent-module_item__1hfud"};
var stylesheet=".body\r\n  .board-article\r\n  .article-list\r\n  .list-table.show-filtered-category\r\n  .vrow.filtered-category {\r\n  display: flex;\r\n}\r\n\r\n.body .board-article .article-comment .list-area .comment-wrapper.filtered,\r\n.body .board-article .article-list .list-table .vrow.filtered {\r\n  display: none;\r\n}\r\n\r\n.body .board-article .article-comment .list-area.show-filtered .comment-wrapper.filtered,\r\n.body\r\n  .board-article\r\n  .article-comment\r\n  .list-area.show-filtered-deleted\r\n  .comment-wrapper.filtered-deleted,\r\n.body\r\n  .board-article\r\n  .article-comment\r\n  .list-area.show-filtered-keyword\r\n  .comment-wrapper.filtered-keyword,\r\n.body\r\n  .board-article\r\n  .article-comment\r\n  .list-area.show-filtered-notice\r\n  .comment-wrapper.filtered-notice,\r\n.body\r\n  .board-article\r\n  .article-comment\r\n  .list-area.show-filtered-user\r\n  .comment-wrapper.filtered-user {\r\n  display: block;\r\n}\r\n\r\n.MuteContent-module_wrapper__f1VbG {\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.MuteContent-module_item__1hfud {\r\n  min-height: 3rem;\r\n\r\n  display: grid;\r\n  grid-template-columns: 1fr 2fr;\r\n  grid-template-areas: 'category opts';\r\n  align-items: stretch;\r\n\r\n  border-top: 1px solid var(--color-border-outer);\r\n}\r\n\r\n@media screen and (max-width: 768px) {\r\n  .MuteContent-module_item__1hfud {\r\n    grid-template-columns: 1fr;\r\n    grid-template-areas:\r\n      'category'\r\n      'opts';\r\n  }\r\n}\r\n\r\n.MuteContent-module_item__1hfud label {\r\n  margin: 0;\r\n}\r\n\r\n.MuteContent-module_item__1hfud > div {\r\n  height: 3rem;\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n\r\n.MuteContent-module_item__1hfud > div:nth-child(1) {\r\n  grid-area: category;\r\n}\r\n\r\n.MuteContent-module_item__1hfud > div:nth-child(2) {\r\n  grid-area: opts;\r\n}\r\n";

var MuteContent = {
  load: load$4
};
const BLOCK_USER = {
  key: 'blockUser',
  defaultValue: []
};
const BLOCK_KEYWORD = {
  key: 'blockKeyword',
  defaultValue: []
};
const MUTE_CATEGORY = {
  key: 'muteCategory',
  defaultValue: {}
};
const HIDE_MUTE_BAR = {
  key: 'hideMuteBar',
  defaultValue: false
};
const MUTE_NOTICE = {
  key: 'hideNotice',
  defaultValue: false
};
const MUTE_REPLY_TYPE = {
  key: 'muteReplyType',
  defaultValue: 'target-only'
};

async function load$4() {
  try {
    await waitForElement('head');
    applyStyle();

    if (await waitForElement(ARTICLE_LOADED)) {
      addArticleMenu$1();
    }

    if (await waitForElement(BOARD_LOADED)) {
      setupSetting$3();
      muteSidebar();
      muteComment();
      muteNotice();
      mutePreview();
      muteArticle();
    }

    addAREventListener('ArticleChange', {
      priority: 100,

      callback() {
        muteNotice();
        mutePreview();
        muteArticle();
      }

    });
    addAREventListener('CommentChange', {
      priority: 100,

      callback() {
        muteComment();
      }

    });
  } catch (error) {
    console.error(error);
  }
}

function applyStyle() {
  const hideMuteBar = getValue(HIDE_MUTE_BAR);

  if (hideMuteBar) {
    document.head.append(VM.createElement("style", null, `
        .frontend-header {
          display: none !important;
        }
      `));
  }
}

function setupSetting$3() {
  const hideNotice = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  const hideMuteBar = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  const muteReplyType = VM.createElement("select", null, VM.createElement("option", {
    value: "target-only"
  }, "\uBBA4\uD2B8 \uB300\uC0C1\uB9CC"), VM.createElement("option", {
    value: "contain-child"
  }, "\uB2F5\uAE00\uC744 \uD3EC\uD568"));
  const userMute = VM.createElement("textarea", {
    rows: "6",
    placeholder: "\uBBA4\uD2B8\uD560 \uC774\uC6A9\uC790\uC758 \uB2C9\uB124\uC784\uC744 \uC785\uB825, \uC904\uBC14\uAFC8\uC73C\uB85C \uAD6C\uBCC4\uD569\uB2C8\uB2E4."
  });
  const keywordMute = VM.createElement("textarea", {
    rows: "6",
    placeholder: "\uBBA4\uD2B8\uD560 \uD0A4\uC6CC\uB4DC\uB97C \uC785\uB825, \uC904\uBC14\uAFC8\uC73C\uB85C \uAD6C\uBCC4\uD569\uB2C8\uB2E4."
  });
  const category = parseChannelCategory();
  const categoryContainer = {};
  const categoryWrapper = VM.createElement("div", {
    className: MuteStyle.wrapper
  }, VM.createElement("style", null, stylesheet), Object.keys(category).map(key => {
    const name = category[key];
    const previewInput = VM.createElement("input", {
      type: "checkbox",
      style: {
        margin: '0.25rem'
      }
    });
    const articleInput = VM.createElement("input", {
      type: "checkbox",
      style: {
        margin: '0.25rem'
      }
    });
    categoryContainer[key] = {
      previewMute: previewInput,
      articleMute: articleInput
    };
    return VM.createElement("div", {
      className: MuteStyle.item
    }, VM.createElement("div", null, name), VM.createElement("div", null, VM.createElement("label", null, previewInput, "\uBBF8\uB9AC\uBCF4\uAE30 \uBBA4\uD2B8"), VM.createElement("label", null, articleInput, "\uAC8C\uC2DC\uBB3C \uBBA4\uD2B8")));
  }));
  const channel = window.location.pathname.split('/')[2];
  addSetting({
    header: '뮤트',
    group: [{
      title: '공지사항 접기',
      content: hideNotice
    }, {
      title: '뮤트 카운트바 숨김',
      content: hideMuteBar
    }, {
      title: '댓글을 숨길 때',
      content: muteReplyType
    }, {
      title: '사용자 목록',
      description: VM.createElement(VM.Fragment, null, "\uC9C0\uC815\uD55C \uC720\uC800\uC758 \uAC8C\uC2DC\uBB3C\uACFC \uB313\uAE00\uC744 \uC228\uAE41\uB2C8\uB2E4.", VM.createElement("br", null), "Regex \uBB38\uBC95\uC744 \uC9C0\uC6D0\uD558\uAE30 \uB54C\uBB38\uC5D0 \uD2B9\uC218\uBB38\uC790 \uC0AC\uC6A9 \uC2DC \uC5ED\uC2AC\uB798\uC2DC(\\)\uB97C \uBD99\uC5EC\uC57C\uD569\uB2C8\uB2E4.", VM.createElement("br", null), "\uC0AC\uC6A9 \uC2DC \uC5ED\uC2AC\uB798\uC2DC\uB97C \uBD99\uC5EC \uC791\uC131\uD574\uC57C\uD558\uB294 \uD2B9\uC218\uBB38\uC790 \uBAA9\uB85D", VM.createElement("br", null), VM.createElement("ul", null, VM.createElement("li", null, "\uC18C\uAD04\uD638()"), VM.createElement("li", null, "\uB9C8\uCE68\uD45C."))),
      content: userMute,
      type: 'wide'
    }, {
      title: '키워드 목록',
      description: VM.createElement(VM.Fragment, null, "\uC9C0\uC815\uD55C \uD0A4\uC6CC\uB4DC\uAC00 \uD3EC\uD568\uB41C \uC81C\uBAA9\uC744 \uAC00\uC9C4 \uAC8C\uC2DC\uBB3C\uACFC \uB313\uAE00\uC744 \uC228\uAE41\uB2C8\uB2E4.", VM.createElement("br", null), "Regex \uBB38\uBC95\uC744 \uC9C0\uC6D0\uD558\uAE30 \uB54C\uBB38\uC5D0 \uD2B9\uC218\uBB38\uC790 \uC0AC\uC6A9 \uC2DC \uC5ED\uC2AC\uB798\uC2DC(\\)\uB97C \uBD99\uC5EC\uC57C\uD569\uB2C8\uB2E4.", VM.createElement("br", null), "\uC0AC\uC6A9 \uC2DC \uC5ED\uC2AC\uB798\uC2DC\uB97C \uBD99\uC5EC \uC791\uC131\uD574\uC57C\uD558\uB294 \uD2B9\uC218\uBB38\uC790 \uBAA9\uB85D", VM.createElement("br", null), VM.createElement("ul", null, VM.createElement("li", null, "\uC18C\uAD04\uD638()"), VM.createElement("li", null, "\uC911\uAD04\uD638", '{}'), VM.createElement("li", null, "\uB300\uAD04\uD638[]"), VM.createElement("li", null, "\uB9C8\uCE68\uD45C."), VM.createElement("li", null, "\uD50C\uB7EC\uC2A4+"), VM.createElement("li", null, "\uBB3C\uC74C\uD45C?"), VM.createElement("li", null, "\uB2EC\uB7EC\uAE30\uD638$"), VM.createElement("li", null, "\uCE90\uB7FF^"), VM.createElement("li", null, "\uBCC4*"), VM.createElement("li", null, "\uC2AC\uB798\uC2DC/"), VM.createElement("li", null, "\uC5ED\uC2AC\uB798\uC2DC\\"), VM.createElement("li", null, "\uD558\uC774\uD508-"), VM.createElement("li", null, "\uD30C\uC774\uD504|"))),
      content: keywordMute,
      type: 'wide'
    }, {
      title: '카테고리 설정',
      description: VM.createElement(VM.Fragment, null, "\uBBF8\uB9AC\uBCF4\uAE30 \uBBA4\uD2B8: \uD574\uB2F9 \uCE74\uD14C\uACE0\uB9AC \uAC8C\uC2DC\uBB3C\uC758 \uBBF8\uB9AC\uBCF4\uAE30\uB97C \uC81C\uAC70\uD569\uB2C8\uB2E4.", VM.createElement("br", null), "\uAC8C\uC2DC\uBB3C \uBBA4\uD2B8: \uD574\uB2F9 \uCE74\uD14C\uACE0\uB9AC\uC758 \uAC8C\uC2DC\uBB3C\uC744 \uC228\uAE41\uB2C8\uB2E4."),
      content: categoryWrapper,
      type: 'wide'
    }],
    configHandler: {
      validate() {
        try {
          const removeKeywordConfig = keywordMute.value.split('\n').filter(i => i !== '');
          RegExp(removeKeywordConfig.join('|'));
        } catch (error) {
          keywordMute.focus();
          throw new Error('게시물 뮤트 키워드 목록이 정규식 규칙을 위반했습니다.');
        }

        try {
          const removeUserConfig = userMute.value.split('\n').filter(i => i !== '');
          RegExp(removeUserConfig.join('|'));
        } catch (error) {
          userMute.focus();
          throw new Error('게시물 뮤트 유저 목록이 정규식 규칙을 위반했습니다.');
        }
      },

      save() {
        setValue(MUTE_NOTICE, hideNotice.value === 'true');
        setValue(HIDE_MUTE_BAR, hideMuteBar.value === 'true');
        setValue(MUTE_REPLY_TYPE, muteReplyType.value);
        setValue(BLOCK_USER, userMute.value.split('\n').filter(i => i !== ''));
        setValue(BLOCK_KEYWORD, keywordMute.value.split('\n').filter(i => i !== ''));
        const config = getValue(MUTE_CATEGORY);
        let channelConfig = config[channel];
        if (!channelConfig) channelConfig = {};
        const defaultConfig = {
          mutePreview: false,
          muteArticle: false
        };

        for (const key in categoryContainer) {
          if (categoryContainer[key]) {
            const row = categoryContainer[key];
            const preview = row.previewMute.checked;
            const article = row.articleMute.checked;
            channelConfig[key] = {
              mutePreview: preview,
              muteArticle: article
            };

            if (JSON.stringify(channelConfig) === JSON.stringify(defaultConfig)) {
              delete channelConfig[key];
            }
          }
        }

        setValue(MUTE_CATEGORY, _extends({}, config, {
          [channel]: channelConfig
        }));
      },

      load() {
        hideNotice.value = getValue(MUTE_NOTICE);
        hideMuteBar.value = getValue(HIDE_MUTE_BAR);
        muteReplyType.value = getValue(MUTE_REPLY_TYPE);
        userMute.value = getValue(BLOCK_USER).join('\n');
        keywordMute.value = getValue(BLOCK_KEYWORD).join('\n');
        const config = getValue(MUTE_CATEGORY)[channel];
        if (!config) return;

        for (const key in categoryContainer) {
          if (config[key]) {
            const {
              mutePreview: preview,
              muteArticle: article
            } = config[key];
            categoryContainer[key].previewMute.checked = preview;
            categoryContainer[key].articleMute.checked = article;
          }
        }
      }

    }
  });
}

const AUTHOR_INFO = '.article-head .user-info';

function addArticleMenu$1() {
  const userInfo = document.querySelector(AUTHOR_INFO);
  if (!userInfo) return;
  const userList = getValue(BLOCK_USER);
  const user = parseUserInfo(userInfo);
  const userID = parseUserID(userInfo).replace('(', '\\(').replace(')', '\\)').replace('.', '\\.');
  const filter = `${user === userID ? '^' : ''}${userID}$`;
  const indexed = userList.indexOf(filter);

  if (indexed > -1) {
    addButton({
      text: '뮤트 해제',
      icon: 'ion-ios-refresh-empty',
      description: '게시물 작성자의 뮤트를 해제합니다.',

      onClick(event) {
        event.preventDefault();
        userList.splice(indexed, 1);
        setValue(BLOCK_USER, userList);
        window.location.reload();
      }

    });
  } else {
    addButton({
      text: '뮤트',
      icon: 'ion-ios-close',
      description: '게시물 작성자를 뮤트합니다.',

      onClick(event) {
        event.preventDefault();
        userList.push(filter);
        setValue(BLOCK_USER, userList);
        window.history.back();
      }

    });
  }
}

function mutePreview() {
  const channel = parseChannelID();
  const config = getValue(MUTE_CATEGORY)[channel];
  const categoryMap = parseChannelCategory(true);
  if (!config) return;
  const articles = document.querySelectorAll('a.vrow:not(.notice)');
  articles.forEach(article => {
    const badge = article.querySelector('.badge');
    if (badge === null) return;
    const categoryText = badge.textContent || '일반';
    const categoryID = categoryMap[categoryText];
    if (!config[categoryID]) return;
    const {
      mutePreview: filtered
    } = config[categoryID];
    if (!filtered) return;
    const preview = article.querySelector('.vrow-preview');
    if (preview) preview.remove();
  });
}

function muteNotice() {
  if (!getValue(MUTE_NOTICE)) return;

  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      muteNotice();
    }, {
      once: true
    });
    return;
  }

  const itemContainer = document.querySelector('div.board-article-list .list-table, div.included-article-list .list-table');
  if (!itemContainer) return;
  const notices = itemContainer.querySelectorAll('a.vrow.notice-board');
  let noticeCount = 0;

  for (const notice of notices) {
    if (notice !== notices[notices.length - 1]) {
      notice.classList.add('filtered');
      notice.classList.add('filtered-notice');
      noticeCount += 1;
    } else {
      let unfilterBtn = itemContainer.querySelector('.notice-unfilter');

      if (!unfilterBtn) {
        // 사용자가 공식 공지 숨기기 기능을 사용하지 않음
        unfilterBtn = VM.createElement("a", {
          className: "vrow notice notice-unfilter"
        }, VM.createElement("div", {
          className: "vrow-top"
        }, "\uC228\uACA8\uC9C4 \uACF5\uC9C0 \uD3BC\uCE58\uAE30(", VM.createElement("span", {
          className: "notice-filter-count"
        }, noticeCount), "\uAC1C)", ' ', VM.createElement("span", {
          className: "ion-android-archive"
        })));
        unfilterBtn.addEventListener('click', () => {
          itemContainer.classList.add('show-filtered-notice');
          unfilterBtn.style.display = 'none';
        });
        notice.insertAdjacentElement('afterend', unfilterBtn);
      }
    }
  }
}

const ContentTypeString = {
  keyword: '키워드',
  user: '사용자',
  category: '카테고리',
  deleted: '삭제됨',
  all: '전체'
};
const ArticleMuteHeader = {
  element: null
};

function muteArticle() {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', muteArticle, {
      once: true
    });
    return;
  }

  const container = document.querySelector(BOARD_VIEW);
  if (!container) return;
  const items = container.querySelectorAll('a.vrow:not(.notice)');
  const count = mapFilter([...items].map(e => {
    const userElement = e.querySelector('.user-info');
    const keywordElement = e.querySelector('.title');
    const categoryElement = e.querySelector('.badge');
    return {
      element: e,
      user: userElement ? parseUserInfo(userElement) : '',
      content: keywordElement ? keywordElement.textContent : '',
      category: categoryElement ? categoryElement.textContent || '일반' : ''
    };
  }));

  if (!ArticleMuteHeader.element) {
    ArticleMuteHeader.element = container.querySelector('.frontend-header');
    if (ArticleMuteHeader.element) ArticleMuteHeader.element.remove();
    ArticleMuteHeader.element = VM.createElement("div", {
      className: `frontend-header ${count.all === 0 ? 'hidden' : ''}`
    }, VM.createElement("span", {
      className: "filter-title"
    }, "\uD544\uD130\uB41C \uAC8C\uC2DC\uBB3C"), VM.createElement("span", {
      className: "filter-count-container"
    }, Object.keys(count).map(key => {
      const onClick = () => {
        const className = `show-filtered${key === 'all' ? '' : `-${key}`}`;

        if (container.classList.contains(className)) {
          container.classList.remove(className);
        } else {
          container.classList.add(className);
        }
      };

      ArticleMuteHeader[key] = VM.createElement("span", {
        className: `filter-count 
                  filter-count${key === 'all' ? '' : `-${key}`} 
                  ${count[key] === 0 ? 'hidden' : ''}`,
        onClick: onClick
      }, ContentTypeString[key], " (", count[key], ")");
      return ArticleMuteHeader[key];
    })));
    container.insertAdjacentElement('afterbegin', ArticleMuteHeader.element);
    return;
  }

  if (count.all === 0) {
    ArticleMuteHeader.element.classList.add('hidden');
    return;
  }

  ArticleMuteHeader.element.classList.remove('hidden');
  Object.keys(count).forEach(key => {
    if (count[key] === 0) {
      ArticleMuteHeader[key].classList.add('hidden');
      return;
    }

    ArticleMuteHeader[key].classList.remove('hidden');
    ArticleMuteHeader[key].textContent = `${ContentTypeString[key]} (${count[key]})`;
  });
}

const CommentMuteHeader = {
  element: null
};

function muteComment() {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', muteComment, {
      once: true
    });
    return;
  }

  const muteType = getValue(MUTE_REPLY_TYPE);
  const container = document.querySelector('#comment .list-area');
  if (!container) return;
  const items = container.querySelectorAll(muteType === 'target-only' ? '.comment-item' : '.comment-wrapper');
  const count = mapFilter([...items].map(e => {
    const userElement = e.querySelector('.user-info');
    const keywordElement = e.querySelector('.message');
    return {
      element: e,
      user: parseUserInfo(userElement),
      content: keywordElement.textContent,
      category: ''
    };
  }));

  if (!CommentMuteHeader.element) {
    CommentMuteHeader.element = container.previousElementSibling;
    if (CommentMuteHeader.element.classList.contains('frontend-header')) CommentMuteHeader.element.remove();
    CommentMuteHeader.element = VM.createElement("div", {
      className: `frontend-header ${count.all === 0 ? 'hidden' : ''}`
    }, VM.createElement("span", {
      className: "filter-title"
    }, "\uD544\uD130\uB41C \uB313\uAE00"), VM.createElement("span", {
      className: "filter-count-container"
    }, Object.keys(count).map(key => {
      const onClick = () => {
        const className = `show-filtered${key === 'all' ? '' : `-${key}`}`;

        if (container.classList.contains(className)) {
          container.classList.remove(className);
        } else {
          container.classList.add(className);
        }
      };

      CommentMuteHeader[key] = VM.createElement("span", {
        className: `filter-count 
                filter-count${key === 'all' ? '' : `-${key}`} 
                ${count[key] === 0 ? 'hidden' : ''}`,
        onClick: onClick
      }, ContentTypeString[key], " (", count[key], ")");
      return CommentMuteHeader[key];
    })));
    container.insertAdjacentElement('beforebegin', CommentMuteHeader.element);
    return;
  }

  container.insertAdjacentElement('beforebegin', CommentMuteHeader.element);

  if (count.all === 0) {
    CommentMuteHeader.element.classList.add('hidden');
    return;
  }

  CommentMuteHeader.element.classList.remove('hidden');
  Object.keys(count).forEach(key => {
    if (count[key] === 0) {
      CommentMuteHeader[key].classList.add('hidden');
      return;
    }

    CommentMuteHeader[key].classList.remove('hidden');
    CommentMuteHeader[key].textContent = `${ContentTypeString[key]} (${count[key]})`;
  });
}

function mapFilter(items) {
  const count = {};

  for (const key of Object.keys(ContentTypeString)) {
    count[key] = 0;
  }

  const channel = parseChannelID();
  const categoryMap = parseChannelCategory(true);
  const {
    users,
    keywords
  } = unsafeWindow.LiveConfig.mute || {
    users: [],
    keywords: []
  };
  const userlist = Array.from(new Set([...users, ...getValue(BLOCK_USER)]));
  const keywordlist = Array.from(new Set([...keywords, ...getValue(BLOCK_KEYWORD)]));
  const categoryConfig = getValue(MUTE_CATEGORY)[channel] || {};
  items.forEach(({
    element,
    user,
    content,
    category
  }) => {
    if (userlist.length && new RegExp(userlist.join('|')).test(user)) {
      element.classList.add('filtered');
      element.classList.add('filtered-user');
      count.user += 1;
      count.all += 1;
    }

    if (keywordlist.length && new RegExp(keywordlist.join('|')).test(content)) {
      element.classList.add('filtered');
      element.classList.add('filtered-keyword');
      count.keyword += 1;
      count.all += 1;
    }

    const {
      muteArticle: muteCategory
    } = categoryConfig[categoryMap[category]] || {
      muteArticle: false
    };

    if (muteCategory) {
      element.classList.add('filtered');
      element.classList.add('filtered-category');
      count.category += 1;
      count.all += 1;
    }

    if (element.classList.contains('deleted')) {
      element.classList.add('filtered');
      element.classList.add('filtered-deleted');
      count.deleted += 1;
      count.all += 1;
    }
  });
  return count;
}

function muteSidebar() {
  let keywordlist = getValue(BLOCK_KEYWORD);

  if ((unsafeWindow.LiveConfig || undefined) && unsafeWindow.LiveConfig.mute !== undefined) {
    keywordlist.push(...unsafeWindow.LiveConfig.mute.keywords);
    keywordlist = Array.from(new Set(keywordlist));
  }

  if (keywordlist.length === 0) return;
  const contents = document.querySelectorAll('#recentLive .link-list a, #recentChannelHeadline .link-list a');
  contents.forEach(e => {
    if (new RegExp(keywordlist.join('|')).test(e.textContent)) {
      e.replaceWith(VM.createElement("span", null, "\uD0A4\uC6CC\uB4DC \uBBA4\uD2B8 \uB428"));
    }
  });
}

function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace('#', '');
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}
function getRandomColor() {
  return `00000${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase()}`.slice(-6);
}

var styles = {"wrapper":"CategoryColor-module_wrapper__3fu3y","item":"CategoryColor-module_item__rfess","bold":"CategoryColor-module_bold__1gN9W"};
var stylesheet$1=".CategoryColor-module_wrapper__3fu3y {\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.CategoryColor-module_item__rfess {\r\n  min-height: 3rem;\r\n\r\n  display: grid;\r\n  grid-template-columns: 4fr 1fr 1fr 6fr;\r\n  grid-template-areas: 'category badge bg etc';\r\n  align-items: stretch;\r\n\r\n  border-top: 1px solid var(--color-border-outer);\r\n}\r\n\r\n@media screen and (max-width: 768px) {\r\n  .CategoryColor-module_item__rfess {\r\n    grid-template-columns: 4fr 1fr 1fr;\r\n    grid-template-areas:\r\n      'category badge bg'\r\n      'etc etc etc';\r\n  }\r\n}\r\n\r\n.CategoryColor-module_item__rfess label {\r\n  margin: 0;\r\n}\r\n\r\n.CategoryColor-module_bold__1gN9W {\r\n  font-weight: 700;\r\n}\r\n\r\n.pickr {\r\n  border: 1px solid var(--color-border-outer);\r\n  border-radius: 0.15em;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div {\r\n  height: 3rem;\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div:nth-child(1) {\r\n  grid-area: category;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div:nth-child(2) {\r\n  grid-area: badge;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div:nth-child(3) {\r\n  grid-area: bg;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div:nth-child(4) {\r\n  grid-area: etc;\r\n}\r\n";

var CategoryColor = {
  load: load$5
};
const CATEGORY_COLOR = {
  key: 'categoryColor',
  defaultValue: {}
};

async function load$5() {
  try {
    if (await waitForElement(BOARD_LOADED)) {
      setupSetting$4();
      generateColorStyle();
      apply$1();
      addAREventListener('ArticleChange', {
        priority: 0,
        callback: apply$1
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function renderColorPicker(disabled) {
  const element = VM.createElement("div", {
    className: "pickr"
  });
  const wrapper = VM.createElement(VM.Fragment, null, element);
  const handler = new window.Pickr({
    el: element,
    theme: 'nano',
    disabled,
    lockOpacity: true,
    default: null,
    components: {
      palette: false,
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        hex: true,
        hsv: true,
        input: true,
        clear: true,
        save: true
      }
    }
  }).on('save', () => handler.hide());
  return [wrapper, handler];
}

function setupSetting$4() {
  const category = parseChannelCategory();
  const dataContainer = {};
  const settingWrapper = VM.createElement("div", {
    className: styles.wrapper
  }, VM.createElement("style", null, stylesheet$1), VM.createElement("style", null, GM_getResourceText('colorpicker')), Object.keys(category).map(key => {
    const name = category[key];
    const badgeElement = VM.createElement("span", {
      className: "badge badge-success",
      style: {
        margin: '0.25rem'
      }
    }, name);
    const bgElement = VM.createElement("div", null, badgeElement, "\uC81C\uBAA9");
    const [badgeInput, badgeContainer] = renderColorPicker(name === '일반');
    const [bgInput, bgContainer] = renderColorPicker(false);
    const boldInput = VM.createElement("input", {
      type: "checkbox"
    });
    const throughInput = VM.createElement("input", {
      type: "checkbox"
    });
    const disableVisitedInput = VM.createElement("input", {
      type: "checkbox"
    });
    badgeContainer.on('save', color => {
      if (color) {
        const badge = color.toHEXA().toString();
        badgeElement.style.backgroundColor = badge;
        badgeElement.style.color = getContrastYIQ(badge);
      } else {
        badgeElement.style.backgroundColor = '';
        badgeElement.style.color = '';
      }
    });
    bgContainer.on('save', color => {
      if (color) {
        const bg = color.toHEXA().toString();
        bgElement.style.background = `linear-gradient(90deg, ${bg}, rgba(255, 255, 255, 0))`;
        bgElement.style.color = getContrastYIQ(bg);
      } else {
        bgElement.style.background = '';
        bgElement.style.color = '';
      }
    });
    boldInput.addEventListener('click', () => {
      bgElement.style.fontWeight = boldInput.checked ? 'bold' : '';
    });
    throughInput.addEventListener('click', () => {
      bgElement.style.textDecoration = throughInput.checked ? 'line-through' : '';
    });
    dataContainer[key] = {
      test: {
        bg: bgElement,
        badge: badgeElement
      },
      badge: badgeContainer,
      bgcolor: bgContainer,
      bold: boldInput,
      through: throughInput,
      disableVisited: disableVisitedInput
    };
    return VM.createElement("div", {
      className: styles.item
    }, bgElement, VM.createElement("div", null, badgeInput), VM.createElement("div", null, bgInput), VM.createElement("div", null, VM.createElement("label", {
      title: "\uAC8C\uC2DC\uBB3C \uC81C\uBAA9\uC774 \uAD75\uAC8C \uD45C\uC2DC\uB429\uB2C8\uB2E4."
    }, boldInput, VM.createElement("span", null, "\uAD75\uAC8C")), VM.createElement("label", {
      title: "\uAC8C\uC2DC\uBB3C \uC81C\uBAA9\uC5D0 \uCDE8\uC18C\uC120\uC744 \uAE0B\uC2B5\uB2C8\uB2E4."
    }, throughInput, VM.createElement("span", null, "\uCDE8\uC18C\uC120")), VM.createElement("label", {
      title: "\uC5F4\uC5B4\uBCF8 \uAC8C\uC2DC\uBB3C\uC774 \uD68C\uC0C9\uC73C\uB85C \uD45C\uC2DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
    }, disableVisitedInput, VM.createElement("span", null, "\uC5F4\uB78C \uC0C9 \uC81C\uAC70"))));
  }));
  const channel = window.location.pathname.split('/')[2];
  addSetting({
    header: '카테고리 색상 설정',
    group: [{
      title: '색상 변경',
      description: VM.createElement("ul", null, VM.createElement("li", null, "\uC55E \uC0C9\uC0C1 \uD53C\uCEE4: \uCE74\uD14C\uACE0\uB9AC \uC0C9\uC0C1\uC744 \uBCC0\uACBD\uD569\uB2C8\uB2E4."), VM.createElement("li", null, "\uB4A4 \uC0C9\uC0C1 \uD53C\uCEE4: \uAC8C\uC2DC\uBB3C\uC758 \uBC30\uACBD\uC0C9\uC744 \uBCC0\uACBD\uD569\uB2C8\uB2E4."), VM.createElement("li", null, "\uAD75\uAC8C: \uC81C\uBAA9\uC758 \uAE00\uC528\uAC00 \uB450\uAECD\uAC8C \uD45C\uAE30\uB429\uB2C8\uB2E4."), VM.createElement("li", null, "\uCDE8\uC18C\uC120: \uC81C\uBAA9\uC758 \uAE00\uC528 \uC911\uAC04\uC5D0 \uC120\uC774 \uADF8\uC5B4\uC9D1\uB2C8\uB2E4."), VM.createElement("li", null, "\uC5F4\uB78C \uC0C9 \uC81C\uAC70: \uAC8C\uC2DC\uBB3C \uC5F4\uB78C \uC2DC \uD574\uB2F9 \uAC8C\uC2DC\uBB3C\uC774 \uD68C\uC0C9\uC73C\uB85C \uD45C\uAE30\uB418\uB294 \uAC83\uC744 \uBC29\uC9C0\uD569\uB2C8\uB2E4.")),
      content: settingWrapper,
      type: 'wide'
    }],
    configHandler: {
      save() {
        const config = getValue(CATEGORY_COLOR);
        let channelConfig = config[channel];
        if (!channelConfig) channelConfig = {};
        const defaultConfig = {
          badge: '',
          bgcolor: '',
          bold: false,
          through: false,
          disableVisited: false
        };

        for (const key in dataContainer) {
          if (dataContainer[key]) {
            const badge = dataContainer[key].badge.getSelectedColor();
            const bgcolor = dataContainer[key].bgcolor.getSelectedColor();
            const bold = dataContainer[key].bold.checked;
            const through = dataContainer[key].through.checked;
            const disableVisited = dataContainer[key].disableVisited.checked;
            channelConfig[key] = {
              badge: badge ? badge.toHEXA().toString() : '',
              bgcolor: bgcolor ? bgcolor.toHEXA().toString() : '',
              bold,
              through,
              disableVisited
            };

            if (JSON.stringify(channelConfig[key]) === JSON.stringify(defaultConfig)) {
              delete channelConfig[key];
            }
          }
        }

        setValue(CATEGORY_COLOR, _extends({}, config, {
          [channel]: channelConfig
        }));
      },

      load() {
        const config = getValue(CATEGORY_COLOR)[channel];
        if (!config) return;

        for (const key in dataContainer) {
          if (config[key]) {
            const {
              badge,
              bgcolor,
              bold,
              through,
              disableVisited
            } = config[key];
            dataContainer[key].badge.setColor(badge || null);
            dataContainer[key].bgcolor.setColor(bgcolor || null);
            dataContainer[key].bold.checked = bold;
            dataContainer[key].through.checked = through;
            dataContainer[key].disableVisited.checked = disableVisited;
            const {
              badge: badgeElement,
              bg: bgElement
            } = dataContainer[key].test;

            if (badge) {
              badgeElement.style.backgroundColor = badge;
              badgeElement.style.color = getContrastYIQ(badge);
            }

            if (bgcolor) {
              bgElement.style.background = `linear-gradient(90deg, ${bgcolor}, rgba(255, 255, 255, 0))`;
              bgElement.style.color = getContrastYIQ(bgcolor);
            }

            if (bold) {
              bgElement.style.fontWeight = 'bold';
            }

            if (through) {
              bgElement.style.textDecoration = 'line-through';
            }
          }
        }
      }

    }
  });
}

const styleTable = {};

function generateColorStyle() {
  const channel = window.location.pathname.split('/')[2];
  const categoryConfig = getValue(CATEGORY_COLOR)[channel];
  if (!categoryConfig) return;
  const style = [];

  for (const key in categoryConfig) {
    if (categoryConfig[key]) {
      const {
        badge,
        bgcolor,
        bold,
        through,
        disableVisited
      } = categoryConfig[key];
      let styleKey;

      do {
        styleKey = Math.random().toString(36).substr(2);
      } while (styleTable[styleKey]);

      if (bgcolor) {
        style.push(`
            .color_${styleKey} {
              background-color: ${bgcolor} !important;
              color: ${getContrastYIQ(bgcolor)};
            }
          `);
      }

      if (badge) {
        style.push(`
            .color_${styleKey} .badge {
              background-color: ${badge} !important;
              color: ${getContrastYIQ(badge)};
            }
          `);
      }

      if (bold) {
        style.push(`
            .color_${styleKey} .title {
              font-weight: bold;
            }
          `);
      }

      if (through) {
        style.push(`
            .color_${styleKey} .title {
              text-decoration: line-through;
            }
          `);
      }

      if (disableVisited) {
        style.push(`
            .color_${styleKey}:visited {
              color: ${bgcolor ? getContrastYIQ(bgcolor) : 'var(--color-text-color)'} !important;
            }
          `);
      }

      styleTable[key] = styleKey;
    }
  }

  document.head.append(VM.createElement("style", null, style));
}

function apply$1() {
  const articles = document.querySelectorAll(BOARD_ARTICLES);
  const categoryMap = parseChannelCategory(true);
  articles.forEach(article => {
    if (article.childElementCount < 2) return;
    const categoryElement = article.querySelector('.badge');
    if (!categoryElement) return;
    const categoryText = categoryElement.textContent ? categoryElement.textContent : '일반';
    const categoryID = categoryMap[categoryText];
    if (!styleTable[categoryID]) return;
    article.classList.add(`color_${styleTable[categoryID]}`);
  });
}

var CommentRefresh = {
  load: load$6
};

async function load$6() {
  try {
    if (await waitForElement(COMMENT_LOADED)) {
      apply$2();
    }
  } catch (error) {
    console.error(error);
  }
}

function apply$2() {
  const commentArea = document.querySelector('#comment');

  if (!commentArea || commentArea.querySelector('.alert')) {
    // 댓글 작성 권한 없음
    return;
  }

  const btn = VM.createElement("button", {
    className: "btn btn-arca",
    style: {
      marginLeft: '1rem'
    }
  }, VM.createElement("span", {
    className: "icon ion-android-refresh"
  }), VM.createElement("span", null, " \uC0C8\uB85C\uACE0\uCE68"));
  const clonebtn = btn.cloneNode(true);
  commentArea.querySelector('.title').insertAdjacentElement('beforeend', btn);
  commentArea.querySelector('.subtitle').append(clonebtn);

  async function onClick(event) {
    event.preventDefault();
    btn.disabled = true;
    clonebtn.disabled = true;
    const response = await getRefreshData();
    const newComments = response.querySelector('#comment .list-area');

    try {
      commentArea.querySelector('.list-area').remove();
    } catch (_unused) {// eslint-disable-next-line no-empty
    }

    if (newComments) {
      newComments.querySelectorAll('time').forEach(time => {
        time.textContent = getDateStr(time.dateTime);
      });
      commentArea.querySelector('.title').insertAdjacentElement('afterend', newComments);
      dispatchAREvent('CommentChange');
    }

    btn.disabled = false;
    clonebtn.disabled = false;
  }

  btn.addEventListener('click', onClick);
  clonebtn.addEventListener('click', onClick);
}

function getRefreshData() {
  return new Promise(resolve => {
    const req = new XMLHttpRequest();
    req.open('GET', window.location.href);
    req.responseType = 'document';
    req.addEventListener('load', () => {
      resolve(req.response);
    });
    req.send();
  });
}

function getBlob(url, onProgress, onLoad) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      responseType: 'blob',
      onprogress: event => {
        if (onProgress) onProgress(event);
      },
      onload: response => {
        if (onLoad) onLoad();
        resolve(response.response);
      },
      onerror: error => {
        reject(new Error('이미지 blob 다운로드 중 오류 발생', error));
      }
    });
  });
}
function getDocument({
  method,
  url,
  timeout,
  data,
  error
}) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method,
      url,
      timeout,
      data,

      onload(response) {
        resolve(_extends({}, response, {
          response: new DOMParser().parseFromString(response.responseText, 'text/html')
        }));
      },

      ontimeout() {
        reject(error);
      },

      onerror() {
        reject(error);
      }

    });
  });
}

var MuteEmoticon = {
  load: load$7
};
const BLOCK_EMOTICON = {
  key: 'blockEmoticon',
  defaultValue: {}
};

async function load$7() {
  try {
    setupSetting$5();

    if (await waitForElement(COMMENT_LOADED)) {
      muteComment$1();
      appendMuteBtn();
    }

    if (await waitForElement(BOARD_LOADED)) {
      muteArticle$1();
      mutePreview$1();
    }

    addAREventListener('ArticleChange', {
      priority: 100,

      callback() {
        mutePreview$1();
      }

    });
    addAREventListener('CommentChange', {
      priority: 100,

      callback() {
        muteComment$1();
        appendMuteBtn();
      }

    });
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$5() {
  const muteEmoticon = VM.createElement("select", {
    size: "6",
    multiple: ""
  });
  const deleteBtn = VM.createElement("button", {
    className: "btn btn-arca"
  }, "\uC0AD\uC81C");
  deleteBtn.addEventListener('click', event => {
    event.target.disabled = true;
    const removeElements = muteEmoticon.selectedOptions;

    while (removeElements.length > 0) removeElements[0].remove();

    event.target.disabled = false;
  });
  addSetting({
    header: '아카콘',
    group: [{
      title: '뮤트 설정',
      description: VM.createElement(VM.Fragment, null, "\uC544\uCE74\uCF58 \uBBA4\uD2B8\uB294 \uB313\uAE00\uC5D0\uC11C \uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.", VM.createElement("br", null), "Ctrl, Shift, \uB9C8\uC6B0\uC2A4 \uB4DC\uB798\uADF8\uB97C \uC774\uC6A9\uD574\uC11C \uC5EC\uB7EC\uAC1C\uB97C \uB3D9\uC2DC\uC5D0 \uC120\uD0DD \uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
      content: VM.createElement(VM.Fragment, null, muteEmoticon, deleteBtn),
      type: 'wide'
    }],
    configHandler: {
      save() {
        const data = getValue(BLOCK_EMOTICON);
        const keys = Array.from(muteEmoticon.children, e => e.value);

        for (const key in data) {
          if (keys.indexOf(key) === -1) delete data[key];
        }

        setValue(BLOCK_EMOTICON, data);
      },

      load() {
        const data = getValue(BLOCK_EMOTICON);

        while (muteEmoticon.firstChild) muteEmoticon.lastChild.remove();

        for (const key of Object.keys(data)) {
          muteEmoticon.append(VM.createElement("option", {
            value: key
          }, data[key].name));
        }
      }

    }
  });
}

function mutePreview$1() {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      mutePreview$1();
    }, {
      once: true
    });
    return;
  }

  const blockEmoticons = getValue(BLOCK_EMOTICON);
  let list = [];

  for (const key in blockEmoticons) {
    if ({}.hasOwnProperty.call(blockEmoticons, key)) {
      list = list.concat(blockEmoticons[key].url);
    }
  }

  const images = document.querySelectorAll('.vrow-preview noscript, .vrow-preview img');
  images.forEach(e => {
    let url;

    if (e.matches('img')) {
      url = e.src.replace('https:', '').replace('?type=list', '');
    } else {
      url = e.textContent.match(/\/\/.+\?/g)[0].replace('?', '');
    }

    if (list.indexOf(url) > -1) {
      e.parentNode.remove();
    }
  });
}

function muteArticle$1() {
  const blockEmoticons = getValue(BLOCK_EMOTICON);
  let list = [];

  for (const key in blockEmoticons) {
    if ({}.hasOwnProperty.call(blockEmoticons, key)) {
      list = list.concat(blockEmoticons[key].url);
    }
  }

  const images = document.querySelectorAll('.article-body img');
  images.forEach(e => {
    if (e.clientWidth > 100 || e.clientHeight > 100) return;
    const url = e.src.replace('https:', '');

    if (list.indexOf(url) > -1) {
      e.replaceWith(VM.createElement("p", null, "[\uC544\uCE74\uCF58 \uBBA4\uD2B8\uB428]"));
    }
  });
}

function muteComment$1() {
  const blockEmoticons = getValue(BLOCK_EMOTICON);
  let list = [];

  for (const key in blockEmoticons) {
    if ({}.hasOwnProperty.call(blockEmoticons, key)) {
      list = list.concat(blockEmoticons[key].bundle);
    }
  }

  const comments = document.querySelectorAll('#comment .comment-item');
  comments.forEach(item => {
    const emoticon = item.querySelector('.emoticon');

    if (emoticon) {
      const id = Number(emoticon.dataset.id);

      if (list.indexOf(id) > -1) {
        emoticon.closest('.message').innerText = '[아카콘 뮤트됨]';
      }
    }
  });
}

function appendMuteBtn() {
  const commentArea = document.querySelector('#comment');
  if (!commentArea) return;
  const emoticons = commentArea.querySelectorAll('.emoticon');
  emoticons.forEach(item => {
    const btn = VM.createElement("span", null, '\n | ', VM.createElement("a", {
      href: "#",
      className: "block-emoticon",
      "data-id": item.dataset.id,
      "data-url": item.src.replace('https:', '')
    }, VM.createElement("span", {
      className: "ion-ios-close"
    }), ' 아카콘 뮤트'));
    const timeElement = item.closest('.content').querySelector('.right > time');
    timeElement.insertAdjacentElement('afterend', btn);
  });
  commentArea.addEventListener('click', async event => {
    if (!event.target.classList.contains('block-emoticon')) return;

    try {
      event.preventDefault();
      event.target.textContent = '뮤트 처리 중...';
      event.target.classList.remove('block-emoticon');
      const id = event.target.dataset.id;
      const img = event.target.dataset.url;
      const blockEmoticon = getValue(BLOCK_EMOTICON);
      const [name, bundleID] = await getEmoticonInfo(id);

      if (blockEmoticon[bundleID]) {
        blockEmoticon[bundleID].bundle.push(Number(id));
        blockEmoticon[bundleID].url.push(img);
      } else {
        const [bundle, url] = await getEmoticonBundle(bundleID);
        blockEmoticon[bundleID] = {
          name,
          bundle,
          url
        };
      }

      setValue(BLOCK_EMOTICON, blockEmoticon);
    } catch (error) {
      alert(error);
      console.error(error);
    }

    window.location.reload();
  });
}

async function getEmoticonInfo(id) {
  const response = await getDocument({
    method: 'GET',
    url: `/api/emoticon/shop/${id}`,
    timeout: 10000,
    error: new Error('이모티콘 정보를 받아오지 못했습니다.\n사유: 접속 실패')
  });

  try {
    const bundleID = response.finalUrl.match(/[0-9]+$/)[0];
    const nameElement = response.response.querySelector('.article-head .title');
    let name = `삭제된 이모티콘 - ${bundleID}`;
    if (nameElement) name = nameElement.textContent;
    return [name, bundleID];
  } catch (error) {
    throw new Error('이모티콘 정보를 받아오지 못했습니다.\n사유: 사이트 구조 변경, 기타');
  }
}

function getEmoticonBundle(bundleID) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `/api/emoticon/${bundleID}`,
      responseType: 'json',

      onload({
        response
      }) {
        const bundle = response.map(item => item.id);
        const url = response.map(item => item.imageUrl);
        resolve([bundle, url]);
      },

      ontimeout() {
        reject(new Error('이모티콘 번들 정보를 받아오지 못했습니다.\n사유: Timeout'));
      },

      onerror(error) {
        reject(new Error('이모티콘 번들 정보를 받아오지 못했습니다.\n사유: 접속 실패', error));
      }

    });
  });
}

var styles$1 = {"green":"IPScouter-module_green__K9yWK","red":"IPScouter-module_red__3yMjL","blue":"IPScouter-module_blue__YSAPo"};
var stylesheet$2=".ips + .IPScouter-module_green__K9yWK {\r\n  color: rgb(37, 141, 37);\r\n}\r\n\r\n.ips + .IPScouter-module_red__3yMjL {\r\n  color: rgb(236, 69, 69);\r\n}\r\n\r\n.ips + .IPScouter-module_blue__YSAPo {\r\n  color: rgb(56, 174, 252);\r\n}\r\n";

var IPScouter = {
  load: load$8
};

async function load$8() {
  try {
    await waitForElement(BOARD_LOADED);
    appendStyle();
    apply$3();
    addAREventListener('ArticleChange', {
      priority: 0,

      callback() {
        apply$3('board');
      }

    });
    addAREventListener('CommentChange', {
      priority: 0,

      callback() {
        apply$3('comment');
      }

    });
  } catch (error) {
    console.error(error);
  }
}

function appendStyle() {
  document.head.append(VM.createElement("style", null, stylesheet$2));
}

function apply$3(viewQuery) {
  let parentElement = document;

  if (viewQuery === 'board') {
    parentElement = document.querySelector('div.board-article-list .list-table, div.included-article-list .list-table');
  }

  if (viewQuery === 'article') {
    parentElement = document.querySelector('.article-head');
  }

  if (viewQuery === 'comment') {
    parentElement = document.querySelector('#comment');
  }

  const ipElements = parentElement.querySelectorAll('.user-info small:not(.ips)');
  ipElements.forEach(ipElement => {
    const ip = ipElement.textContent.replace(/\(|\)/g, '');
    const [result, color] = checkIP(ip);
    ipElement.classList.add('ips');
    ipElement.parentNode.append(VM.createElement("span", {
      className: color
    }, ` - ${result}`));
  });
}

function checkIP(ip) {
  let result = '고정';
  let color = styles$1.green;

  for (const key of Object.keys(DB)) {
    if (DB[key].indexOf(ip) > -1) {
      result = IPType[key].str;
      color = IPType[key].color;
      break;
    }
  }

  return [result, color];
}

const DB = {
  KT: ['1.96', '1.97', '1.98', '1.99', '1.100', '1.101', '1.102', '1.103', '1.104', '1.105', '1.106', '1.107', '1.108', '1.109', '1.110', '1.111', '39.4', '39.5', '39.6', '39.7', '49.16', '49.17', '49.18', '49.19', '49.20', '49.21', '49.22', '49.23', '49.24', '49.25', '49.26', '49.27', '49.28', '49.29', '49.30', '49.31', '49.56', '49.57', '49.58', '49.59', '49.60', '49.61', '49.62', '49.63', '110.68', '110.69', '110.70', '110.71', '116.200', '116.201', '118.234', '118.235', '119.194', '163.213', '163.222', '163.229', '163.255', '175.216', '175.217', '175.218', '175.219', '175.220', '175.221', '175.222', '175.223', '211.246'],
  SK: ['27.160', '27.161', '27.162', '27.163', '27.164', '27.165', '27.166', '27.167', '27.168', '27.169', '27.170', '27.171', '27.172', '27.173', '27.174', '27.175', '27.176', '27.177', '27.178', '27.179', '27.180', '27.181', '27.182', '27.183', '42.16', '42.17', '42.18', '42.19', '42.20', '42.21', '42.22', '42.23', '42.24', '42.25', '42.26', '42.27', '42.28', '42.29', '42.30', '42.31', '42.32', '42.33', '42.34', '42.35', '42.36', '42.37', '42.38', '42.39', '42.40', '42.41', '42.42', '42.43', '42.44', '42.45', '42.46', '42.47', '58.102', '58.103', '111.218', '111.219', '113.216', '113.217', '114.52', '114.53', '123.228', '123.229', '124.0', '124.1', '124.2', '124.3', '124.136', '124.137', '124.138', '124.139', '180.132', '180.133', '180.134', '180.135', '219.252', '219.253', '220.103', '223.32', '223.33', '223.34', '223.35', '223.36', '223.37', '223.38', '223.39', '223.40', '223.41', '223.42', '223.43', '223.44', '223.45', '223.46', '223.47', '223.48', '223.49', '223.50', '223.51', '223.52', '223.53', '223.54', '223.55', '223.56', '223.57', '223.58', '223.59', '223.60', '223.61', '223.62', '223.63'],
  LG: ['106.96', '109.97', '109.98', '109.99', '106.100', '106.101', '106.102', '106.103', '117.110', '117.111', '211.36', '223.168', '223.169', '223.170', '223.171', '223.172', '223.173', '223.174', '223.175'],
  zenmate: ['5.79', '5.254', '31.3', '37.58', '37.221', '46.28', '46.183', '50.7', '62.210', '66.249', '89.238', '89.238', '91.221', '94.242', '95.141', '103.10', '103.254', '107.167', '109.200', '176.123', '178.162', '178.255', '179.43', '185.9', '185.82', '185.104', '192.71', '192.99', '193.182', '207.244', '209.58'],
  tor: ['1.161', '103.28', '103.16', '103.125', '103.194', '103.208', '103.214', '103.234', '103.236', '103.75', '104.40', '104.194', '104.196', '104.200', '104.218', '104.244', '107.155', '109.69', '109.70', '109.169', '109.194', '109.201', '109.248', '114.32', '111.90', '114.158', '115.73', '118.163', '119.237', '122.147', '123.30', '124.109', '125.212', '126.75', '128.14', '128.199', '128.31', '130.149', '137.74', '138.197', '139.162', '139.28', '139.99', '142.44', '142.58', '142.93', '143.202', '144.217', '145.239', '149.202', '151.53', '151.73', '151.77', '153.229', '154.127', '156.54', '157.157', '157.161', '157.230', '158.174', '158.69', '159.89', '160.119', '160.202', '162.213', '162.244', '162.247', '163.172', '164.132', '164.77', '166.70', '167.114', '167.86', '167.99', '169.197', '171.22', '171.244', '171.25', '172.96', '172.98', '173.14', '173.199', '173.212', '173.244', '173.255', '176.10', '176.126', '176.152', '176.214', '176.31', '176.53', '177.205', '178.128', '178.165', '178.17', '178.175', '178.20', '178.239', '178.254', '178.32', '178.9', '179.43', '179.48', '18.18', '18.85', '180.149', '180.150', '184.75', '185.10', '185.100', '185.103', '185.104', '185.107', '185.112', '185.113', '185.117', '185.121', '185.125', '185.127', '185.129', '185.14', '185.147', '185.158', '185.162', '185.165', '185.169', '185.175', '185.177', '185.193', '185.195', '185.203', '185.220', '185.222', '185.227', '185.233', '185.234', '185.242', '185.244', '185.248', '185.255', '185.4', '185.56', '185.61', '185.65', '185.66', '185.72', '185.86', '185.9', '186.214', '187.178', '188.166', '188.214', '188.65', '189.84', '190.10', '190.164', '190.210', '190.216', '191.114', '191.243', '191.32', '192.160', '192.195', '192.227', '192.34', '192.42', '192.68', '193.110', '193.150', '193.169', '193.201', '193.36', '193.56', '193.9', '193.90', '194.71', '194.99', '195.123', '195.176', '195.206', '195.228', '195.254', '196.41', '197.231', '198.167', '198.211', '198.46', '198.50', '198.96', '198.98', '199.127', '199.195', '199.249', '199.87', '200.52', '200.86', '200.98', '201.80', '203.78', '204.11', '204.17', '204.194', '204.8', '204.85', '205.168', '205.185', '206.248', '206.55', '207.244', '208.12', '209.126', '209.141', '209.95', '210.140', '210.160', '212.16', '212.21', '212.47', '212.75', '212.81', '213.108', '213.136', '213.160', '213.202', '213.252', '213.61', '213.95', '216.218', '216.239', '217.115', '217.12', '217.170', '220.135', '223.26', '23.129', '23.239', '24.20', '24.3', '27.122', '31.131', '31.185', '31.220', '31.31', '35.0', '37.128', '37.139', '37.187', '37.220', '37.228', '37.28', '37.48', '40.124', '41.215', '41.77', '45.114', '45.125', '45.32', '45.33', '45.35', '45.56', '45.76', '45.79', '46.101', '46.165', '46.166', '46.173', '46.182', '46.194', '46.23', '46.246', '46.29', '46.38', '46.98', '5.135', '5.150', '5.189', '5.196', '5.199', '5.2', '5.252', '5.3', '5.34', '5.39', '5.79', '50.247', '51.15', '51.254', '51.255', '51.38', '51.68', '51.75', '51.77', '52.167', '54.36', '54.37', '54.39', '58.153', '58.96', '59.127', '62.102', '62.210', '62.212', '62.219', '62.98', '64.113', '64.27', '65.181', '65.19', '66.110', '66.146', '66.155', '66.175', '66.42', '66.70', '67.163', '67.215', '69.162', '69.164', '70.168', '71.19', '72.14', '72.210', '72.221', '72.83', '73.15', '74.82', '77.141', '77.247', '77.55', '77.73', '77.81', '78.109', '78.142', '78.46', '79.117', '79.134', '79.141', '79.172', '80.127', '80.241', '80.67', '80.68', '80.79', '81.17', '82.118', '82.151', '82.221', '82.223', '82.228', '82.94', '84.19', '84.200', '84.209', '85.214', '85.235', '85.248', '86.123', '86.124', '86.127', '86.148', '87.101', '87.118', '87.120', '87.123', '87.247', '88.130', '88.76', '89.234', '89.236', '89.247', '89.31', '91.132', '91.146', '91.203', '91.207', '91.213', '91.219', '91.231', '92.116', '92.222', '92.63', '93.174', '93.55', '94.100', '94.102', '94.140', '94.168', '94.230', '94.242', '94.32', '95.128', '95.130', '95.142', '95.143', '95.168', '95.179', '95.211', '95.216', '96.66', '96.70', '97.74', '98.174'],
  hola: ['103.18', '104.131', '106.185', '106.186', '106.187', '107.161', '107.170', '107.181', '107.190', '107.191', '107.22', '108.61', '109.74', '14.136', '149.154', '149.62', '151.236', '158.255', '162.217', '162.218', '162.221', '162.243', '167.88', '168.235', '176.58', '176.9', '177.67', '178.209', '178.79', '192.110', '192.121', '192.184', '192.211', '192.241', '192.30', '192.40', '192.73', '192.81', '192.99', '198.147', '198.58', '199.241', '208.68', '209.222', '213.229', '217.78', '23.227', '23.249', '23.29', '31.193', '37.235', '41.223', '46.17', '46.19', '46.4', '5.9', '50.116', '54.225', '54.243', '66.85', '77.237', '81.4', '85.234', '88.150', '91.186', '92.48', '94.76', '95.215', '96.126']
};
const IPType = {
  KT: {
    str: 'KT',
    color: styles$1.blue
  },
  SK: {
    str: 'SK',
    color: styles$1.blue
  },
  LG: {
    str: 'LG',
    color: styles$1.blue
  },
  zenmate: {
    str: '젠메이트',
    color: styles$1.red
  },
  tor: {
    str: '토르',
    color: styles$1.red
  },
  hola: {
    str: '홀라',
    color: styles$1.red
  }
};

var css_248z$4 = ".article-image {\r\n  margin: 1rem 0;\r\n  border: 1px solid var(--color-border-outer);\r\n  width: 100%;\r\n  padding: 0.5rem;\r\n}\r\n\r\n.article-image .image-list {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fill, minmax(100px, auto));\r\n  gap: 0.5rem;\r\n  justify-items: center;\r\n  margin-bottom: 0.5rem;\r\n}\r\n\r\n.article-image .item {\r\n  width: 100px;\r\n  height: 100px;\r\n  border: 1px solid var(--color-border-outer);\r\n  margin: 0;\r\n  background-size: cover;\r\n}\r\n\r\n.article-image button {\r\n  width: 100%;\r\n  margin-top: 0.5rem;\r\n}\r\n";

var ImageDownloader = {
  load: load$9
};
const FILENAME = {
  key: 'imageDownloaderFileName',
  defaultValue: '%title%'
};
const ZIPNAME = {
  key: 'imageDownloaderZipName',
  defaultValue: '%title%'
};
const IMAGENAME = {
  key: 'imageDonwloaderImageName',
  defaultValue: '%num%'
};
const ZIP_COMMENT = {
  key: 'imageDownloaderZipComment',
  defaultValue: '[%channel%] %title% - %url%'
};
const RETRY_COUNT = {
  key: 'imageDownloaderRetry',
  defaultValue: 3
};

async function load$9() {
  try {
    setupSetting$6();

    if (await waitForElement(ARTICLE_LOADED)) {
      addContextMenu();
      apply$4();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$6() {
  const fileName = VM.createElement("input", {
    type: "text"
  });
  const zipName = VM.createElement("input", {
    type: "text"
  });
  const imageName = VM.createElement("input", {
    type: "text"
  });
  const zipComment = VM.createElement("textarea", {
    rows: "6"
  });
  const retryCount = VM.createElement("select", null, VM.createElement("option", {
    value: "1"
  }, "1\uD68C"), VM.createElement("option", {
    value: "2"
  }, "2\uD68C"), VM.createElement("option", {
    value: "3"
  }, "3\uD68C"));
  addSetting({
    header: '이미지 다운로드',
    group: [{
      title: '우클릭 메뉴 저장 시 이미지 이름',
      description: VM.createElement(VM.Fragment, null, "\uC6B0\uD074\uB9AD \uB2E4\uC6B4\uB85C\uB4DC \uC0AC\uC6A9 \uC2DC \uC800\uC7A5\uD560 \uD30C\uC77C\uC758 \uC774\uB984\uC785\uB2C8\uB2E4.", VM.createElement("br", null), "%orig%: \uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC\uBA85 (64\uC790 \uCF54\uB4DC)", VM.createElement("br", null), "%title%: \uAC8C\uC2DC\uBB3C \uC81C\uBAA9", VM.createElement("br", null), "%category%: \uAC8C\uC2DC\uBB3C \uCE74\uD14C\uACE0\uB9AC", VM.createElement("br", null), "%author%: \uAC8C\uC2DC\uBB3C \uC791\uC131\uC790", VM.createElement("br", null), "%channel%: \uCC44\uB110 \uC774\uB984"),
      content: fileName,
      type: 'wide'
    }, {
      title: '압축파일 이름',
      description: VM.createElement(VM.Fragment, null, "\uC774\uBBF8\uC9C0 \uC77C\uAD04 \uB2E4\uC6B4\uB85C\uB4DC \uC0AC\uC6A9 \uC2DC \uC800\uC7A5\uD560 \uC555\uCD95 \uD30C\uC77C\uC758 \uC774\uB984\uC785\uB2C8\uB2E4.", VM.createElement("br", null), "%title%: \uAC8C\uC2DC\uBB3C \uC81C\uBAA9", VM.createElement("br", null), "%category%: \uAC8C\uC2DC\uBB3C \uCE74\uD14C\uACE0\uB9AC", VM.createElement("br", null), "%author%: \uAC8C\uC2DC\uBB3C \uC791\uC131\uC790", VM.createElement("br", null), "%channel%: \uCC44\uB110 \uC774\uB984"),
      content: zipName,
      type: 'wide'
    }, {
      title: '압축파일 내 이미지 이름',
      description: VM.createElement(VM.Fragment, null, "\uC800\uC7A5\uD560 \uC555\uCD95\uD30C\uC77C \uB0B4 \uC774\uBBF8\uC9C0\uC758 \uC774\uB984\uC785\uB2C8\uB2E4.", VM.createElement("br", null), "orig \uD639\uC740 num\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC774\uB984\uC744 \uAD6C\uBD84\uD574\uC57C \uC815\uC0C1\uC801\uC73C\uB85C \uAD6C\uBCC4\uB429\uB2C8\uB2E4.", VM.createElement("br", null), VM.createElement("br", null), "%orig%: \uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC\uBA85 (64\uC790 \uCF54\uB4DC)", VM.createElement("br", null), "%num%: \uB118\uBC84\uB9C1 (000~999)", VM.createElement("br", null), "%title%: \uAC8C\uC2DC\uBB3C \uC81C\uBAA9", VM.createElement("br", null), "%category%: \uAC8C\uC2DC\uBB3C \uCE74\uD14C\uACE0\uB9AC", VM.createElement("br", null), "%author%: \uAC8C\uC2DC\uBB3C \uC791\uC131\uC790", VM.createElement("br", null), "%channel%: \uCC44\uB110 \uC774\uB984"),
      content: imageName,
      type: 'wide'
    }, {
      title: '압축파일 코멘트',
      description: VM.createElement(VM.Fragment, null, "\uC800\uC7A5\uD560 \uC555\uCD95\uD30C\uC77C\uC5D0 \uB0A8\uAE38 \uCF54\uBA58\uD2B8\uC785\uB2C8\uB2E4.", VM.createElement("br", null), "%title%: \uAC8C\uC2DC\uBB3C \uC81C\uBAA9", VM.createElement("br", null), "%category%: \uAC8C\uC2DC\uBB3C \uCE74\uD14C\uACE0\uB9AC", VM.createElement("br", null), "%author%: \uAC8C\uC2DC\uBB3C \uC791\uC131\uC790", VM.createElement("br", null), "%channel%: \uCC44\uB110 \uC774\uB984", VM.createElement("br", null), "%url%: \uAC8C\uC2DC\uBB3C \uC8FC\uC18C"),
      content: zipComment,
      type: 'wide'
    }, {
      title: '다운로드 최대 시도 횟수',
      content: retryCount
    }],
    configHandler: {
      save() {
        setValue(FILENAME, fileName.value);
        setValue(ZIPNAME, zipName.value);
        setValue(IMAGENAME, imageName.value);
        setValue(ZIP_COMMENT, zipComment.value);
        setValue(RETRY_COUNT, Number(retryCount.value));
      },

      load() {
        fileName.value = getValue(FILENAME);
        zipName.value = getValue(ZIPNAME);
        imageName.value = getValue(IMAGENAME);
        zipComment.value = getValue(ZIP_COMMENT);
        retryCount.value = getValue(RETRY_COUNT);
      }

    }
  });
}

function addContextMenu() {
  const copyClipboardItem = createMenu({
    text: '클립보드에 복사',

    async onClick(event) {
      event.preventDefault();
      const url = getContextData('url');
      const title = event.target.textContent;
      const retryCount = getValue(RETRY_COUNT);

      try {
        for (let r = 1; r < retryCount; r += 1) {
          try {
            const rawData = await getBlob(url, e => {
              const progress = Math.round(e.loaded / e.total * 100);
              event.target.textContent = `${progress}%`;
            }, () => {
              event.target.textContent = '클립보드에 복사 중...';
            });
            const canvas = document.createElement('canvas');
            const canvasContext = canvas.getContext('2d');
            const convertedBlob = await new Promise(resolve => {
              const img = new Image();

              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                canvasContext.drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                  resolve(blob);
                });
              };

              img.src = URL.createObjectURL(rawData);
            });
            const item = new ClipboardItem({
              [convertedBlob.type]: convertedBlob
            });
            navigator.clipboard.write([item]);
            event.target.textContent = title;
            break;
          } catch (error) {
            if (r >= retryCount) {
              throw Error('다운로드 최대 시도 횟수를 초과했습니다.');
            }
          }
        }
      } catch (error) {
        alert(error);
        console.error(error);
      }

      hide();
    }

  });
  const saveImageItem = createMenu({
    text: '이미지 저장',

    async onClick(event) {
      event.preventDefault();
      const title = event.target.textContent;
      const url = getContextData('url');
      const ext = url.substring(url.lastIndexOf('.'), url.lastIndexOf('?'));
      let imagename = replaceData(getValue(FILENAME));
      imagename = imagename.replace('%num%', '000');
      imagename = imagename.replace('%orig%', url.match(/[0-9a-f]{64}/)[0]);
      const retryCount = getValue(RETRY_COUNT);

      try {
        for (let r = 1; r <= retryCount; r += 1) {
          try {
            const file = await getBlob(url, e => {
              const progress = Math.round(e.loaded / e.total * 100);
              event.target.textContent = `${progress}%`;
            }, () => {
              event.target.textContent = title;
            });
            window.saveAs(file, `${imagename}${ext}`);
            break;
          } catch (error) {
            if (r >= retryCount) {
              throw Error('다운로드 최대 시도 횟수를 초과했습니다.');
            }

            console.error(error);
          }
        }
      } catch (error) {
        alert(error);
        console.error(error);
      }

      hide();
    }

  });
  const copyURLItem = createMenu({
    text: '이미지 주소 복사',

    onClick(event) {
      event.preventDefault();
      const url = getContextData('url');
      navigator.clipboard.writeText(url);
      hide();
    }

  });
  const contextElement = VM.createElement("div", null, copyClipboardItem, saveImageItem, copyURLItem);
  addMenuGroup('clickOnImage', contextElement);
}

function apply$4() {
  const data = parse();
  if (data.length === 0) return;
  const itemContainer = VM.createElement("div", {
    className: "image-list"
  });

  for (const d of data) {
    const style = {
      backgroundImage: `url(${d.thumb})`
    };
    itemContainer.append(VM.createElement("div", null, VM.createElement("label", {
      className: "item",
      style: style,
      "data-url": d.url,
      "data-filename": d.filename
    }, VM.createElement("input", {
      type: "checkbox",
      name: "select"
    }))));
  }

  itemContainer.addEventListener('dblclick', event => {
    event.preventDefault();
    window.getSelection().removeAllRanges();
    const label = event.target.closest('.item');

    if (label) {
      event.preventDefault();
      const value = !label.children[0].checked;

      for (const child of itemContainer.children) {
        child.querySelector('input[type="checkbox"]').checked = value;
      }
    }
  });
  const downloadBtn = VM.createElement("button", {
    className: "btn btn-arca"
  }, "\uC77C\uAD04 \uB2E4\uC6B4\uB85C\uB4DC");
  downloadBtn.addEventListener('click', async event => {
    event.preventDefault();
    downloadBtn.disabled = true;
    const checkedElements = itemContainer.querySelectorAll('input[type="checkbox"]:checked');

    if (checkedElements.length === 0) {
      alert('선택된 파일이 없습니다.');
      downloadBtn.disabled = false;
      return;
    }

    const zip = new JSZip();
    const originalText = downloadBtn.textContent;
    const total = checkedElements.length;
    const configureName = getValue(IMAGENAME);
    const retryCount = getValue(RETRY_COUNT);
    let errorCount = 0;

    for (let i = 0; i < checkedElements.length; i += 1) {
      let imagename = replaceData(configureName);
      const {
        url,
        filename: orig
      } = checkedElements[i].parentNode.dataset;
      const ext = url.substring(url.lastIndexOf('.'), url.lastIndexOf('?'));

      try {
        for (let r = 1; r <= retryCount; r += 1) {
          try {
            const file = await getBlob(url, e => {
              const progress = Math.round(e.loaded / e.total * 100);
              downloadBtn.textContent = `다운로드 중...${progress}% (${i}/${total})`;
            });
            imagename = imagename.replace('%orig%', orig);
            imagename = imagename.replace('%num%', `${i}`.padStart(3, '0'));
            zip.file(`${imagename}${ext}`, file);
            break;
          } catch (error) {
            if (r >= retryCount) {
              throw Error('다운로드 최대 시도 횟수를 초과했습니다.');
            }
          }
        }
      } catch (error) {
        errorCount += 1;
        console.error(error);
      }
    }

    downloadBtn.textContent = originalText;

    if (errorCount >= checkedElements.length) {
      alert('다운로드한 이미지가 없습니다.\n개발자 도구(F12) 콘솔창의 오류 메세지를 같이 제보바랍니다.');
      downloadBtn.disabled = false;
      return;
    }

    let comment = getValue(ZIP_COMMENT);
    comment = replaceData(comment);
    let filename = getValue(ZIPNAME);
    filename = replaceData(filename);
    const zipblob = await zip.generateAsync({
      type: 'blob',
      comment
    });
    window.saveAs(zipblob, `${filename}.zip`);

    if (errorCount) {
      alert('일부 이미지 다운로드 중 오류가 발생했습니다.\n개발자 도구(F12) 콘솔창의 오류 메세지를 같이 제보 바랍니다.');
    }

    downloadBtn.disabled = false;
  });
  const wrapper = VM.createElement("div", {
    className: "article-image hidden"
  }, VM.createElement("style", null, css_248z$4), itemContainer, VM.createElement("div", null, "\uB354\uBE14\uD074\uB9AD\uC744 \uD558\uBA74 \uC774\uBBF8\uC9C0\uB97C \uBAA8\uB450 \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."), downloadBtn);
  const enableBtn = VM.createElement("a", {
    href: "#",
    className: "btn btn-arca"
  }, VM.createElement("span", {
    className: "ion-ios-download-outline"
  }), " \uC774\uBBF8\uC9C0 \uB2E4\uC6B4\uB85C\uB4DC \uBAA9\uB85D \uBCF4\uC774\uAE30");
  enableBtn.addEventListener('click', event => {
    event.preventDefault();

    if (wrapper.classList.contains('hidden')) {
      wrapper.classList.remove('hidden');
    } else {
      wrapper.classList.add('hidden');
    }
  });
  document.querySelector('.article-body').insertAdjacentElement('afterend', enableBtn).insertAdjacentElement('afterend', wrapper);
}

function replaceData(string) {
  string = string.replace('%title%', CurrentPage.Title);
  string = string.replace('%category%', CurrentPage.Category);
  string = string.replace('%author%', CurrentPage.Author);
  string = string.replace('%channel%', CurrentPage.ChannelName);
  string = string.replace('%url%', CurrentPage.URL);
  return string;
}

const CurrentPage = {
  Title: '',
  Category: '',
  Author: '',
  ChannelName: '',
  URL: ''
};

function parse() {
  const titleElement = document.querySelector('.article-head .title');
  CurrentPage.Title = titleElement ? titleElement.lastChild.textContent.trim() : '제목 없음';
  const categoryElement = document.querySelector('.article-head .badge');
  CurrentPage.Category = categoryElement ? categoryElement.textContent : '일반';
  const authorElement = document.querySelector('.article-head .user-info');
  CurrentPage.Author = authorElement ? parseUserInfo(authorElement) : '익명';
  CurrentPage.ChannelName = parseChannelTitle();
  const urlElement = document.querySelector('.article-body .article-link a');
  CurrentPage.URL = urlElement ? urlElement.href : window.location.href;
  const images = document.querySelectorAll('.article-body  img, .article-body video:not([controls])');
  const result = [];
  images.forEach(element => {
    const filepath = element.src.split('?')[0];
    const thumb = `${filepath}${element.tagName === 'VIDEO' ? '.gif' : ''}?type=list`;
    const url = `${filepath}${element.tagName === 'VIDEO' ? '.gif' : ''}?type=orig`;
    const filename = filepath.match(/[0-9a-f]{64}/)[0];
    result.push({
      thumb,
      url,
      filename
    });
  });
  return result;
}

var ImageSearch = {
  load: load$a
};

async function load$a() {
  try {
    if (await waitForElement(ARTICLE_LOADED)) {
      addContextMenu$1();
    }
  } catch (error) {
    console.error(error);
  }
}

function addContextMenu$1() {
  const searchGoogleItem = createMenu({
    text: 'Google 검색',

    onClick(event) {
      event.preventDefault();
      const url = getContextData('url');
      window.open(`https://www.google.com/searchbyimage?safe=off&image_url=${url}`);
      hide();
    }

  });
  const searchYandexItem = createMenu({
    text: 'Yandex 검색',
    description: '러시아 검색엔진입니다.',

    onClick(event) {
      event.preventDefault();
      const url = getContextData('url');
      window.open(`https://yandex.com/images/search?rpt=imageview&url=${url}`);
      hide();
    }

  });
  const searchSauceNaoItem = createMenu({
    text: 'SauceNao 검색',
    description: '망가, 픽시브 이미지 검색을 지원합니다.',

    async onClick(event) {
      event.preventDefault();
      const itemText = event.target.textContent;

      try {
        const url = getContextData('url');
        const blob = await getBlob(url, e => {
          const progress = Math.round(e.loaded / e.total * 100);
          event.target.textContent = `${progress}%`;
        }, () => {
          event.target.textContent = '업로드 중...';
        });

        if (blob.size > 15 * 1024 * 1024) {
          alert('SauceNao 업로드 용량 제한(15MB)을 초과했습니다.');
          return;
        }

        const formdata = new FormData();
        formdata.append('file', blob, `image.${blob.type.split('/')[1]}`);
        formdata.append('frame', 1);
        formdata.append('database', 999);
        const response = await getDocument({
          method: 'POST',
          url: 'https://saucenao.com/search.php',
          data: formdata,
          error: new Error('SauceNao 연결 거부 됨')
        });
        const searchedImage = response.response.querySelector('#yourimage a');
        if (!searchedImage) throw new Error('SauceNao 이미지 업로드 실패');
        const replaceURL = searchedImage.href.split('image=')[1];
        window.open(`https://saucenao.com/search.php?db=999&url=https://saucenao.com/userdata/tmp/${replaceURL}`);
      } catch (error) {
        console.error(error);
        alert(`개발자 도구(F12)의 콘솔창의 오류 메세지를 같이 제보 바랍니다.\n사유: ${error.message}`);
      }

      hide();
      event.target.textContent = itemText;
    }

  });
  const searchTwigatenItem = createMenu({
    text: 'TwitGaTen 검색',
    description: '트위터 이미지 검색을 지원합니다.',

    async onClick(event) {
      event.preventDefault();
      const itemText = event.target.textContent;

      try {
        const url = getContextData('url');
        const blob = await getBlob(url, e => {
          const progress = Math.round(e.loaded / e.total * 100);
          event.target.textContent = `${progress}%`;
        }, () => {
          event.target.textContent = '업로드 중...';
        });
        const formdata = new FormData();
        formdata.append('file', blob, `image.${blob.type.split('/')[1]}`);
        const result = await new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://twigaten.204504byse.info/search/media',
            data: formdata,
            onload: resolve,
            onerror: () => {
              reject(new Error('TwitGaTen 연결 거부 됨'));
            }
          });
        });
        window.open(result.finalUrl);
      } catch (error) {
        console.error(error);
        alert(`개발자 도구(F12)의 콘솔창의 오류 메세지를 같이 제보 바랍니다.\n사유: ${error.message}`);
      }

      hide();
      event.target.textContent = itemText;
    }

  });
  const searchAscii2dItem = createMenu({
    text: 'Ascii2D 검색',
    description: '트위터, 픽시브 이미지 검색을 지원합니다.',

    async onClick(event) {
      event.preventDefault();
      const itemText = event.target.textContent;

      try {
        const url = getContextData('url');
        const blob = await getBlob(url, e => {
          const progress = Math.round(e.loaded / e.total * 100);
          event.target.textContent = `${progress}%`;
        }, () => {
          event.target.textContent = '업로드 중...';
        });
        const docParser = new DOMParser();
        const tokenDocument = await new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://ascii2d.net',
            onload: response => {
              resolve(docParser.parseFromString(response.responseText, 'text/html'));
            },
            onerror: () => {
              reject(new Error('Ascii2D 토큰 획득 시도 중 연결 거부 됨'));
            }
          });
        });
        const tokenElement = tokenDocument.querySelector('input[name="authenticity_token"]');
        if (!tokenElement) throw new Error('Ascii2d 검색 토큰 데이터 획득 실패');
        const token = tokenElement.value;
        const formdata = new FormData();
        formdata.append('file', blob, `image.${blob.type.split('/')[1]}`);
        formdata.append('utf8', '✓');
        formdata.append('authenticity_token', token);
        const result = await new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://ascii2d.net/search/file',
            data: formdata,
            onload: resolve,
            onerror: () => {
              reject(new Error('Ascii2D 이미지 검색 시도 중 연결 거부 됨'));
            }
          });
        });
        window.open(result.finalUrl);
      } catch (error) {
        console.error(error);
        alert(`개발자 도구(F12)의 콘솔창의 오류 메세지를 같이 제보 바랍니다.\n사유: ${error.message}`);
      }

      hide();
      event.target.textContent = itemText;
    }

  });
  const contextElement = VM.createElement("div", null, searchGoogleItem, searchYandexItem, searchSauceNaoItem, searchTwigatenItem, searchAscii2dItem);
  addMenuGroup('clickOnImage', contextElement);
}

var css_248z$5 = ".fix-header .root-container {\r\n  padding-top: 42px;\r\n}\r\n\r\n.fix-header .navbar-wrapper {\r\n  top: 0px;\r\n  position: fixed !important;\r\n  width: 100%;\r\n  z-index: 20;\r\n}\r\n\r\n.content-wrapper.hide-recent-visit .visited-channel-wrap {\r\n  display: none;\r\n}\r\n\r\n.content-wrapper.hide-avatar .avatar {\r\n  display: none !important;\r\n}\r\n\r\n.content-wrapper.hide-avatar .input-wrapper > .input {\r\n  width: calc(100% - 4.5rem - 0.5rem) !important;\r\n}\r\n\r\n.content-wrapper.hide-modified b.modified {\r\n  display: none !important;\r\n}\r\n\r\n.content-wrapper.hide-sidemenu .right-sidebar {\r\n  display: none;\r\n}\r\n\r\n@media screen and (min-width: 991px) {\r\n  .content-wrapper.hide-sidemenu .board-article {\r\n    padding: 1rem;\r\n    margin: 0;\r\n  }\r\n}\r\n\r\n.content-wrapper.force-open-comment #comment .message {\r\n  max-height: none !important;\r\n}\r\n\r\n.content-wrapper.force-open-comment #comment .btn-more {\r\n  display: none !important;\r\n}\r\n";

var LayoutCustomizer = {
  load: load$b
}; // ---------------------------------- 사이트 레이아웃 ----------------------------------

const HIDE_RECENT_VISIT = {
  key: 'hideRecentVisit',
  defaultValue: false
};
const HIDE_SIDEMENU = {
  key: 'hideSideMenu',
  defaultValue: false
};
const HIDE_AVATAR = {
  key: 'hideAvatar',
  defaultValue: false
};
const USERINFO_WIDTH = {
  key: 'userinfoWidth',
  defaultValue: 10
};
const NOTIFY_COLOR = {
  key: 'notificationIconColor',
  defaultValue: ''
}; // ----------------------------------- 본문 레이아웃 -----------------------------------

const RESIZE_IMAGE = {
  key: 'resizeImage',
  defaultValue: '100'
};
const RESIZE_VIDEO = {
  key: 'resizeVideo',
  defaultValue: '100'
}; // ----------------------------------- 댓글 레이아웃 -----------------------------------

const HIDE_COMMENT = {
  key: 'hideComment',
  defaultValue: false
};
const HIDE_MODIFIED = {
  key: 'hideModified',
  defaultValue: false
};
const WIDE_AREA = {
  key: 'wideCommentArea',
  defaultValue: true
};
const FORCE_OPEN_COMMENT = {
  key: 'forceOpenComment',
  defaultValue: false
};

async function load$b() {
  try {
    setupSetting$7();
    await waitForElement('head');
    applyStyle$1();
    await waitForElement(HEADER_LOADED);
    onLoadSite();

    if (await waitForElement(ARTICLE_LOADED)) {
      addArticleMenu$2();
    }

    if (await waitForElement(COMMENT_LOADED)) {
      onLoadArticle();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$7() {
  // ---------------------------------- 사이트 레이아웃 ----------------------------------
  const hideRecentVisit = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uBCF4\uC784"), VM.createElement("option", {
    value: "true"
  }, "\uC228\uAE40"));
  const hideSideMenu = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uBCF4\uC784"), VM.createElement("option", {
    value: "true"
  }, "\uC228\uAE40"));
  const hideAvatar = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uBCF4\uC784"), VM.createElement("option", {
    value: "true"
  }, "\uC228\uAE40"));
  const userinfoWidth = VM.createElement("input", {
    type: "number",
    placeholder: "0",
    min: "0",
    max: "200"
  });
  const notifyColor = VM.createElement("input", {
    type: "text",
    placeholder: "FFC107",
    maxLength: "6"
  });
  const notificationIcon = VM.createElement("span", {
    className: "ion-android-notifications",
    style: {
      padding: '0.3rem',
      fontSize: '1.25rem',
      textAlign: 'center',
      border: '1px solid #3d414d',
      backgroundColor: '#3d414d',
      color: '#fff'
    }
  }); // 이벤트 핸들러

  notifyColor.addEventListener('keypress', event => {
    const regex = /[0-9a-fA-F]/;
    if (!regex.test(event.key)) event.preventDefault();
  });
  notifyColor.addEventListener('dblclick', event => {
    const color = getRandomColor();
    event.target.value = color;
    notificationIcon.style.color = `#${color}`;
  });
  notifyColor.addEventListener('input', event => {
    let color = '';

    if (event.target.value.length === 6) {
      color = `#${event.target.value}`;
    } else {
      color = '#fff';
    }

    notificationIcon.style.color = color;
  });
  addSetting({
    header: '사이트 레이아웃',
    group: [{
      title: '최근 방문 채널 숨김',
      content: hideRecentVisit
    }, {
      title: '우측 사이드 메뉴 숨김',
      content: hideSideMenu
    }, {
      title: '프로필 아바타 숨김',
      content: hideAvatar
    }, {
      title: '게시판 유저 칸 추가 너비(%)',
      content: userinfoWidth
    }, {
      title: '알림 아이콘 점등 색상 변경',
      description: VM.createElement(VM.Fragment, null, "\uC0C9\uC0C1\uC744 \uC785\uB825\uD558\uBA74 \uC54C\uB9BC \uC544\uC774\uCF58\uC5D0\uC11C \uBBF8\uB9AC \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.", VM.createElement("br", null), "\uB354\uBE14 \uD074\uB9AD\uC73C\uB85C \uBB34\uC791\uC704 \uC0C9\uC0C1\uC744 \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
      content: VM.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center'
        }
      }, notifyColor, notificationIcon)
    }],
    configHandler: {
      save() {
        setValue(HIDE_RECENT_VISIT, hideRecentVisit.value === 'true');
        setValue(HIDE_SIDEMENU, hideSideMenu.value === 'true');
        setValue(HIDE_AVATAR, hideAvatar.value === 'true');
        setValue(USERINFO_WIDTH, Number(userinfoWidth.value));
        setValue(NOTIFY_COLOR, notifyColor.value);
      },

      load() {
        hideRecentVisit.value = getValue(HIDE_RECENT_VISIT);
        hideSideMenu.value = getValue(HIDE_SIDEMENU);
        hideAvatar.value = getValue(HIDE_AVATAR);
        userinfoWidth.value = getValue(USERINFO_WIDTH);
        notifyColor.value = getValue(NOTIFY_COLOR);
        notificationIcon.style.color = '#fff';
      }

    }
  }); // ----------------------------------- 본문 레이아웃 -----------------------------------

  const resizeImage = VM.createElement("input", {
    type: "text"
  });
  const resizeVideo = VM.createElement("input", {
    type: "text"
  });
  addSetting({
    header: '게시물 레이아웃',
    group: [{
      title: '이미지 사이즈',
      content: resizeImage
    }, {
      title: '동영상 사이즈',
      content: resizeVideo
    }],
    configHandler: {
      save() {
        setValue(RESIZE_IMAGE, resizeImage.value);
        setValue(RESIZE_VIDEO, resizeVideo.value);
      },

      load() {
        resizeImage.value = getValue(RESIZE_IMAGE);
        resizeVideo.value = getValue(RESIZE_VIDEO);
      }

    }
  }); // ----------------------------------- 댓글 레이아웃 -----------------------------------

  const hideComment = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  const hideModified = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uBCF4\uC784"), VM.createElement("option", {
    value: "true"
  }, "\uC228\uAE40"));
  const wideCommentArea = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  const forceOpenComment = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  addSetting({
    header: '댓글 레이아웃',
    group: [{
      title: '댓글창 접어두기',
      content: hideComment
    }, {
      title: '*수정됨 숨김',
      content: hideModified
    }, {
      title: '클릭하면 답글창이 바로 열리게 하기',
      content: wideCommentArea
    }, {
      title: '접힌 댓글 바로 펼쳐보기',
      content: forceOpenComment
    }],
    configHandler: {
      save() {
        setValue(HIDE_COMMENT, hideComment.value === 'true');
        setValue(HIDE_MODIFIED, hideModified.value === 'true');
        setValue(WIDE_AREA, wideCommentArea.value === 'true');
        setValue(FORCE_OPEN_COMMENT, forceOpenComment.value === 'true');
      },

      load() {
        hideComment.value = getValue(HIDE_COMMENT);
        hideModified.value = getValue(HIDE_MODIFIED);
        forceOpenComment.value = getValue(FORCE_OPEN_COMMENT);
        wideCommentArea.value = getValue(WIDE_AREA);
      }

    }
  });
}

function addArticleMenu$2() {
  addButton({
    text: '썸네일 확대',
    icon: 'ion-search',
    description: '가려진 썸네일을 확대합니다.',

    onClick(event) {
      const media = document.querySelector('.article-content img, .article-content video');
      media.style.width = '';
      media.style.height = '';
    }

  });
}

function onLoadSite() {
  const contentWrapper = document.querySelector('.content-wrapper'); // ---------------------------------- 사이트 레이아웃 ----------------------------------

  const hideRecentVisit = getValue(HIDE_RECENT_VISIT);
  if (hideRecentVisit) contentWrapper.classList.add('hide-recent-visit');
  const hideSideMenu = getValue(HIDE_SIDEMENU);
  if (hideSideMenu) contentWrapper.classList.add('hide-sidemenu');
  const hideAvatar = getValue(HIDE_AVATAR);
  if (hideAvatar) contentWrapper.classList.add('hide-avatar');
  const userinfoWidth = getValue(USERINFO_WIDTH);
  document.head.append(VM.createElement("style", null, `.vcol.col-author {
      width: ${7 + 7 * userinfoWidth * 0.01}rem !important;
    }`));
  const color = getValue(NOTIFY_COLOR);
  const notificationIcon = document.querySelector('.navbar-wrapper .noti-menu-link span');

  if (notificationIcon) {
    const notiObserver = new MutationObserver(() => {
      if (notificationIcon.style.color) {
        notificationIcon.style.color = `#${color}`;
      }
    });
    notiObserver.observe(notificationIcon, {
      attributes: true
    });
  }
}

function onLoadArticle() {
  const contentWrapper = document.querySelector('.content-wrapper'); // ----------------------------------- 본문 레이아웃 -----------------------------------

  const resizeImage = getValue(RESIZE_IMAGE);
  const imageCSS = `.article-body  img, .article-body video:not([controls]) {
        max-width: ${resizeImage}% !important;
    }`;
  document.head.append(VM.createElement("style", null, imageCSS));
  const resizeVideo = getValue(RESIZE_VIDEO);
  const videoCSS = `.article-body video[controls] {
        max-width: ${resizeVideo}% !important;
    }`;
  document.head.append(VM.createElement("style", null, videoCSS)); // ----------------------------------- 댓글 레이아웃 -----------------------------------

  const hideModified = getValue(HIDE_MODIFIED);
  if (hideModified) contentWrapper.classList.add('hide-modified');
  const forceOpenComment = getValue(FORCE_OPEN_COMMENT);

  if (forceOpenComment) {
    contentWrapper.classList.add('force-open-comment');
  }

  const hideComment = getValue(HIDE_COMMENT);

  if (hideComment) {
    const comment = document.querySelector('#comment');
    const showCommentBtn = VM.createElement("button", {
      className: "btn btn-arca",
      style: {
        width: '100%',
        margin: '0.5rem 0'
      }
    }, "\uB313\uAE00 \uBCF4\uC774\uAE30");
    showCommentBtn.addEventListener('click', e => {
      e.target.classList.add('hidden');
      comment.classList.remove('hidden');
    });
    comment.insertAdjacentElement('beforebegin', showCommentBtn);
    comment.classList.add('hidden');
  }

  const wideCommentArea = getValue(WIDE_AREA);

  if (wideCommentArea) {
    const commentArea = document.querySelector('#comment');
    commentArea.addEventListener('click', event => {
      if (event.target.closest('form')) return;
      const element = event.target.closest('a, .emoticon, .btn-more, .message');
      if (element == null) return;
      if (!element.classList.contains('message')) return;
      event.preventDefault();
      element.parentNode.querySelector('.reply-link').click();
    });
  }
}

async function applyStyle$1() {
  document.head.append(VM.createElement("style", null, css_248z$5));
}

var css_248z$6 = "#refresherSetting #MyImage {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  grid-template-areas:\r\n    'channel move'\r\n    'images images'\r\n    'btn btn';\r\n}\r\n\r\n@media screen and (max-width: 768px) {\r\n  #refresherSetting #MyImage {\r\n    grid-template-columns: 1fr;\r\n    grid-template-areas:\r\n      'channel'\r\n      'move'\r\n      'images'\r\n      'btn';\r\n  }\r\n}\r\n\r\n#refresherSetting #MyImage > *:nth-child(2) {\r\n  grid-area: channel;\r\n}\r\n\r\n#refresherSetting #MyImage > *:nth-child(3) {\r\n  grid-area: move;\r\n}\r\n\r\n#refresherSetting #MyImage > *:nth-child(4) {\r\n  grid-area: images;\r\n}\r\n\r\n#refresherSetting #MyImage > *:nth-child(5) {\r\n  grid-area: btn;\r\n}\r\n\r\n#refresherSetting #MyImage .grid-wrapper {\r\n  display: grid;\r\n  width: 100%;\r\n  min-height: calc(100px + 1rem + 2px);\r\n  border: 1px solid var(--color-border-outer);\r\n  padding: 0.5rem;\r\n  grid-template-columns: repeat(auto-fill, minmax(100px, auto));\r\n  gap: 0.5rem;\r\n  justify-items: center;\r\n}\r\n\r\n#refresherSetting #MyImage .grid-item {\r\n  display: inline-block;\r\n  width: 100px;\r\n  height: 100px;\r\n  border: 1px solid var(--color-border-outer);\r\n  margin: 0;\r\n  background-size: cover;\r\n}\r\n";

var MyImage = {
  load: load$c
};
const MY_IMAGES = {
  key: 'myImages',
  defaultValue: {}
};

async function load$c() {
  try {
    setupSetting$8();

    if (await waitForElement(ARTICLE_LOADED)) {
      addContextMenu$2();
    }

    const isWriteView = /(write|edit)(\/|$)/.test(window.location.pathname);
    if (!isWriteView) return;

    if (await waitForElement(WRITE_LOADED, true)) {
      apply$5();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$8() {
  let config = getValue(MY_IMAGES);
  const currentChannel = parseChannelID();
  const channelSelect = VM.createElement("select", null, VM.createElement("option", {
    value: "_shared_"
  }, "\uACF5\uC6A9 \uC790\uC9E4"), Object.keys(config).map(channel => {
    if (channel === '_shared_') {
      return null;
    }

    return VM.createElement("option", {
      value: channel,
      selected: channel === currentChannel
    }, channel);
  }));

  if (!currentChannel) {
    channelSelect.querySelector('option[value=_shared_]').selected = true;
  } else if (!channelSelect.querySelector(`option[value=${currentChannel}]`)) {
    channelSelect.append(VM.createElement("option", {
      value: currentChannel,
      selected: true
    }, currentChannel));
  }

  channelSelect.addEventListener('change', () => {
    while (imgList.firstChild) imgList.lastChild.remove();

    const imgArray = config[channelSelect.value];
    if (!imgArray) return;

    for (const i of imgArray) {
      const style = {
        backgroundImage: `url(${i}?type=list)`
      };
      imgList.append(VM.createElement("div", null, VM.createElement("label", {
        className: "grid-item",
        style: style,
        "data-url": i
      }, VM.createElement("input", {
        type: "checkbox",
        name: "select"
      }))));
    }
  });
  const moveSelect = VM.createElement("select", null, VM.createElement("option", {
    value: "",
    selected: true
  }, "\uC774\uB3D9\uD560 \uCC44\uB110 \uC120\uD0DD"), VM.createElement("option", {
    value: "_trash_"
  }, "\uD734\uC9C0\uD1B5"), VM.createElement("option", {
    value: "_shared_"
  }, "\uACF5\uC6A9 \uC790\uC9E4"), Object.keys(config).map(channel => {
    if (channel === '_shared_') {
      return null;
    }

    return VM.createElement("option", {
      value: channel
    }, channel);
  }));

  if (!currentChannel) {
    moveSelect.querySelector('option[value=_shared_]').selected = true;
  } else if (!moveSelect.querySelector(`option[value=${currentChannel}]`)) {
    moveSelect.append(VM.createElement("option", {
      value: currentChannel
    }, currentChannel));
  }

  const imgList = VM.createElement("div", {
    className: "grid-wrapper"
  });
  imgList.addEventListener('dblclick', event => {
    event.preventDefault();
    window.getSelection().removeAllRanges();
    const label = event.target.closest('.grid-item');

    if (label) {
      event.preventDefault();
      const value = !label.children[0].checked;

      for (const child of imgList.children) {
        child.querySelector('input[type="checkbox"]').checked = value;
      }
    }
  });
  const moveBtn = VM.createElement("button", {
    className: "btn btn-arca"
  }, "\uC774\uB3D9");
  moveBtn.addEventListener('click', event => {
    event.target.disabled = true;
    const selectedChannel = channelSelect.value;
    const targetChannel = moveSelect.value;
    if (!targetChannel) alert('이동할 채널을 선택해주세요');
    const targets = imgList.querySelectorAll('input[type="checkbox"]:checked');

    if (targets.length) {
      for (const element of targets) {
        const url = element.closest('label').dataset.url;

        if (targetChannel !== '_trash_') {
          if (!config[targetChannel]) config[targetChannel] = [];
          config[targetChannel] = [...config[targetChannel], url];
        }

        config[selectedChannel].splice(config[selectedChannel].indexOf(url), 1);
        element.closest('div').remove();
      }
    }

    event.target.disabled = false;
  });

  const saveConfig = () => {
    Object.keys(config).forEach(c => {
      if (config[c].length === 0) delete config[c];
    });
    setValue(MY_IMAGES, config);
  };

  const loadConfig = () => {
    config = getValue(MY_IMAGES);
    if (currentChannel) channelSelect.querySelector(`option[value=${currentChannel}]`).selected = true;
    channelSelect.dispatchEvent(new Event('change'));
  };

  const content = VM.createElement("div", {
    id: "MyImage"
  }, VM.createElement("style", null, css_248z$6), channelSelect, moveSelect, imgList, moveBtn);
  addSetting({
    header: '자짤',
    group: [{
      title: '목록 관리',
      description: '더블 클릭으로 모두 선택합니다.',
      content,
      type: 'wide'
    }],
    configHandler: {
      save: saveConfig,
      load: loadConfig
    }
  });
}

function addContextMenu$2() {
  const config = getValue(MY_IMAGES);
  const addShareImageItem = createMenu({
    text: '공용 자짤로 등록',

    onClick(event) {
      event.preventDefault();
      const channel = '_shared_';
      config[channel] = [...(config[channel] || []), getContextData('url').split('?')[0]];
      setValue(MY_IMAGES, config);
      hide();
    }

  });
  const addChannelImageItem = createMenu({
    text: '채널 자짤로 등록',

    onClick(event) {
      event.preventDefault();
      const channel = parseChannelID() || '_shared_';
      config[channel] = [...(config[channel] || []), getContextData('url').split('?')[0]];
      setValue(MY_IMAGES, config);
      hide();
    }

  });
  const contextElement = VM.createElement("div", null, addShareImageItem, addChannelImageItem);
  addMenuGroup('clickOnImage', contextElement);
}

function apply$5() {
  const channel = parseChannelID();
  const editor = unsafeWindow.FroalaEditor('#content');

  if (editor.core.isEmpty()) {
    const config = getValue(MY_IMAGES);
    const channelImgList = config[channel] || []; // eslint-disable-next-line dot-notation

    const shareImageList = config['_shared_'] || [];
    const imgList = [...channelImgList, ...shareImageList];
    if (!imgList || !imgList.length) return;
    const img = imgList[Math.floor(Math.random() * imgList.length)];
    editor.html.set(`<img src="${img}">`);
    editor.html.insert('<p></p>');
    editor.selection.setAtEnd(editor.$el.get(0));
  }
}

var NewWindow = {
  load: load$d
};
const OPEN_ARTICLE = {
  key: 'openNewWindow',
  defaultValue: false
};
const BLOCK_MEDIA = {
  key: 'blockImageNewWindow',
  defaultValue: false
};

async function load$d() {
  try {
    setupSetting$9();

    if (await waitForElement(BOARD_LOADED)) {
      applyOpenNewWindow();
    }

    if (await waitForElement(ARTICLE_LOADED)) {
      applyBlockNewWindow();
    }

    addAREventListener('ArticleChange', {
      priority: 100,
      callback: applyOpenNewWindow
    });
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$9() {
  const openArticle = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  const blockMedia = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  addSetting({
    header: '창 열기',
    group: [{
      title: '게시물 클릭 시 새 창으로 열기',
      content: openArticle
    }, {
      title: '이미지, 비디오 클릭 시 새 창으로 열기 방지',
      content: blockMedia
    }],
    configHandler: {
      save() {
        setValue(OPEN_ARTICLE, openArticle.value === 'true');
        setValue(BLOCK_MEDIA, blockMedia.value === 'true');
      },

      load() {
        openArticle.value = getValue(OPEN_ARTICLE);
        blockMedia.value = getValue(BLOCK_MEDIA);
      }

    }
  });
}

function applyOpenNewWindow() {
  const value = getValue(OPEN_ARTICLE);
  if (!value) return;
  const articles = document.querySelectorAll('a.vrow:not(.notice-unfilter)');

  for (const article of articles) {
    article.setAttribute('target', '_blank');
  }
}

function applyBlockNewWindow() {
  if (!getValue(BLOCK_MEDIA)) return;
  const targetElements = document.querySelectorAll('.article-body img, .article-body video:not([controls])');

  for (const element of targetElements) {
    const a = VM.createElement("a", null);
    element.insertAdjacentElement('beforebegin', a);
    a.append(element);
  }
}

var RatedownGuard = {
  load: load$e
};
const RATEDOWN_GUARD = {
  key: 'blockRatedown',
  defaultValue: false
};

async function load$e() {
  try {
    setupSetting$a();

    if (await waitForElement(ARTICLE_LOADED)) {
      apply$6();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$a() {
  const ratedownBlock = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  addSetting({
    header: '비추천 방지',
    group: [{
      title: '비추천 버튼을 클릭하면 재확인창을 띄웁니다.',
      content: ratedownBlock
    }],
    configHandler: {
      save() {
        setValue(RATEDOWN_GUARD, ratedownBlock.value === 'true');
      },

      load() {
        ratedownBlock.value = getValue(RATEDOWN_GUARD);
      }

    }
  });
}

function apply$6() {
  if (!getValue(RATEDOWN_GUARD)) return;
  const ratedown = document.querySelector('#rateDown');
  if (ratedown == null) return;
  ratedown.addEventListener('click', e => {
    if (!window.confirm('비추천을 눌렀습니다.\n계속하시겠습니까?')) {
      e.preventDefault();
    }
  });
}

var ShortCut = {
  load: load$f
};
const USE_SHORTCUT = {
  key: 'useShortcut',
  defaultValue: false
};

async function load$f() {
  try {
    setupSetting$b();

    if (await waitForElement(ARTICLE_LOADED)) {
      apply$7('article');
    } else if (await waitForElement(BOARD_LOADED)) {
      apply$7('board');
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$b() {
  const shortCut = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  addSetting({
    header: '단축키',
    group: [{
      title: '단축키 사용',
      description: VM.createElement("a", {
        href: "https://github.com/lekakid/ArcaRefresher/wiki/Feature#%EB%8B%A8%EC%B6%95%ED%82%A4%EB%A1%9C-%EB%B9%A0%EB%A5%B8-%EC%9D%B4%EB%8F%99",
        target: "_blank",
        rel: "noreferrer"
      }, "\uB2E8\uCD95\uD0A4 \uC548\uB0B4 \uBC14\uB85C\uAC00\uAE30"),
      content: shortCut
    }],
    configHandler: {
      save() {
        setValue(USE_SHORTCUT, shortCut.value === 'true');
      },

      load() {
        shortCut.value = getValue(USE_SHORTCUT);
      }

    }
  });
}

function apply$7(view) {
  if (!getValue(USE_SHORTCUT)) return;

  if (view === 'article') {
    document.addEventListener('keydown', onArticle);
  } else if (view === 'board') {
    document.addEventListener('keydown', onBoard);
  }
}

function onArticle(event) {
  // A 목록 바로가기
  // E 추천
  // R 댓글 목록보기
  // W 댓글 입력 포커스
  if (event.target.nodeName === 'INPUT' || event.target.nodeName === 'TEXTAREA') return;

  switch (event.code) {
    case 'KeyA':
      event.preventDefault();
      window.location.pathname = window.location.pathname.replace(/\/[0-9]+/, '');
      break;

    case 'KeyE':
      event.preventDefault();
      document.querySelector('#rateUp').click();
      break;

    case 'KeyR':
      {
        event.preventDefault();
        const commentForm = document.querySelector('.article-comment');
        window.scrollTo({
          top: commentForm.offsetTop - 50,
          behavior: 'smooth'
        });
        break;
      }

    case 'KeyW':
      {
        event.preventDefault();
        const inputForm = document.querySelector('.article-comment .subtitle');
        const input = document.querySelector('.article-comment .input textarea');
        const top = window.pageYOffset + inputForm.getBoundingClientRect().top;
        window.scrollTo({
          top: top - 50,
          behavior: 'smooth'
        });
        input.focus({
          preventScroll: true
        });
        break;
      }
  }
}

function onBoard(event) {
  // W 게시물 쓰기
  // E 헤드라인
  // D 이전 페이지
  // F 다음 페이지
  if (event.target.nodeName === 'INPUT' || event.target.nodeName === 'TEXTAREA') return;

  switch (event.code) {
    case 'KeyW':
      {
        event.preventDefault();
        const path = window.location.pathname.split('/');
        let writePath = '';

        if (path[path.length - 1] === '') {
          path[path.length - 1] = 'write';
        } else {
          path.push('write');
        }

        writePath = path.join('/');
        window.location.pathname = writePath;
        break;
      }

    case 'KeyE':
      {
        event.preventDefault();

        if (window.location.search.indexOf('mode=best') > -1) {
          window.location.search = '';
        } else {
          window.location.search = '?mode=best';
        }

        break;
      }

    case 'KeyD':
      {
        event.preventDefault();
        const active = document.querySelector('.pagination .active');

        if (active.previousElementSibling) {
          active.previousElementSibling.firstElementChild.click();
        }

        break;
      }

    case 'KeyF':
      {
        event.preventDefault();
        const active = document.querySelector('.pagination .active');

        if (active.nextElementSibling) {
          active.nextElementSibling.firstElementChild.click();
        }

        break;
      }
  }
}

var css_248z$7 = "#tempArticleWrapper {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n\r\n  background-color: rgba(0, 0, 0, 0.5);\r\n  z-index: 1000;\r\n\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n}\r\n\r\n#tempArticleWrapper table {\r\n  max-width: 400px;\r\n  width: 100%;\r\n  max-height: 400px;\r\n  height: 100%;\r\n\r\n  color: var(--color-text-color);\r\n  border: 1px solid var(--color-border-outer);\r\n  background-color: var(--color-bg-main);\r\n}\r\n\r\n#tempArticleWrapper tbody {\r\n  display: block;\r\n  height: 300px;\r\n  overflow: auto;\r\n}\r\n\r\n#tempArticleWrapper tr {\r\n  display: table;\r\n  width: 100%;\r\n  table-layout: fixed;\r\n}\r\n\r\n#tempArticleWrapper th:nth-child(1),\r\n#tempArticleWrapper td:nth-child(1) {\r\n  width: 10%;\r\n}\r\n#tempArticleWrapper th:nth-child(2),\r\n#tempArticleWrapper td:nth-child(2) {\r\n  width: 65%;\r\n}\r\n#tempArticleWrapper th:nth-child(3),\r\n#tempArticleWrapper td:nth-child(3) {\r\n  width: 25%;\r\n}\r\n\r\n#tempArticleWrapper td:nth-child(3) {\r\n  font-size: 0.83em;\r\n}\r\n";

var TemporaryArticle = {
  load: load$g
};
const TEMPORARY_ARTICLES = {
  key: 'tempArticles',
  defaultValue: {}
};
const INCLUDE_TITLE = {
  key: 'includeTitle',
  defaultValue: 'include'
};

async function load$g() {
  try {
    setupSetting$c();
    const isWriteView = /(write|edit)(\/|$)/.test(window.location.pathname);
    if (!isWriteView) return;

    if (await waitForElement(WRITE_LOADED, true)) {
      apply$8();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$c() {
  const includeTitle = VM.createElement("select", null, VM.createElement("option", {
    value: "include"
  }, "\uC81C\uBAA9\uC744 \uD3EC\uD568"), VM.createElement("option", {
    value: "confirm"
  }, "\uB9E4\uBC88 \uBB3B\uAE30"), VM.createElement("option", {
    value: "exclude"
  }, "\uC81C\uBAA9\uC744 \uC81C\uC678"));
  addSetting({
    header: '게시물 임시 저장',
    group: [{
      title: '불러올 때 게시물 제목 처리',
      content: includeTitle
    }],
    configHandler: {
      save() {
        setValue(INCLUDE_TITLE, includeTitle.value);
      },

      load() {
        includeTitle.value = getValue(INCLUDE_TITLE);
      }

    }
  });
}

function apply$8() {
  const editor = unsafeWindow.FroalaEditor('#content');
  const tempArticles = getValue(TEMPORARY_ARTICLES);
  const includeTitle = getValue(INCLUDE_TITLE);
  const selectAll = VM.createElement("input", {
    type: "checkbox",
    name: "selectAll"
  });
  const deleteBtn = VM.createElement("button", {
    className: "btn btn-danger",
    id: "tempDeleteBtn"
  }, "\uC0AD\uC81C");
  const closeBtn = VM.createElement("button", {
    className: "btn btn-arca",
    id: "tempCloseBtn"
  }, "\uB2EB\uAE30");
  const list = VM.createElement("tbody", null);
  const wrapper = VM.createElement("div", {
    className: "hidden",
    id: "tempArticleWrapper"
  }, VM.createElement("style", null, css_248z$7), VM.createElement("table", {
    className: "table align-middle"
  }, VM.createElement("thead", null, VM.createElement("tr", null, VM.createElement("th", null, selectAll), VM.createElement("th", null, "\uC81C\uBAA9"), VM.createElement("th", null, "\uC2DC\uAC04"))), list, VM.createElement("tfoot", null, VM.createElement("td", {
    colSpan: "3",
    style: {
      textAlign: 'center'
    }
  }, deleteBtn, closeBtn))));

  function loadArticle() {
    selectAll.checked = false;

    while (list.firstChild) list.lastChild.remove();

    for (const key of Object.keys(tempArticles)) {
      list.append(VM.createElement("tr", {
        "data-id": key
      }, VM.createElement("td", null, VM.createElement("input", {
        type: "checkbox",
        name: "select"
      })), VM.createElement("td", null, VM.createElement("a", {
        href: "#"
      }, tempArticles[key].title)), VM.createElement("td", null, getDateStr(tempArticles[key].time).split(' ')[0])));
    }
  }

  wrapper.addEventListener('click', event => {
    if (event.target.name === 'selectAll') {
      list.querySelectorAll('input[name="select"]').forEach(e => {
        e.checked = event.target.checked;
      });
    }

    if (event.target.tagName === 'A') {
      const row = event.target.closest('tr');
      const id = row.dataset.id;
      const title = document.querySelector('#inputTitle');

      if (includeTitle === 'include' || // eslint-disable-next-line no-restricted-globals
      includeTitle === 'confirm' && confirm('게시물 제목을 저장한 제목으로 변경하시겠습니까?')) {
        title.value = tempArticles[id].title;
      }

      editor.html.set(tempArticles[id].content);
      wrapper.classList.add('hidden');
    }

    if (!event.target.closest('table')) {
      wrapper.classList.add('hidden');
    }
  });
  deleteBtn.addEventListener('click', event => {
    event.preventDefault();
    const checkedItems = list.querySelectorAll('input[name="select"]:checked');
    checkedItems.forEach(i => {
      const row = i.closest('tr');
      const id = row.dataset.id;
      delete tempArticles[id];
    });
    setValue(TEMPORARY_ARTICLES, tempArticles);
    loadArticle();
  });
  closeBtn.addEventListener('click', event => {
    event.preventDefault();
    wrapper.classList.add('hidden');
  });
  const btns = document.querySelector('.btns');
  const saveBtn = VM.createElement("button", {
    className: "btn btn-primary",
    id: "tempSaveBtn"
  }, "\uC784\uC2DC \uC800\uC7A5");
  const loadBtn = VM.createElement("button", {
    className: "btn btn-arca",
    id: "tempLoadBtn"
  }, "\uBD88\uB7EC\uC624\uAE30");
  const submitBtn = btns.querySelector('#submitBtn');
  btns.insertAdjacentElement('afterend', wrapper);
  btns.prepend(VM.createElement(VM.Fragment, null, VM.createElement("style", null, `
          .btns {
            display: grid;
            grid-template-columns: 7rem 7rem 1fr 7rem;
            grid-template-areas:
              "  save     load     .   submit"
              "recapcha recapcha recapcha recapcha";
            grid-row-gap: 1rem;
          }
          .btns > #tempSaveBtn { grid-area: save; }
          .btns > #tempLoadBtn { grid-area: load; }
          .btns > div { grid-area: recapcha; }
          .btns > #submitBtn { grid-area: submit; }
        `), saveBtn, loadBtn, submitBtn));
  saveBtn.addEventListener('click', event => {
    event.preventDefault();
    const timestamp = new Date().getTime();
    const title = document.querySelector('#inputTitle').value;
    tempArticles[timestamp] = {
      title: title || '제목 없음',
      time: timestamp,
      content: editor.html.get(true)
    };

    if (!wrapper.classList.contains('hidden')) {
      loadArticle();
    }

    setValue(TEMPORARY_ARTICLES, tempArticles);
    alert('작성 중인 게시물이 저장되었습니다.');
  });
  loadBtn.addEventListener('click', event => {
    event.preventDefault();

    if (wrapper.classList.contains('hidden')) {
      loadArticle();
      wrapper.classList.remove('hidden');
    }
  });
}

var styles$2 = {"wrapper":"ThemeCustomizer-module_wrapper__3Ur2J","preset-wrapper":"ThemeCustomizer-module_preset-wrapper__2zaLU","item":"ThemeCustomizer-module_item__BbO_q","bold":"ThemeCustomizer-module_bold__3Ca8E"};
var stylesheet$3=".ThemeCustomizer-module_wrapper__3Ur2J {\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.ThemeCustomizer-module_preset-wrapper__2zaLU {\r\n  min-height: 3rem;\r\n\r\n  display: grid;\r\n  grid-template-columns: 1fr;\r\n\r\n  margin-bottom: 1rem;\r\n}\r\n\r\n.ThemeCustomizer-module_item__BbO_q {\r\n  min-height: 3rem;\r\n\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  grid-template-areas: 'layout color';\r\n  align-items: stretch;\r\n\r\n  border-top: 1px solid var(--color-border-outer);\r\n}\r\n\r\n.ThemeCustomizer-module_item__BbO_q label {\r\n  margin: 0;\r\n}\r\n\r\n.ThemeCustomizer-module_bold__3Ca8E {\r\n  font-weight: 700;\r\n}\r\n\r\n.ThemeCustomizer-module_item__BbO_q > div {\r\n  height: 3rem;\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n\r\n.ThemeCustomizer-module_item__BbO_q > div:nth-child(1) {\r\n  grid-area: layout;\r\n}\r\n\r\n.ThemeCustomizer-module_item__BbO_q > div:nth-child(2) {\r\n  grid-area: color;\r\n}\r\n";

const defaultTheme = {
  'bg-navbar': '3d414d',
  'bg-body': 'eee',
  'bg-main': 'fff',
  'bg-focus': 'eee',
  'bg-dropdown': 'fff',
  'bg-dialog': 'fff',
  'bg-input': 'fff',
  'bg-badge': '3d414d',
  'bg-footer': 'fff',
  'text-color': '373a3c',
  'text-muted': '9ba0a4',
  'link-color': '5b91bf',
  'visited-article': 'bbb',
  'border-outer': 'bbb',
  'border-inner': 'ddd'
};
const description = {
  'bg-navbar': '네비게이션 색상',
  'bg-body': '배경 색상',
  'bg-main': '메인 색상',
  'bg-focus': '포커스 색상',
  'bg-dropdown': '드롭다운 색상',
  'bg-dialog': '다이얼로그 색상',
  'bg-input': '입력칸 색상',
  'bg-badge': '글머리 색상',
  'bg-footer': '푸터 색상',
  'text-color': '텍스트 색상',
  'text-muted': '뮤트 색상',
  'link-color': '링크 색상',
  'visited-article': '방문한 게시물 색상',
  'border-outer': '경계선 외곽선 색상',
  'border-inner': '경계선 내부선 색상'
};
const NONE_PRESET = '%NONE%';
const NEW_PRESET = '%NEW_PRESET%';
const CURRENT_THEME = {
  key: 'currentTheme',
  defaultValue: NONE_PRESET
};
const THEME_PRESET = {
  key: 'themePreset',
  defaultValue: {}
};
async function load$h() {
  try {
    await waitForElement(HEADER_LOADED);
    setupSetting$d();
    applyTheme();
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$d() {
  const themePreset = getValue(THEME_PRESET);
  const presetSelect = VM.createElement("select", null, VM.createElement("option", {
    value: NONE_PRESET
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: NEW_PRESET
  }, "\uC0C8 \uD504\uB9AC\uC14B \uCD94\uAC00"), Object.keys(themePreset).map(key => VM.createElement("option", {
    value: key
  }, key)));
  let prevValue = NONE_PRESET;
  presetSelect.addEventListener('change', e => {
    if (prevValue !== NONE_PRESET) {
      Object.keys(themePreset[prevValue]).forEach(key => {
        themePreset[prevValue][key] = inputMap[key].value;
      });
    }

    if (presetSelect.value === NEW_PRESET) {
      const newPresetKey = prompt('새로운 프리셋 이름');

      if (newPresetKey) {
        themePreset[newPresetKey] = _extends({}, defaultTheme);
        presetSelect.append(VM.createElement("option", {
          value: newPresetKey
        }, newPresetKey));
        presetSelect.querySelector(`option[value="${newPresetKey}"]`).selected = true;
      } else {
        presetSelect.querySelector(`option[value="${prevValue}"]`).selected = true;
      }
    }

    if (presetSelect.value === NONE_PRESET) {
      Object.keys(inputMap).forEach(key => {
        inputMap[key].disabled = true;
        inputMap[key].value = '';
      });
      presetDeleteBtn.disabled = true;
    } else {
      Object.keys(inputMap).forEach(key => {
        inputMap[key].disabled = false;
        inputMap[key].value = themePreset[presetSelect.value][key];
      });
      presetDeleteBtn.disabled = false;
    }

    prevValue = presetSelect.value;
  });
  const presetDeleteBtn = VM.createElement("button", {
    className: "btn btn-danger"
  }, "\uC0AD\uC81C");
  presetDeleteBtn.addEventListener('click', e => {
    const current = presetSelect.value;

    if (current !== NONE_PRESET) {
      delete themePreset[current];
      presetSelect.querySelector(`option[value="${current}"]`).remove();
      presetSelect.querySelector(`option[value="${NONE_PRESET}"]`).selected = true;
      prevValue = NONE_PRESET;
      presetSelect.dispatchEvent(new Event('change'));
    }
  });
  const presetWrapper = VM.createElement("div", {
    className: styles$2['preset-wrapper']
  }, presetSelect, presetDeleteBtn);
  const inputMap = Object.keys(defaultTheme).reduce((acc, cur) => {
    return _extends({}, acc, {
      [cur]: VM.createElement("input", {
        type: "text",
        placeholder: defaultTheme[cur],
        maxLength: "6"
      })
    });
  }, {});
  const content = VM.createElement("div", {
    className: styles$2.wrapper
  }, VM.createElement("style", null, stylesheet$3), presetWrapper, Object.keys(inputMap).map(key => VM.createElement("div", {
    className: styles$2.item
  }, VM.createElement("div", null, description[key]), inputMap[key])));
  addSetting({
    header: '사이트 테마 커스터마이징',
    group: [{
      title: '색상 설정',
      description: '프리셋 이름을 채널 slug로 지정하면 채널 전용 테마로 사용할 수 있습니다.',
      content,
      type: 'wide'
    }],
    configHandler: {
      save() {
        if (presetSelect.value !== NONE_PRESET) {
          Object.keys(themePreset[prevValue]).forEach(key => {
            themePreset[prevValue][key] = inputMap[key].value;
          });
        }

        setValue(CURRENT_THEME, presetSelect.value);
        setValue(THEME_PRESET, themePreset);
      },

      load() {
        const currentTheme = getValue(CURRENT_THEME);

        if (currentTheme) {
          presetSelect.querySelector(`option[value="${currentTheme}"]`).selected = true;
        }

        presetSelect.dispatchEvent(new Event('change'));
      }

    }
  });
}

function applyTheme() {
  const themePreset = getValue(THEME_PRESET);
  const channelID = parseChannelID();
  const currentTheme = getValue(CURRENT_THEME);
  if (!themePreset[channelID] && currentTheme === NONE_PRESET) return;
  const theme = themePreset[channelID] || themePreset[currentTheme];
  document.head.append(VM.createElement("style", null, `
        html.theme-custom {
          ${Object.keys(theme).map(key => {
    return `--color-${key}: #${theme[key]} !important;`;
  }).join('\n')}
        }
      `));
  document.documentElement.classList.add('theme-custom');
}

var UserColor = {
  load: load$i
};
const USER_COLOR = {
  key: 'userColor',
  defaultValue: {}
};

async function load$i() {
  try {
    setupSetting$e();

    if (await waitForElement(BOARD_LOADED)) {
      apply$9();
    }

    addAREventListener('ArticleChange', {
      priority: 0,
      callback: apply$9
    });
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$e() {
  const userTextarea = VM.createElement("textarea", {
    rows: "6",
    placeholder: "\uB2C9\uB124\uC784::#000000"
  });
  addSetting({
    header: '특정 유저 컬러라이징',
    group: [{
      title: '유저 목록',
      description: VM.createElement(VM.Fragment, null, "\uC544\uB798\uC758 \uC591\uC2DD\uC744 \uC9C0\uCF1C\uC8FC\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4.", VM.createElement("br", null), VM.createElement("ul", null, VM.createElement("li", null, "\uACE0\uC815\uB2C9::#000000"), VM.createElement("li", null, "#00000000::#000000"), VM.createElement("li", null, "(000.000)::#000000"))),
      content: userTextarea,
      type: 'wide'
    }],
    configHandler: {
      save() {
        const userList = userTextarea.value.split('\n').filter(i => i !== '');
        const data = {};

        for (const m of userList) {
          const [key, value] = m.split('::');
          data[key] = value;
        }

        setValue(USER_COLOR, data);
      },

      load() {
        const data = getValue(USER_COLOR);
        const userList = [];

        for (const key of Object.keys(data)) {
          userList.push(`${key}::${data[key]}`);
        }

        userTextarea.value = userList.join('\n');
      }

    }
  });
}

function apply$9() {
  const users = document.querySelectorAll('span.user-info');
  const colors = getValue(USER_COLOR);
  users.forEach(user => {
    const id = parseUserID(user);

    if (colors[id]) {
      user.style.color = colors[id];
      user.style.fontWeight = 'bold';
    }
  });
}

var UserMemo = {
  load: load$j
};
const USER_MEMO = {
  key: 'userMemo',
  defaultValue: {}
};

async function load$j() {
  try {
    setupSetting$f();

    if (await waitForElement(ARTICLE_LOADED)) {
      addEvent(ARTICLE_VIEW);
    }

    if (await waitForElement(BOARD_LOADED)) {
      appendMemo();
      addEvent(BOARD_VIEW);
    }

    if (await waitForElement(AUDIT_LOADED)) {
      appendMemo();
      addEvent(AUDIT_VIEW);
    }

    addAREventListener('ArticleChange', {
      priority: 100,
      callback: appendMemo
    });
    addAREventListener('CommentChange', {
      priority: 100,
      callback: appendMemo
    });
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$f() {
  const memoTextarea = VM.createElement("textarea", {
    rows: "6",
    placeholder: "\uB2C9\uB124\uC784::\uBA54\uBAA8"
  });
  addSetting({
    header: '메모',
    group: [{
      title: '메모 목록',
      description: VM.createElement(VM.Fragment, null, "\uC544\uB798\uC758 \uC591\uC2DD\uC744 \uC9C0\uCF1C\uC8FC\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4.", VM.createElement("br", null), VM.createElement("ul", null, VM.createElement("li", null, "\uACE0\uC815\uB2C9::\uBA54\uBAA8"), VM.createElement("li", null, "#00000000::\uBA54\uBAA8"), VM.createElement("li", null, "(000.000)::\uBA54\uBAA8"))),
      content: memoTextarea,
      type: 'wide'
    }],
    configHandler: {
      save() {
        const memoList = memoTextarea.value.split('\n').filter(i => i !== '');
        const data = {};

        for (const m of memoList) {
          const [key, value] = m.split('::');
          data[key] = value;
        }

        setValue(USER_MEMO, data);
      },

      load() {
        const data = getValue(USER_MEMO);
        const memoList = [];

        for (const key of Object.keys(data)) {
          memoList.push(`${key}::${data[key]}`);
        }

        memoTextarea.value = memoList.join('\n');
      }

    }
  });
}

function appendMemo() {
  const users = document.querySelectorAll(USER_INFO);
  const memos = getValue(USER_MEMO);
  users.forEach(user => {
    const id = parseUserID(user);
    let slot = user.querySelector('.memo');

    if (memos[id]) {
      if (slot == null) {
        slot = VM.createElement("span", {
          className: "memo"
        });
        user.append(slot);
      }

      slot.textContent = ` - ${memos[id]}`;
      user.title = memos[id];
    } else if (slot) {
      slot.remove();
      user.title = '';
    }
  });
}

function addEvent(containerSelector) {
  const container = document.querySelector(containerSelector);
  const memos = getValue(USER_MEMO);
  container.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    const user = event.target.closest(USER_INFO);
    if (user == null) return;
    event.preventDefault();
    const id = parseUserID(user);
    const newMemo = prompt('이용자 메모를 설정합니다.\n', memos[id] || '');
    if (newMemo == null) return;
    let slot = user.querySelector('.memo');

    if (slot == null) {
      slot = VM.createElement("span", {
        className: "memo"
      });
      user.append(slot);
    }

    if (newMemo) {
      slot.textContent = ` - ${newMemo}`;
      memos[id] = newMemo;
    } else {
      slot.remove();
      delete memos[id];
    }

    setValue(USER_MEMO, memos);
    appendMemo();
  });
}

(function App() {
  // Event Related Core Module
  initialize(); // UI Related Core Module

  initilaize();
  initialize$1();
  load(); // Feature Module

  AutoRefresher.load();
  CommentRefresh.load();
  LayoutCustomizer.load();
  AnonymousNick.load();
  ArticleRemover.load();
  CategoryColor.load();
  ImageDownloader.load();
  ImageSearch.load();
  IPScouter.load();
  MuteContent.load();
  MuteEmoticon.load();
  NewWindow.load();
  RatedownGuard.load();
  ShortCut.load();
  load$h();
  UserColor.load();
  UserMemo.load();
  MyImage.load();
  TemporaryArticle.load();
})();

}());
