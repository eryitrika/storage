// ==UserScript==
// @name            Arca Refresher Variant
// @namespace       LeKAKiD(Main Developer)+Eryitrika(simply modified)
// @description     Arca Live Extension Variant
// @downloadURL     https://raw.githubusercontent.com/eryitrika/storage/master/ArcaRefresher.variant.js
// @homepageURL     https://github.com/eryitrika/storage
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
// @version         2.13.2
// @author          LeKAKiD
// @require         https://cdn.jsdelivr.net/combine/npm/@violentmonkey/dom,npm/@violentmonkey/ui
// @require         https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js
// @require         https://unpkg.com/jszip@3.1.5/dist/jszip.min.js
// @require         https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.min.js
// @resource        colorpicker https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/nano.min.css
// ==/UserScript==

(function () {
'use strict';

const onModifyArticleCallback = [];
const onModifyCommentCallback = [];
function initialize() {
  document.addEventListener('ar_article', () => {
    for (const {
      callback
    } of onModifyArticleCallback) {
      try {
        callback();
      } catch (error) {
        console.error(error);
      }
    }
  });
  document.addEventListener('ar_comment', () => {
    for (const {
      callback
    } of onModifyCommentCallback) {
      try {
        callback();
      } catch (error) {
        console.error(error);
      }
    }
  });
}
function addOnModifyArticle(callbackObject) {
  onModifyArticleCallback.push(callbackObject);
  onModifyArticleCallback.sort((a, b) => a.priority - b.priority);
}
function addOnModifyComment(callbackObject) {
  onModifyCommentCallback.push(callbackObject);
  onModifyCommentCallback.sort((a, b) => a.priority - b.priority);
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

function initilaize() {
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

var css_248z$1 = ".body .nav-control {\r\n  z-index: 3000;\r\n}\r\n\r\n#refresherSetting {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  background-color: rgba(0, 0, 0, 0.7);\r\n  z-index: 5000;\r\n\r\n  display: flex;\r\n  justify-content: center;\r\n  align-content: center;\r\n}\r\n\r\n#refresherSetting .background {\r\n  width: 700px;\r\n  height: calc(100% - 4rem);\r\n  border: 1px solid #43494c;\r\n  background-color: white;\r\n  margin: 2rem;\r\n  padding: 2rem;\r\n  z-index: 500;\r\n\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n#refresherSetting .search {\r\n  padding-bottom: 1rem;\r\n}\r\n\r\n#refresherSetting .settings {\r\n  flex-grow: 1;\r\n\r\n  width: 100%;\r\n  overflow: scroll;\r\n}\r\n\r\n#refresherSetting .btn-grid {\r\n  bottom: 0;\r\n  width: 100%;\r\n  height: auto;\r\n  padding-top: 0.5rem;\r\n\r\n  display: grid;\r\n  grid-template-columns: repeat(6, 1fr);\r\n  grid-template-areas: 'export import reset . . save';\r\n}\r\n\r\n#refresherSetting .btn-grid button:nth-child(1) {\r\n  grid-area: export;\r\n}\r\n#refresherSetting .btn-grid button:nth-child(2) {\r\n  grid-area: import;\r\n}\r\n#refresherSetting .btn-grid button:nth-child(3) {\r\n  grid-area: reset;\r\n}\r\n#refresherSetting .btn-grid button:nth-child(4) {\r\n  grid-area: save;\r\n}\r\n\r\n#refresherSetting .group {\r\n  border: 1px solid #bbb;\r\n  border-radius: 0.25rem;\r\n  margin-bottom: 2rem;\r\n  padding: 0.25rem;\r\n}\r\n\r\n#refresherSetting .item {\r\n  margin: 0 0.25rem;\r\n  padding: 0.5rem;\r\n}\r\n\r\n#refresherSetting .item:first-child {\r\n  margin-top: 0;\r\n}\r\n\r\n#refresherSetting .item:last-child {\r\n  margin-bottom: 0;\r\n}\r\n\r\n#refresherSetting .item.default {\r\n  display: grid;\r\n  grid-template-columns: 9fr 3fr;\r\n  grid-template-areas:\r\n    '   header   setting'\r\n    'description .';\r\n  grid-column-gap: 0.5rem;\r\n}\r\n\r\n#refresherSetting .item:not(:last-child):not(.lastChild) {\r\n  border-bottom: 1px solid #bbb;\r\n}\r\n\r\n#refresherSetting .item.wide {\r\n  display: grid;\r\n  grid-template-columns: 1fr;\r\n  grid-template-areas:\r\n    'header'\r\n    'setting'\r\n    'description';\r\n}\r\n\r\n#refresherSetting .item > label {\r\n  grid-area: header;\r\n  margin-bottom: 0.25rem;\r\n  height: 100%;\r\n\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n\r\n#refresherSetting .item.default > label {\r\n  border-right: 1px solid #bbb;\r\n}\r\n\r\n#refresherSetting .item > p {\r\n  grid-area: description;\r\n  margin-bottom: 0;\r\n  color: #666666;\r\n}\r\n\r\n#refresherSetting .item.wide > p {\r\n  grid-area: description;\r\n  margin-bottom: 0;\r\n  padding-left: 0.5rem;\r\n  color: #666666;\r\n}\r\n\r\n#refresherSetting .item > div {\r\n  grid-area: setting;\r\n  margin: 0.5rem;\r\n}\r\n\r\n#refresherSetting select,\r\n#refresherSetting textarea,\r\n#refresherSetting input[type='text'] {\r\n  display: block;\r\n  width: 100%;\r\n  margin: 0;\r\n  padding: 0.5rem 0.75rem;\r\n  color: #55595c;\r\n  background-color: #fff;\r\n  border: 1px solid #bbb;\r\n}\r\n\r\n#refresherSetting input[type='checkbox'] {\r\n  margin: 0.25rem;\r\n}\r\n\r\n#refresherSetting input[disabled] {\r\n  background-color: #eee;\r\n}\r\n#refresherSetting select {\r\n  overflow: scroll;\r\n}\r\n\r\n#refresherSetting label {\r\n  display: inline-flex;\r\n  align-items: center;\r\n}\r\n\r\n@media (prefers-color-scheme: dark) {\r\n  #refresherSetting .background {\r\n    border: 1px solid #43494c;\r\n    background-color: #181a1b;\r\n  }\r\n\r\n  #refresherSetting select,\r\n  #refresherSetting textarea,\r\n  #refresherSetting input[type='text'] {\r\n    color: #e2e2e2;\r\n    background-color: #181a1b;\r\n    border: 1px solid #43494c;\r\n  }\r\n\r\n  #refresherSetting input[disabled] {\r\n    background-color: #999;\r\n  }\r\n}\r\n\r\n@media screen and (max-width: 768px) {\r\n  #refresherSetting .background {\r\n    padding: 1rem;\r\n  }\r\n  #refresherSetting .btn-grid {\r\n    display: grid;\r\n    grid-template-columns: repeat(3, 1fr);\r\n    grid-template-areas:\r\n      'export import reset'\r\n      '. . .'\r\n      'save save save';\r\n    grid-row-gap: 0.25rem;\r\n  }\r\n  #refresherSetting .item.default {\r\n    display: grid;\r\n    grid-template-columns: 1fr;\r\n    grid-template-areas:\r\n      'header'\r\n      'setting'\r\n      'description';\r\n  }\r\n\r\n  #refresherSetting .item.default > label {\r\n    border-right: none;\r\n  }\r\n}\r\n";

const saveCallbackList = [];
const loadCallbackList = [];
const settingContainer = VM.createElement("div", {
  className: "settings"
});
const GroupList = [];
/**
 * 스크립트 설정 버튼을 누르면 나오는 설정창에 모듈의 설정을 추가해줍니다.
 * @param {Object} param                        파라미터 오브젝트
 * @param {string} param.header                 설정 그룹 이름
 * @param {Array} param.group                   설정 그룹
 * @param {Element} param.group.title           표기할 설정명
 * @param {Element} param.group.description     표기할 설정 부연설명
 * @param {Element} param.group.item            상호작용할 엘리먼트
 * @param {string} [param.group.type]           설정 표기 방식
 * @param {Object} param.valueCallback          콜백함수 오브젝트
 * @param {function} param.valueCallback.save   저장 버튼을 누를 시 호출할 콜백 함수
 * @param {function} param.valueCallback.load   불러오기 버튼을 누를 시 호출할 콜백 함수
 */

function addSetting({
  header,
  group,
  valueCallback: {
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
  saveCallbackList.push(save);
  loadCallbackList.push(load);
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
  const data = JSON.parse(JSONString); // 임시 수정 설정 검증 루틴 필요

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

function initialize$1() {
  // 설정 버튼 엘리먼트
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

    for (const func of loadCallbackList) {
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
    const data = btoa(encodeURIComponent(exportConfig()));
    navigator.clipboard.writeText(data);
    alert('클립보드에 설정이 복사되었습니다.');
  }

  function onImport() {
    let data = prompt('가져올 설정 데이터를 입력해주세요');
    if (data === null) return;

    try {
      if (data === '') throw '[Setting.importConfig] 공백 값을 입력했습니다.';
      data = decodeURIComponent(atob(data));
      importConfig(data);
      window.location.reload();
    } catch (error) {
      alert('올바르지 않은 데이터입니다.');
      console.error(error);
    }
  }

  function onReset() {
    if (!window.confirm('모든 설정이 초기화 됩니다. 계속하시겠습니까?')) return;
    resetConfig();
    window.location.reload();
  }

  function onSave() {
    for (const func of saveCallbackList) {
      func();
    }

    window.location.reload();
  }

  const configContainer = VM.createElement("div", {
    id: "refresherSetting"
  }, VM.createElement("style", null, css_248z$1), VM.createElement("div", {
    className: "background"
  }, VM.createElement("h4", null, "Arca Refresher"), VM.createElement("div", {
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

var css_248z$2 = "#context-wrapper.mobile {\r\n  display: flex;\r\n  justify-content: center;\r\n  background-color: rgba(0, 0, 0, 0.5);\r\n}\r\n\r\n#context-wrapper.mobile #context-menu {\r\n  width: 80%;\r\n  align-self: center;\r\n}\r\n\r\n#context-menu {\r\n  position: fixed;\r\n  width: 300px;\r\n  padding: 0.5rem;\r\n  border: 1px solid #bbb;\r\n  background-color: #fff;\r\n  z-index: 20;\r\n  pointer-events: auto;\r\n}\r\n\r\n#context-menu .devider {\r\n  height: 1px;\r\n  margin: 0.5rem 0;\r\n  overflow: hidden;\r\n  background-color: #e5e5e5;\r\n}\r\n\r\n#context-menu .item {\r\n  display: block;\r\n  width: 100%;\r\n  padding: 3px 20px;\r\n  clear: both;\r\n  font-weight: 400;\r\n  color: #373a3c;\r\n  white-space: nowrap;\r\n  border: 0;\r\n}\r\n\r\n#context-menu .item:hover,\r\n#context-menu .item:focus {\r\n  color: #2b2d2f;\r\n  background-color: #f5f5f5;\r\n  text-decoration: none;\r\n}\r\n\r\n#context-wrapper {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n";

var ContextMenu = {
  initialize: initialize$2,
  hide,
  addMenuGroup,
  createMenu,
  getContextData
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
}, contextMenuView);
let mobile = false;

function initialize$2() {
  // on/off 설정 넣어
  document.head.append(VM.createElement("style", null, css_248z$2));
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

const CurrentPage = {
  Channel: {
    ID: '',
    Name: ''
  },
  Article: {
    Title: '',
    Category: '',
    Author: '',
    AuthorID: '',
    URL: ''
  },
  Category: [],
  Component: {
    Article: false,
    Comment: false,
    Board: false,
    Write: false
  }
};
function initialize$3() {
  const articleElement = document.querySelector('article');
  const boardTitle = articleElement.querySelector('.board-title');
  const articleView = articleElement.querySelector('.article-wrapper');
  const commentView = articleElement.querySelector('#comment');
  const boardView = articleElement.querySelector('div.board-article-list, div.included-article-list');
  const writeView = articleElement.querySelector('.article-write');

  if (boardTitle) {
    CurrentPage.Channel = {
      ID: window.location.pathname.split('/')[2],
      Name: boardTitle.querySelector('a:not([class])').textContent
    };
  }

  if (articleView) {
    const titleElement = articleView.querySelector('.article-head .title');
    const categoryElement = articleView.querySelector('.article-head .badge');
    const authorElement = articleView.querySelector('.article-head .user-info');
    const linkElement = articleView.querySelector('.article-body .article-link a');
    CurrentPage.Article = {
      Title: titleElement.lastChild.textContent.trim(),
      Category: categoryElement ? categoryElement.textContent : '',
      Author: authorElement ? parseUserInfo(authorElement) : '',
      AuthorID: authorElement ? parseUserID(authorElement) : '',
      URL: linkElement ? linkElement.href : window.location.href
    };
  }

  if (boardView) {
    const categoryElements = boardView.querySelectorAll('.board-category a');
    const categoryArray = Array.prototype.slice.call(categoryElements);
    CurrentPage.Category = categoryArray.map(e => e.textContent);
  }

  CurrentPage.Component = {
    Article: !!articleView,
    Comment: !!commentView,
    Board: !!boardView,
    Write: !!writeView
  };
}
function parseUserInfo(infoElement) {
  if (!infoElement) {
    console.error('[Parser.parseUserInfo] 올바르지 않은 부모 엘리먼트 사용');
    return null;
  }

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
  if (!infoElement) {
    console.error('[Parser.parseUserID] 올바르지 않은 부모 엘리먼트 사용');
    return null;
  }

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

async function waitForElement(selector) {
  let targetElement = document.querySelector(selector);
  if (targetElement) return Promise.resolve(targetElement);
  return new Promise(resolve => {
    const observer = new MutationObserver(() => {
      targetElement = document.querySelector(selector);

      if (targetElement) {
        observer.disconnect();
        resolve(targetElement);
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  });
}

var ArticleMenu = {
  addHeaderBtn
};
/**
 * 게시물 상단 헤더 메뉴에 버튼을 추가합니다.
 * @param {Object} param                파라미터 오브젝트
 * @param {string} param.text           버튼 텍스트
 * @param {string} param.icon           버튼 좌측에 붙을 아이콘
 * @param {string} [param.description]  버튼에 마우스를 올려두면 표시될 설명
 * @param {Function} param.onClick      버튼을 클릭 시 호출할 콜백 함수
 */

function addHeaderBtn({
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

var AnonymousNick = {
  load
};
const DefaultPrefix = ['웃는', '화난', '불쌍한', '즐거운', '건장한', '해탈한', '광기의', '귀여운', '곱슬머리', '개구쟁이', '자신있는', '방구석', '노래하는', '책읽는', '구르는', '비틀거리는', '힘든', '순수한', '행복한', '불닭먹는'];
const DefaultSuffix = ['미호', '캬루', '둘리', '도바킨', '테레사', '윾돌이', '보노보노', '다비', '공룡', '아야'];

function load() {
  try {
    if (CurrentPage.Component.Article) {
      addArticleMenu();
    }
  } catch (error) {
    console.error(error);
  }
}

function addArticleMenu() {
  ArticleMenu.addHeaderBtn({
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
  load: load$1
};
const REFRESH_TIME = {
  key: 'refreshTime',
  defaultValue: 3
};
const HIDE_REFRESHER = {
  key: 'hideRefresher',
  defaultValue: false
};
let refreshTime = 0;
let loader = null;
let loopInterval = null;

function load$1() {
  try {
    setupSetting();
    if (CurrentPage.Component.Article) return;

    if (CurrentPage.Component.Board) {
      apply();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting() {
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
    valueCallback: {
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

  document.dispatchEvent(new Event('ar_article'));
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
  load: load$2
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

function load$2() {
  try {
    setupSetting$1();

    if (CurrentPage.Component.Board) {
      addOnModifyArticle({
        priority: 999,
        callback: remove
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$1() {
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
    valueCallback: {
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
var stylesheet=".body\r\n  .board-article\r\n  .article-list\r\n  .list-table.show-filtered-category\r\n  .vrow.filtered-category {\r\n  display: flex;\r\n}\r\n\r\n.body .board-article .show-filtered-category .filter-count-category {\r\n  color: #bbb;\r\n}\r\n\r\n.MuteContent-module_wrapper__f1VbG {\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.MuteContent-module_item__1hfud {\r\n  min-height: 3rem;\r\n\r\n  display: grid;\r\n  grid-template-columns: 1fr 2fr;\r\n  grid-template-areas: 'category opts';\r\n  align-items: stretch;\r\n\r\n  border-top: 1px solid #bbb;\r\n}\r\n\r\n@media screen and (max-width: 768px) {\r\n  .MuteContent-module_item__1hfud {\r\n    grid-template-columns: 1fr;\r\n    grid-template-areas:\r\n      'category'\r\n      'opts';\r\n  }\r\n}\r\n\r\n.MuteContent-module_item__1hfud label {\r\n  margin: 0;\r\n}\r\n\r\n.MuteContent-module_item__1hfud > div {\r\n  height: 3rem;\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n\r\n.MuteContent-module_item__1hfud > div:nth-child(1) {\r\n  grid-area: category;\r\n}\r\n\r\n.MuteContent-module_item__1hfud > div:nth-child(2) {\r\n  grid-area: opts;\r\n}\r\n";

var MuteContent = {
  load: load$3
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
const MUTE_NOTICE = {
  key: 'hideNotice',
  defaultValue: false
};

function load$3() {
  try {
    setupSetting$2();

    if (CurrentPage.Component.Article) {
      addArticleMenu$1();
    }

    if (CurrentPage.Component.Comment) {
      muteContent('comment');
    }

    if (CurrentPage.Component.Board) {
      muteSidebar();
      muteNotice();
      mutePreview();
      muteContent('board');
    }

    addOnModifyArticle({
      priority: 100,

      callback() {
        muteNotice();
        mutePreview();
        muteContent('board');
      }

    });
    addOnModifyComment({
      priority: 100,

      callback() {
        muteContent('comment');
      }

    });
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$2() {
  document.head.append(VM.createElement("style", null, stylesheet));
  const hideNotice = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uC0AC\uC6A9 \uC548 \uD568"), VM.createElement("option", {
    value: "true"
  }, "\uC0AC\uC6A9"));
  const userMute = VM.createElement("textarea", {
    rows: "6",
    placeholder: "\uBBA4\uD2B8\uD560 \uC774\uC6A9\uC790\uC758 \uB2C9\uB124\uC784\uC744 \uC785\uB825, \uC904\uBC14\uAFC8\uC73C\uB85C \uAD6C\uBCC4\uD569\uB2C8\uB2E4."
  });
  const keywordMute = VM.createElement("textarea", {
    rows: "6",
    placeholder: "\uBBA4\uD2B8\uD560 \uD0A4\uC6CC\uB4DC\uB97C \uC785\uB825, \uC904\uBC14\uAFC8\uC73C\uB85C \uAD6C\uBCC4\uD569\uB2C8\uB2E4."
  });
  const categoryContainer = {};
  const categoryWrapper = VM.createElement("div", {
    className: MuteStyle.wrapper
  }, CurrentPage.Category.map(category => {
    let name = category;
    if (category === '전체') name = '일반';
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
    categoryContainer[name] = {
      previewMute: previewInput,
      articleMute: articleInput
    };
    return VM.createElement("div", {
      className: MuteStyle.item
    }, VM.createElement("div", null, name), VM.createElement("div", null, VM.createElement("label", null, previewInput, "\uBBF8\uB9AC\uBCF4\uAE30 \uBBA4\uD2B8"), VM.createElement("label", null, articleInput, "\uAC8C\uC2DC\uBB3C \uBBA4\uD2B8")));
  }));
  const channel = CurrentPage.Channel.ID;
  addSetting({
    header: '뮤트',
    group: [{
      title: '공지사항 접기',
      content: hideNotice
    }, {
      title: '사용자 목록',
      description: VM.createElement(VM.Fragment, null, "\uC9C0\uC815\uD55C \uC720\uC800\uC758 \uAC8C\uC2DC\uBB3C\uACFC \uB313\uAE00\uC744 \uC228\uAE41\uB2C8\uB2E4.", VM.createElement("br", null), "Regex \uBB38\uBC95\uC744 \uC9C0\uC6D0\uD558\uAE30 \uB54C\uBB38\uC5D0 \uD2B9\uC218\uBB38\uC790 \uC0AC\uC6A9 \uC2DC \uC5ED\uC2AC\uB798\uC2DC\uB97C \uBD99\uC5EC\uC57C\uD569\uB2C8\uB2E4.", VM.createElement("br", null), "\uC0AC\uC6A9 \uC2DC \uC5ED\uC2AC\uB798\uC2DC\uB97C \uBD99\uC5EC \uC791\uC131\uD574\uC57C\uD558\uB294 \uD2B9\uC218\uBB38\uC790 \uBAA9\uB85D", VM.createElement("br", null), VM.createElement("ul", null, VM.createElement("li", null, "\uC18C\uAD04\uD638()"), VM.createElement("li", null, "\uB9C8\uCE68\uD45C."))),
      content: userMute,
      type: 'wide'
    }, {
      title: '키워드 목록',
      description: VM.createElement(VM.Fragment, null, "\uC9C0\uC815\uD55C \uD0A4\uC6CC\uB4DC\uAC00 \uD3EC\uD568\uB41C \uC81C\uBAA9\uC744 \uAC00\uC9C4 \uAC8C\uC2DC\uBB3C\uACFC \uB313\uAE00\uC744 \uC228\uAE41\uB2C8\uB2E4.", VM.createElement("br", null), "Regex \uBB38\uBC95\uC744 \uC9C0\uC6D0\uD558\uAE30 \uB54C\uBB38\uC5D0 \uD2B9\uC218\uBB38\uC790 \uC0AC\uC6A9 \uC2DC \uC5ED\uC2AC\uB798\uC2DC\uB97C \uBD99\uC5EC\uC57C\uD569\uB2C8\uB2E4.", VM.createElement("br", null), "\uC0AC\uC6A9 \uC2DC \uC5ED\uC2AC\uB798\uC2DC\uB97C \uBD99\uC5EC \uC791\uC131\uD574\uC57C\uD558\uB294 \uD2B9\uC218\uBB38\uC790 \uBAA9\uB85D", VM.createElement("br", null), VM.createElement("ul", null, VM.createElement("li", null, "\uC18C\uAD04\uD638()"), VM.createElement("li", null, "\uC911\uAD04\uD638", '{}'), VM.createElement("li", null, "\uB300\uAD04\uD638[]"), VM.createElement("li", null, "\uB9C8\uCE68\uD45C."), VM.createElement("li", null, "\uD50C\uB7EC\uC2A4+"), VM.createElement("li", null, "\uBB3C\uC74C\uD45C?"), VM.createElement("li", null, "\uB2EC\uB7EC\uAE30\uD638$"), VM.createElement("li", null, "\uCE90\uB7FF^"), VM.createElement("li", null, "\uBCC4*"), VM.createElement("li", null, "\uC2AC\uB798\uC2DC/"), VM.createElement("li", null, "\uC5ED\uC2AC\uB798\uC2DC\\"), VM.createElement("li", null, "\uD558\uC774\uD508-"), VM.createElement("li", null, "\uD30C\uC774\uD504|"))),
      content: keywordMute,
      type: 'wide'
    }, {
      title: '카테고리 설정',
      description: VM.createElement(VM.Fragment, null, "\uBBF8\uB9AC\uBCF4\uAE30 \uBBA4\uD2B8: \uD574\uB2F9 \uCE74\uD14C\uACE0\uB9AC \uAC8C\uC2DC\uBB3C\uC758 \uBBF8\uB9AC\uBCF4\uAE30\uB97C \uC81C\uAC70\uD569\uB2C8\uB2E4.", VM.createElement("br", null), "\uAC8C\uC2DC\uBB3C \uBBA4\uD2B8: \uD574\uB2F9 \uCE74\uD14C\uACE0\uB9AC\uC758 \uAC8C\uC2DC\uBB3C\uC744 \uC228\uAE41\uB2C8\uB2E4."),
      content: categoryWrapper,
      type: 'wide'
    }],
    valueCallback: {
      save() {
        setValue(MUTE_NOTICE, hideNotice.value === 'true');
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

function addArticleMenu$1() {
  const userList = getValue(BLOCK_USER);
  const user = CurrentPage.Article.Author;
  const userID = CurrentPage.Article.AuthorID.replace('(', '\\(').replace(')', '\\)').replace('.', '\\.');
  const filter = `${user === userID ? '^' : ''}${userID}$`;
  const indexed = userList.indexOf(filter);

  if (indexed > -1) {
    ArticleMenu.addHeaderBtn({
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
    ArticleMenu.addHeaderBtn({
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
  const channel = CurrentPage.Channel.ID;
  const config = getValue(MUTE_CATEGORY)[channel];
  if (!config) return;
  const articles = document.querySelectorAll('a.vrow:not(.notice)');
  articles.forEach(article => {
    const badge = article.querySelector('.badge');
    if (badge === null) return;
    let category = badge.textContent;
    category = category === '' ? '일반' : category;
    if (!config[category]) return;
    const {
      mutePreview: filtered
    } = config[category];
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

function muteContent(viewQuery) {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      muteContent(viewQuery);
    }, {
      once: true
    });
    return;
  }

  const count = {};

  for (const key of Object.keys(ContentTypeString)) {
    count[key] = 0;
  }

  const channel = CurrentPage.Channel.ID;
  let userlist = getValue(BLOCK_USER);
  let keywordlist = getValue(BLOCK_KEYWORD);
  const categoryConfig = getValue(MUTE_CATEGORY)[channel];

  if ((unsafeWindow.LiveConfig || undefined) && unsafeWindow.LiveConfig.mute !== undefined) {
    userlist.push(...unsafeWindow.LiveConfig.mute.users);
    keywordlist.push(...unsafeWindow.LiveConfig.mute.keywords);
    userlist = Array.from(new Set(userlist));
    keywordlist = Array.from(new Set(keywordlist));
  }

  let itemContainer;
  let contents = null;
  let keywordSelector = '';
  let targetElement = null;
  let insertPosition = '';

  if (viewQuery === 'board') {
    itemContainer = document.querySelector('div.board-article-list .list-table, div.included-article-list .list-table');
    targetElement = itemContainer;
    contents = document.querySelectorAll('a.vrow:not(.notice)');
    keywordSelector = '.col-title';
    insertPosition = 'afterbegin';
  } else if (viewQuery === 'comment') {
    itemContainer = document.querySelector('#comment');
    targetElement = itemContainer.querySelector('.list-area');
    contents = document.querySelectorAll('#comment .comment-item');
    keywordSelector = '.message';
    insertPosition = 'beforebegin';
  }

  if (!itemContainer) return;
  contents.forEach(item => {
    const keywordElement = item.querySelector(keywordSelector);
    const userElement = item.querySelector('.user-info');
    if (!keywordElement || !userElement) return;
    const keywordText = keywordElement.innerText;
    const userText = parseUserInfo(userElement);
    const categoryElement = item.querySelector('.badge');
    let category;

    if (categoryElement === null || categoryElement.textContent === '') {
      category = '일반';
    } else {
      category = categoryElement.textContent;
    }

    const keywordAllow = keywordlist.length === 0 ? false : new RegExp(keywordlist.join('|')).test(keywordText);
    const userAllow = userlist.length === 0 ? false : new RegExp(userlist.join('|')).test(userText);
    let categoryAllow = false;

    if (channel && categoryConfig && categoryConfig[category]) {
      categoryAllow = categoryConfig[category].muteArticle;
    }

    if (keywordAllow) {
      item.classList.add('filtered');
      item.classList.add('filtered-keyword');
      count.keyword += 1;
      count.all += 1;
    }

    if (userAllow) {
      item.classList.add('filtered');
      item.classList.add('filtered-user');
      count.user += 1;
      count.all += 1;
    }

    if (categoryAllow) {
      item.classList.add('filtered');
      item.classList.add('filtered-category');
      count.category += 1;
      count.all += 1;
    }

    if (item.classList.contains('deleted')) {
      item.classList.add('filtered');
      item.classList.add('filtered-deleted');
      count.deleted += 1;
      count.all += 1;
    }
  });
  let toggleHeader = itemContainer.querySelector('.frontend-header');
  if (toggleHeader) toggleHeader.remove();
  toggleHeader = VM.createElement("div", {
    className: "frontend-header"
  }, VM.createElement("span", {
    className: "filter-title"
  }, "\uD544\uD130\uB41C \uAC8C\uC2DC\uBB3C"), VM.createElement("span", {
    className: "filter-count-container"
  }));
  const container = toggleHeader.querySelector('.filter-count-container');

  if (count.all > 0) {
    targetElement.insertAdjacentElement(insertPosition, toggleHeader);

    for (const key of Object.keys(count)) {
      if (count[key] > 0) {
        let className = `show-filtered-${key}`;
        if (key === 'all') className = 'show-filtered';
        const btn = VM.createElement("span", {
          className: `filter-count filter-count-${key}`
        }, ContentTypeString[key], " (", count[key], ")");
        container.append(btn);
        btn.addEventListener('click', () => {
          if (targetElement.classList.contains(className)) {
            targetElement.classList.remove(className);
            toggleHeader.classList.remove(className);
          } else {
            targetElement.classList.add(className);
            toggleHeader.classList.add(className);
          }
        });
      }
    }
  }
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
var stylesheet$1=".CategoryColor-module_wrapper__3fu3y {\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.CategoryColor-module_item__rfess {\r\n  min-height: 3rem;\r\n\r\n  display: grid;\r\n  grid-template-columns: 4fr 1fr 1fr 6fr;\r\n  grid-template-areas: 'category badge bg etc';\r\n  align-items: stretch;\r\n\r\n  border-top: 1px solid #bbb;\r\n}\r\n\r\n@media screen and (max-width: 768px) {\r\n  .CategoryColor-module_item__rfess {\r\n    grid-template-columns: 4fr 1fr 1fr;\r\n    grid-template-areas:\r\n      'category badge bg'\r\n      'etc etc etc';\r\n  }\r\n}\r\n\r\n.CategoryColor-module_item__rfess label {\r\n  margin: 0;\r\n}\r\n\r\n.CategoryColor-module_bold__1gN9W {\r\n  font-weight: 700;\r\n}\r\n\r\n.pickr {\r\n  border: 1px solid #bbb;\r\n  border-radius: 0.15em;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div {\r\n  height: 3rem;\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div:nth-child(1) {\r\n  grid-area: category;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div:nth-child(2) {\r\n  grid-area: badge;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div:nth-child(3) {\r\n  grid-area: bg;\r\n}\r\n\r\n.CategoryColor-module_item__rfess > div:nth-child(4) {\r\n  grid-area: etc;\r\n}\r\n";

var CategoryColor = {
  load: load$4
};
const CATEGORY_COLOR = {
  key: 'categoryColor',
  defaultValue: {}
};

function load$4() {
  try {
    setupSetting$3();

    if (CurrentPage.Component.Board) {
      generateColorStyle();
      apply$1();
    }

    addOnModifyArticle({
      priority: 0,
      callback: apply$1
    });
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

function setupSetting$3() {
  const dataContainer = {};
  const settingWrapper = VM.createElement("div", {
    className: styles.wrapper
  }, VM.createElement("style", null, stylesheet$1), VM.createElement("style", null, GM_getResourceText('colorpicker')), CurrentPage.Category.map(category => {
    let name = category;
    if (category === '전체') name = '일반';
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
    dataContainer[name] = {
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
  const channel = CurrentPage.Channel.ID;
  addSetting({
    header: '카테고리 색상 설정',
    group: [{
      title: '색상 변경',
      content: settingWrapper,
      type: 'wide'
    }],
    valueCallback: {
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
  const channel = CurrentPage.Channel.ID;
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
  const articles = document.querySelectorAll('a.vrow:not(.notice)');
  articles.forEach(article => {
    if (article.childElementCount < 2) return;
    const categoryElement = article.querySelector('.badge');
    if (!categoryElement) return;
    const category = categoryElement.textContent ? categoryElement.textContent : '일반';
    if (!styleTable[category]) return;
    article.classList.add(`color_${styleTable[category]}`);
  });
}

var ClipboardUpload = {
  load: load$5
};

async function load$5() {
  try {
    if (CurrentPage.Component.Write) {
      await waitForElement('.fr-box');
      apply$2();
    }
  } catch (error) {
    console.error(error);
  }
}

function apply$2() {
  const editor = unsafeWindow.FroalaEditor('#content');
  editor.events.on('paste.before', event => {
    const files = event.clipboardData.files;
    if (files.length === 0) return true;
    editor.image.upload(files);
    return false;
  }, true);
}

var CommentRefresh = {
  load: load$6
};

function load$6() {
  try {
    if (CurrentPage.Component.Article) {
      apply$3();
    }
  } catch (error) {
    console.error(error);
  }
}

function apply$3() {
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
  commentArea.querySelector('.title a').insertAdjacentElement('beforebegin', btn);
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
      document.dispatchEvent(new Event('ar_comment'));
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

var MuteEmoticon = {
  load: load$7
};
const BLOCK_EMOTICON = {
  key: 'blockEmoticon',
  defaultValue: {}
};

function load$7() {
  try {
    setupSetting$4();

    if (CurrentPage.Component.Comment) {
      mute();
      apply$4();
    }

    addOnModifyComment({
      priority: 100,

      callback() {
        mute();
        apply$4();
      }

    });
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$4() {
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
    valueCallback: {
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

        for (const key of Object.keys(data)) {
          muteEmoticon.append(VM.createElement("option", {
            value: key
          }, data[key].name));
        }
      }

    }
  });
}

function mute() {
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

function apply$4() {
  const commentArea = document.querySelector('#comment');
  const emoticons = commentArea.querySelectorAll('.emoticon');
  emoticons.forEach(item => {
    const btn = VM.createElement("span", null, '\n | ', VM.createElement("a", {
      href: "#",
      className: "block-emoticon",
      "data-id": item.dataset.id
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
      const [name, bundleID] = await getEmoticonInfo(id);
      const bundle = await getEmoticonBundle(bundleID);
      const blockEmoticon = getValue(BLOCK_EMOTICON);
      blockEmoticon[bundleID] = {
        name,
        bundle
      };
      setValue(BLOCK_EMOTICON, blockEmoticon);
    } catch (error) {
      alert(error);
      console.error(error);
    }

    window.location.reload();
  });
}

function getEmoticonInfo(id) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `/api/emoticon/shop/${id}`,
      responseType: 'document',
      timeout: 10000,

      onload({
        response
      }) {
        try {
          const name = response.querySelector('.article-head .title').textContent;
          const bundleID = response.querySelector('.article-body form').action.split('/e/')[1].split('/')[0];
          resolve([name, bundleID]);
        } catch (error) {
          reject(new Error('이모티콘 정보를 받아오지 못했습니다.\n사유: 삭제, 사이트 구조 변경, 기타'));
        }
      },

      ontimeout() {
        reject(new Error('이모티콘 정보를 받아오지 못했습니다.\n사유: Timeout'));
      },

      onerror(error) {
        reject(new Error('이모티콘 정보를 받아오지 못했습니다.\n사유: 접속 실패', error));
      }

    });
  });
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
        resolve(bundle);
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

var FullAreaReply = {
  load: load$8
};
const WIDE_AREA = {
  key: 'wideCommentArea',
  defaultValue: true
};
const FORCE_OPEN_COMMENT = {
  key: 'forceOpenComment',
  defaultValue: false
};

function load$8() {
  try {
    setupSetting$5();

    if (CurrentPage.Component.Comment) {
      apply$5();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$5() {
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
    header: '댓글창 관련',
    group: [{
      title: '댓글을 클릭하면 답글창이 바로 열리게 하기',
      content: wideCommentArea
    }, {
      title: '접힌 댓글 바로 펼쳐보기',
      content: forceOpenComment
    }],
    valueCallback: {
      save() {
        setValue(WIDE_AREA, wideCommentArea.value === 'true');
        setValue(FORCE_OPEN_COMMENT, forceOpenComment.value === 'true');
      },

      load() {
        forceOpenComment.value = getValue(FORCE_OPEN_COMMENT);
        wideCommentArea.value = getValue(WIDE_AREA);
      }

    }
  });
}

function apply$5() {
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

  const forceOpenComment = getValue(FORCE_OPEN_COMMENT);

  if (forceOpenComment) {
    const foldedReplyList = document.querySelectorAll('#comment .btn-more');
    foldedReplyList.forEach(e => {
      e.style.display = 'none';
      e.closest('.message').style.maxHeight = 'none';
    });
  }
}

var styles$1 = {"green":"IPScouter-module_green__K9yWK","red":"IPScouter-module_red__3yMjL","blue":"IPScouter-module_blue__YSAPo"};
var stylesheet$2=".vcol.col-author {\r\n  width: 7.5rem !important;\r\n}\r\n\r\n.ips + .IPScouter-module_green__K9yWK {\r\n  color: rgb(37, 141, 37);\r\n}\r\n\r\n.ips + .IPScouter-module_red__3yMjL {\r\n  color: rgb(236, 69, 69);\r\n}\r\n\r\n.ips + .IPScouter-module_blue__YSAPo {\r\n  color: rgb(56, 174, 252);\r\n}\r\n";

var IPScouter = {
  load: load$9
};

function load$9() {
  try {
    apply$6();
    addOnModifyArticle({
      priority: 0,

      callback() {
        apply$6('board');
      }

    });
    addOnModifyComment({
      priority: 0,

      callback() {
        apply$6('comment');
      }

    });
  } catch (error) {
    console.error(error);
  }
}

function apply$6(viewQuery) {
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
function getArrayBuffer(url, onProgress, onLoad) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      responseType: 'arraybuffer',
      onprogress: event => {
        if (onProgress) onProgress(event);
      },
      onload: response => {
        if (onLoad) onLoad();
        resolve(response.response);
      },
      onerror: error => {
        reject(new Error('이미지 arraybuffer 다운로드 중 오류 발생', error));
      }
    });
  });
}

var css_248z$4 = ".article-image {\r\n  margin: 1rem 0;\r\n  border: 1px solid #bbb;\r\n  width: 100%;\r\n  padding: 0.5rem;\r\n}\r\n\r\n.article-image .image-list {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fill, minmax(100px, auto));\r\n  gap: 0.5rem;\r\n  justify-items: center;\r\n  margin-bottom: 0.5rem;\r\n}\r\n\r\n.article-image .item {\r\n  width: 100px;\r\n  height: 100px;\r\n  border: 1px solid #bbb;\r\n  margin: 0;\r\n  background-size: cover;\r\n}\r\n\r\n.article-image button {\r\n  width: 100%;\r\n  margin-top: 0.5rem;\r\n}\r\n\r\n@media (prefers-color-scheme: dark) {\r\n  #imageList tbody a {\r\n    color: #e2e2e2;\r\n  }\r\n}\r\n";

var ImageDownloader = {
  load: load$a
};
const FILENAME = {
  key: 'imageDownloaderFileName',
  defaultValue: '%title%'
};
const IMAGENAME = {
  key: 'imageDonwloaderImageName',
  defaultValue: '%num%_%orig%' // Modified (Eryitrika)
};
const ZIP_COMMENT = {
  key: 'imageDownloaderZipComment',
  defaultValue: '[%channel%] %title% - %url%'
};

function load$a() {
  try {
    setupSetting$6();

    if (CurrentPage.Component.Article) {
      addContextMenu();
      apply$7();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$6() {
  const downloadName = VM.createElement("input", {
    type: "text"
  });
  const imageName = VM.createElement("input", {
    type: "text"
  });
  const zipComment = VM.createElement("textarea", {
    rows: "6"
  });
  addSetting({
    header: '이미지 다운로드',
    group: [{
      title: '압축파일 이름',
      description: VM.createElement(VM.Fragment, null, "\uC774\uBBF8\uC9C0 \uC77C\uAD04 \uB2E4\uC6B4\uB85C\uB4DC \uC0AC\uC6A9 \uC2DC \uC800\uC7A5\uD560 \uC555\uCD95 \uD30C\uC77C\uC758 \uC774\uB984 \uD3EC\uB9F7\uC785\uB2C8\uB2E4.", VM.createElement("br", null), "%title%: \uAC8C\uC2DC\uBB3C \uC81C\uBAA9", VM.createElement("br", null), "%category%: \uAC8C\uC2DC\uBB3C \uCE74\uD14C\uACE0\uB9AC", VM.createElement("br", null), "%author%: \uAC8C\uC2DC\uBB3C \uC791\uC131\uC790", VM.createElement("br", null), "%channel%: \uCC44\uB110 \uC774\uB984"),
      content: downloadName,
      type: 'wide'
    }, {
      title: '저장할 이미지 이름',
      description: VM.createElement(VM.Fragment, null, "\uC774\uBBF8\uC9C0 \uC77C\uAD04 \uB2E4\uC6B4\uB85C\uB4DC \uC0AC\uC6A9 \uC2DC \uC800\uC7A5\uD560 \uC774\uBBF8\uC9C0\uC758 \uC774\uB984 \uD3EC\uB9F7\uC785\uB2C8\uB2E4.", VM.createElement("br", null), "orig \uD639\uC740 num\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC774\uB984\uC744 \uAD6C\uBD84\uD574\uC57C \uC815\uC0C1 \uC800\uC7A5\uB429\uB2C8\uB2E4.", VM.createElement("br", null), VM.createElement("br", null), "%orig%: \uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC\uBA85 (64\uC790 \uCF54\uB4DC)", VM.createElement("br", null), "%num%: \uB118\uBC84\uB9C1 (000~999)", VM.createElement("br", null), "%title%: \uAC8C\uC2DC\uBB3C \uC81C\uBAA9", VM.createElement("br", null), "%category%: \uAC8C\uC2DC\uBB3C \uCE74\uD14C\uACE0\uB9AC", VM.createElement("br", null), "%author%: \uAC8C\uC2DC\uBB3C \uC791\uC131\uC790", VM.createElement("br", null), "%channel%: \uCC44\uB110 \uC774\uB984"),
      content: imageName,
      type: 'wide'
    }, {
      title: '압축파일 코멘트',
      description: VM.createElement(VM.Fragment, null, "\uC774\uBBF8\uC9C0 \uC77C\uAD04 \uB2E4\uC6B4\uB85C\uB4DC \uC0AC\uC6A9 \uC2DC \uC800\uC7A5\uD560 \uC555\uCD95\uD30C\uC77C\uC5D0 \uB0A8\uAE38 \uCF54\uBA58\uD2B8\uC785\uB2C8\uB2E4.", VM.createElement("br", null), "%title%: \uAC8C\uC2DC\uBB3C \uC81C\uBAA9", VM.createElement("br", null), "%category%: \uAC8C\uC2DC\uBB3C \uCE74\uD14C\uACE0\uB9AC", VM.createElement("br", null), "%author%: \uAC8C\uC2DC\uBB3C \uC791\uC131\uC790", VM.createElement("br", null), "%channel%: \uCC44\uB110 \uC774\uB984", VM.createElement("br", null), "%url%: \uAC8C\uC2DC\uBB3C \uC8FC\uC18C"),
      content: zipComment,
      type: 'wide'
    }],
    valueCallback: {
      save() {
        setValue(FILENAME, downloadName.value);
        setValue(IMAGENAME, imageName.value);
        setValue(ZIP_COMMENT, zipComment.value);
      },

      load() {
        downloadName.value = getValue(FILENAME);
        imageName.value = getValue(IMAGENAME);
        zipComment.value = getValue(ZIP_COMMENT);
      }

    }
  });
}

function addContextMenu() {
  const copyClipboardItem = ContextMenu.createMenu({
    text: '클립보드에 복사',

    async onClick(event) {
      event.preventDefault();
      const url = ContextMenu.getContextData('url');
      const title = event.target.textContent;
      const buffer = await getArrayBuffer(url, e => {
        const progress = Math.round(e.loaded / e.total * 100);
        event.target.textContent = `${progress}%`;
      }, () => {
        event.target.textContent = title;
      });
      const blob = new Blob([buffer], {
        type: 'image/png'
      });
      const item = new ClipboardItem({
        [blob.type]: blob
      });
      navigator.clipboard.write([item]);
      ContextMenu.hide();
    }

  });
  const saveImageItem = ContextMenu.createMenu({
    text: '이미지 저장',

    async onClick(event) {
      event.preventDefault();
      const title = event.target.textContent;
      const url = ContextMenu.getContextData('url');
      const ext = url.substring(url.lastIndexOf('.'), url.lastIndexOf('?'));
      let imagename = replaceData(getValue(IMAGENAME));
      imagename = imagename.replace('%num%', '000');
      imagename = imagename.replace('%orig%', url.match(/[0-9a-f]{64}/)[0]);

      try {
        const file = await getBlob(url, e => {
          const progress = Math.round(e.loaded / e.total * 100);
          event.target.textContent = `${progress}%`;
        }, () => {
          event.target.textContent = title;
        });
        window.saveAs(file, `${imagename}${ext}`);
      } catch (error) {
        alert(`개발자 도구(F12)의 콘솔창의 오류 메세지를 같이 제보 바랍니다.\n사유: ${error.message}`);
        console.error(error);
      }

      ContextMenu.hide();
    }

  });
  const copyURLItem = ContextMenu.createMenu({
    text: '이미지 주소 복사',

    onClick(event) {
      event.preventDefault();
      const url = ContextMenu.getContextData('url');
      navigator.clipboard.writeText(url);
      ContextMenu.hide();
    }

  });
  const contextElement = VM.createElement("div", null, copyClipboardItem, saveImageItem, copyURLItem);
  ContextMenu.addMenuGroup('clickOnImage', contextElement);
}

function apply$7() {
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
    let errorCount = 0;

    for (let i = 0; i < checkedElements.length; i += 1) {
      let imagename = replaceData(configureName);
      const {
        url,
        filename: orig
      } = checkedElements[i].parentNode.dataset;
      const ext = url.substring(url.lastIndexOf('.'), url.lastIndexOf('?'));

      try {
        const file = await getBlob(url, e => {
          const progress = Math.round(e.loaded / e.total * 100);
          downloadBtn.textContent = `다운로드 중...${progress}% (${i}/${total})`;
        });
        imagename = imagename.replace('%orig%', orig);
        imagename = imagename.replace('%num%', `${i}`.padStart(3, '0'));
        zip.file(`${imagename}${ext}`, file);
      } catch (error) {
        errorCount += 1;
        console.error(error);
      }
    }

    downloadBtn.textContent = originalText;
    let comment = getValue(ZIP_COMMENT);
    comment = replaceData(comment);
    let filename = getValue(FILENAME);
    filename = replaceData(filename);
    const zipblob = await zip.generateAsync({
      type: 'blob',
      comment
    });
    window.saveAs(zipblob, `${filename}.zip`);

    if (errorCount) {
      alert(`개발자 도구(F12)의 콘솔창의 오류 메세지를 같이 제보 바랍니다.\n사유: 일괄 다운로드 중 오류 발생`);
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
  string = string.replace('%title%', CurrentPage.Article.Title);
  string = string.replace('%category%', CurrentPage.Article.Category);
  string = string.replace('%author%', CurrentPage.Article.Author);
  string = string.replace('%channel%', CurrentPage.Channel.Name);
  string = string.replace('%url%', CurrentPage.Article.URL);
  return string;
}

function parse() {
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
  load: load$b
};

function load$b() {
  try {
    if (CurrentPage.Component.Article) {
      addContextMenu$1();
    }
  } catch (error) {
    console.error(error);
  }
}

function addContextMenu$1() {
  const searchGoogleItem = ContextMenu.createMenu({
    text: 'Google 검색',

    onClick(event) {
      event.preventDefault();
      const url = ContextMenu.getContextData('url');
      window.open(`https://www.google.com/searchbyimage?safe=off&image_url=${url}`);
      ContextMenu.hide();
    }

  });
  const searchYandexItem = ContextMenu.createMenu({
    text: 'Yandex 검색',
    description: '러시아 검색엔진입니다.',

    onClick(event) {
      event.preventDefault();
      const url = ContextMenu.getContextData('url');
      window.open(`https://yandex.com/images/search?rpt=imageview&url=${url}`);
      ContextMenu.hide();
    }

  });
  const searchSauceNaoItem = ContextMenu.createMenu({
    text: 'SauceNao 검색',
    description: '망가, 픽시브 이미지 검색을 지원합니다.',

    async onClick(event) {
      event.preventDefault();
      const itemText = event.target.textContent;

      try {
        const url = ContextMenu.getContextData('url');
        const blob = await getBlob(url, e => {
          const progress = Math.round(e.loaded / e.total * 100);
          event.target.textContent = `${progress}%`;
        }, () => {
          event.target.textContent = '업로드 중...';
        });
        const docParser = new DOMParser();
        const formdata = new FormData();
        formdata.append('file', blob, `image.${blob.type.split('/')[1]}`);
        formdata.append('frame', 1);
        formdata.append('database', 999);
        const result = await new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://saucenao.com/search.php',
            data: formdata,
            onload: resolve,
            onerror: () => {
              reject(new Error('SauceNao 연결 거부 됨'));
            }
          });
        });
        const resultDocument = docParser.parseFromString(result.responseText, 'text/html');
        const searchedImage = resultDocument.querySelector('#yourimage a');
        if (!searchedImage) throw new Error('SauceNao 이미지 업로드 실패');
        const replaceURL = searchedImage.href.split('image=')[1];
        window.open(`https://saucenao.com/search.php?db=999&url=https://saucenao.com/userdata/tmp/${replaceURL}`);
      } catch (error) {
        console.error(error);
        alert(`개발자 도구(F12)의 콘솔창의 오류 메세지를 같이 제보 바랍니다.\n사유: ${error.message}`);
      }

      ContextMenu.hide();
      event.target.textContent = itemText;
    }

  });
  const searchTwigatenItem = ContextMenu.createMenu({
    text: 'TwitGaTen 검색',
    description: '트위터 이미지 검색을 지원합니다.',

    async onClick(event) {
      event.preventDefault();
      const itemText = event.target.textContent;

      try {
        const url = ContextMenu.getContextData('url');
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

      ContextMenu.hide();
      event.target.textContent = itemText;
    }

  });
  const searchAscii2dItem = ContextMenu.createMenu({
    text: 'Ascii2D 검색',
    description: '트위터, 픽시브 이미지 검색을 지원합니다.',

    async onClick(event) {
      event.preventDefault();
      const itemText = event.target.textContent;

      try {
        const url = ContextMenu.getContextData('url');
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

      ContextMenu.hide();
      event.target.textContent = itemText;
    }

  });
  const contextElement = VM.createElement("div", null, searchGoogleItem, searchYandexItem, searchSauceNaoItem, searchTwigatenItem, searchAscii2dItem);
  ContextMenu.addMenuGroup('clickOnImage', contextElement);
}

var css_248z$5 = ".fix-header .root-container {\r\n  padding-top: 42px;\r\n}\r\n.fix-header .navbar-wrapper {\r\n  top: 0px;\r\n  position: fixed !important;\r\n  width: 100%;\r\n  z-index: 20;\r\n}\r\n\r\n.content-wrapper.hide-recent-visit .visited-channel-list {\r\n  display: none;\r\n}\r\n\r\n.content-wrapper.hide-avatar .avatar {\r\n  display: none !important;\r\n}\r\n.content-wrapper.hide-avatar .input-wrapper > .input {\r\n  width: calc(100% - 4.5rem - 0.5rem) !important;\r\n}\r\n\r\n.list-table.hide-notice a.notice {\r\n  display: none !important;\r\n}\r\n.content-wrapper.hide-modified b.modified {\r\n  display: none !important;\r\n}\r\n\r\n.content-wrapper.hide-sidemenu .right-sidebar {\r\n  display: none;\r\n}\r\n\r\n@media screen and (min-width: 991px) {\r\n  .content-wrapper.hide-sidemenu .board-article {\r\n    padding: 1rem;\r\n    margin: 0;\r\n  }\r\n}\r\n";

var LiveModifier = {
  load: load$c
};
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
const HIDE_MODIFIED = {
  key: 'hideModified',
  defaultValue: false
};
const RESIZE_IMAGE = {
  key: 'resizeImage',
  defaultValue: '100'
};
const RESIZE_VIDEO = {
  key: 'resizeVideo',
  defaultValue: '100'
};
const NOTIFY_COLOR = {
  key: 'notificationIconColor',
  defaultValue: ''
};

function load$c() {
  try {
    setupSetting$7();
    apply$8();
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$7() {
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
  const hideModified = VM.createElement("select", null, VM.createElement("option", {
    value: "false"
  }, "\uBCF4\uC784"), VM.createElement("option", {
    value: "true"
  }, "\uC228\uAE40"));
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
  const resizeImage = VM.createElement("input", {
    type: "text"
  });
  const resizeVideo = VM.createElement("input", {
    type: "text"
  });
  addSetting({
    header: '레이아웃 커스텀',
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
      title: '댓글 *수정됨 숨김',
      content: hideModified
    }, {
      title: '본문 이미지 사이즈',
      content: resizeImage
    }, {
      title: '본문 동영상 사이즈',
      content: resizeVideo
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
    valueCallback: {
      save() {
        setValue(HIDE_RECENT_VISIT, hideRecentVisit.value === 'true');
        setValue(HIDE_SIDEMENU, hideSideMenu.value === 'true');
        setValue(HIDE_AVATAR, hideAvatar.value === 'true');
        setValue(HIDE_MODIFIED, hideModified.value === 'true');
        setValue(RESIZE_IMAGE, resizeImage.value);
        setValue(RESIZE_VIDEO, resizeVideo.value);
        setValue(NOTIFY_COLOR, notifyColor.value);
      },

      load() {
        hideRecentVisit.value = getValue(HIDE_RECENT_VISIT);
        hideSideMenu.value = getValue(HIDE_SIDEMENU);
        hideAvatar.value = getValue(HIDE_AVATAR);
        hideModified.value = getValue(HIDE_MODIFIED);
        resizeImage.value = getValue(RESIZE_IMAGE);
        resizeVideo.value = getValue(RESIZE_VIDEO);
        notifyColor.value = getValue(NOTIFY_COLOR);
        notificationIcon.style.color = '#fff';
      }

    }
  });
}

function apply$8() {
  document.head.append(VM.createElement("style", null, css_248z$5));
  const contentWrapper = document.querySelector('.content-wrapper');
  const hideRecentVisit = getValue(HIDE_RECENT_VISIT);
  if (hideRecentVisit) contentWrapper.classList.add('hide-recent-visit');
  const hideSideMenu = getValue(HIDE_SIDEMENU);
  if (hideSideMenu) contentWrapper.classList.add('hide-sidemenu');
  const hideAvatar = getValue(HIDE_AVATAR);
  if (hideAvatar) contentWrapper.classList.add('hide-avatar');
  const hideModified = getValue(HIDE_MODIFIED);
  if (hideModified) contentWrapper.classList.add('hide-modified');
  const resizeImage = getValue(RESIZE_IMAGE);
  const imageCSS = `.article-body  img, .article-body video:not([controls]) {
        max-width: ${resizeImage}% !important;
    }`;
  document.head.append(VM.createElement("style", null, imageCSS));
  const resizeVideo = getValue(RESIZE_VIDEO);
  const videoCSS = `.article-body video[controls] {
        max-width: ${resizeVideo}% !important;
    }`;
  document.head.append(VM.createElement("style", null, videoCSS));
  const color = getValue(NOTIFY_COLOR);
  const notificationIcon = document.querySelector('.navbar-wrapper .noti-menu-link span');
  if (notificationIcon === null) return;
  const notiObserver = new MutationObserver(() => {
    if (notificationIcon.style.color) {
      notificationIcon.style.color = `#${color}`;
    }
  });
  notiObserver.observe(notificationIcon, {
    attributes: true
  });
}

var css_248z$6 = "#refresherSetting #MyImage .grid-wrapper {\r\n  display: grid;\r\n  width: 100%;\r\n  min-height: calc(100px + 1rem + 2px);\r\n  border: 1px solid #bbb;\r\n  padding: 0.5rem;\r\n  grid-template-columns: repeat(auto-fill, minmax(100px, auto));\r\n  gap: 0.5rem;\r\n  justify-items: center;\r\n}\r\n\r\n#refresherSetting #MyImage .grid-item {\r\n  display: inline-block;\r\n  width: 100px;\r\n  height: 100px;\r\n  border: 1px solid #bbb;\r\n  margin: 0;\r\n  background-size: cover;\r\n}\r\n";

var MyImage = {
  load: load$d
};
const MY_IMAGES = {
  key: 'myImages',
  defaultValue: {}
};

async function load$d() {
  try {
    setupSetting$8();

    if (CurrentPage.Component.Article) {
      addContextMenu$2();
    }

    if (CurrentPage.Component.Write) {
      await waitForElement('.fr-box');
      apply$9();
    }
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$8() {
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
  const deleteBtn = VM.createElement("button", {
    className: "btn btn-arca"
  }, "\uC0AD\uC81C");
  deleteBtn.addEventListener('click', event => {
    event.target.disabled = true;
    const removeElements = imgList.querySelectorAll('input[type="checkbox"]:checked');

    for (const element of removeElements) {
      element.closest('div').remove();
    }

    event.target.disabled = false;
  });
  const channel = CurrentPage.Channel.ID;
  addSetting({
    header: '자짤',
    group: [{
      title: '목록 관리',
      description: '더블 클릭으로 모두 선택합니다.',
      content: VM.createElement("div", {
        id: "MyImage"
      }, VM.createElement("style", null, css_248z$6), imgList, deleteBtn),
      type: 'wide'
    }],
    valueCallback: {
      save() {
        const data = getValue(MY_IMAGES);
        const images = Array.from(imgList.children, e => e.children[0].dataset.url);
        data[channel] = images;
        setValue(MY_IMAGES, data);
      },

      load() {
        const data = getValue(MY_IMAGES)[channel];
        if (!data) return;

        while (imgList.firstChild) imgList.lastChild.remove();

        for (const i of data) {
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
      }

    }
  });
}

function addContextMenu$2() {
  const channel = CurrentPage.Channel.ID;
  const addMyImageItem = ContextMenu.createMenu({
    text: '자짤로 등록',

    onClick(event) {
      event.preventDefault();
      const imgList = getValue(MY_IMAGES);

      if (!imgList[channel]) {
        imgList[channel] = [];
      }

      imgList[channel].push(ContextMenu.getContextData('url').split('?')[0]);
      setValue(MY_IMAGES, imgList);
      ContextMenu.hide();
    }

  });
  const contextElement = VM.createElement("div", null, addMyImageItem);
  ContextMenu.addMenuGroup('clickOnImage', contextElement);
}

function apply$9() {
  const channel = CurrentPage.Channel.ID;
  const editor = unsafeWindow.FroalaEditor('#content');

  if (editor.core.isEmpty()) {
    const imgList = getValue(MY_IMAGES)[channel];
    if (!imgList || !imgList.length) return;
    const img = imgList[Math.floor(Math.random() * imgList.length)];
    editor.html.set(`<img src="${img}">`);
    editor.html.insert('<p></p>');
    editor.selection.setAtEnd(editor.$el.get(0));
  }
}

var NewWindow = {
  load: load$e
};
const OPEN_ARTICLE = {
  key: 'openNewWindow',
  defaultValue: false
};
const BLOCK_MEDIA = {
  key: 'blockImageNewWindow',
  defaultValue: false
};

function load$e() {
  try {
    setupSetting$9();

    if (CurrentPage.Component.Board) {
      applyOpenNewWindow();
    }

    if (CurrentPage.Component.Article) {
      applyBlockNewWindow();
    }

    addOnModifyArticle({
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
    valueCallback: {
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
  load: load$f
};
const RATEDOWN_GUARD = {
  key: 'blockRatedown',
  defaultValue: false
};

function load$f() {
  try {
    setupSetting$a();

    if (CurrentPage.Component.Article) {
      apply$a();
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
    valueCallback: {
      save() {
        setValue(RATEDOWN_GUARD, ratedownBlock.value === 'true');
      },

      load() {
        ratedownBlock.value = getValue(RATEDOWN_GUARD);
      }

    }
  });
}

function apply$a() {
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
  load: load$g
};
const USE_SHORTCUT = {
  key: 'useShortcut',
  defaultValue: false
};

function load$g() {
  try {
    setupSetting$b();

    if (CurrentPage.Component.Article) {
      apply$b('article');
    } else if (CurrentPage.Component.Board) {
      apply$b('board');
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
    valueCallback: {
      save() {
        setValue(USE_SHORTCUT, shortCut.value === 'true');
      },

      load() {
        shortCut.value = getValue(USE_SHORTCUT);
      }

    }
  });
}

function apply$b(view) {
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
          active.previousElementSibling.firstChild.click();
        }

        break;
      }

    case 'KeyF':
      {
        event.preventDefault();
        const active = document.querySelector('.pagination .active');

        if (active.nextElementSibling) {
          active.nextElementSibling.firstChild.click();
        }

        break;
      }
  }
}

var css_248z$7 = "#tempArticleWrapper {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n\r\n  background-color: rgba(0, 0, 0, 0.5);\r\n  z-index: 1000;\r\n\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n}\r\n\r\n#tempArticleWrapper table {\r\n  max-width: 400px;\r\n  width: 100%;\r\n  max-height: 400px;\r\n  height: 100%;\r\n\r\n  border: 1px solid #bbb;\r\n  background-color: #fff;\r\n}\r\n\r\n#tempArticleWrapper tbody {\r\n  display: block;\r\n  height: 300px;\r\n  overflow: auto;\r\n}\r\n\r\n#tempArticleWrapper tr {\r\n  display: table;\r\n  width: 100%;\r\n  table-layout: fixed;\r\n}\r\n\r\n#tempArticleWrapper th:nth-child(1),\r\n#tempArticleWrapper td:nth-child(1) {\r\n  width: 10%;\r\n}\r\n#tempArticleWrapper th:nth-child(2),\r\n#tempArticleWrapper td:nth-child(2) {\r\n  width: 65%;\r\n}\r\n#tempArticleWrapper th:nth-child(3),\r\n#tempArticleWrapper td:nth-child(3) {\r\n  width: 25%;\r\n}\r\n\r\n#tempArticleWrapper td:nth-child(3) {\r\n  font-size: 0.83em;\r\n}\r\n";

var TemporaryArticle = {
  load: load$h
};
const TEMPORARY_ARTICLES = {
  key: 'tempArticles',
  defaultValue: {}
};

async function load$h() {
  try {
    await waitForElement('.fr-box');
    apply$c();
  } catch (error) {
    console.error(error);
  }
}

function apply$c() {
  const editor = unsafeWindow.FroalaEditor('#content');
  const tempArticles = getValue(TEMPORARY_ARTICLES);
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
      title.value = tempArticles[id].title;
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

var UserMemo = {
  load: load$i
};
const USER_MEMO = {
  key: 'userMemo',
  defaultValue: {}
};
let handlerApplied = false;

function load$i() {
  try {
    setupSetting$c();
    apply$d();
    addOnModifyArticle({
      priority: 100,
      callback: apply$d
    });
    addOnModifyComment({
      priority: 100,
      callback: apply$d
    });
  } catch (error) {
    console.error(error);
  }
}

function setupSetting$c() {
  const memoList = VM.createElement("select", {
    size: "6",
    multiple: ""
  });
  const deleteBtn = VM.createElement("button", {
    className: "btn btn-arca"
  }, "\uC0AD\uC81C");
  deleteBtn.addEventListener('click', event => {
    event.target.disabled = true;
    const removeElements = memoList.selectedOptions;

    while (removeElements.length > 0) removeElements[0].remove();

    event.target.disabled = false;
  });
  addSetting({
    header: '메모',
    group: [{
      title: '메모 목록',
      description: VM.createElement(VM.Fragment, null, "\uBA54\uBAA8\uB294 \uAC8C\uC2DC\uBB3C \uC791\uC131\uC790, \uB313\uAE00 \uC791\uC131\uC790 \uC544\uC774\uCF58(IP)\uC744 \uD074\uB9AD\uD574 \uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.", VM.createElement("br", null), "Ctrl, Shift, \uB9C8\uC6B0\uC2A4 \uB4DC\uB798\uADF8\uB97C \uC774\uC6A9\uD574\uC11C \uC5EC\uB7EC\uAC1C\uB97C \uB3D9\uC2DC\uC5D0 \uC120\uD0DD \uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
      content: VM.createElement(VM.Fragment, null, memoList, deleteBtn),
      type: 'wide'
    }],
    valueCallback: {
      save() {
        const data = getValue(USER_MEMO);
        const keys = Array.from(memoList.children, e => e.value);

        for (const key in data) {
          if (keys.indexOf(key) === -1) delete data[key];
        }

        setValue(USER_MEMO, data);
      },

      load() {
        const data = getValue(USER_MEMO);

        while (memoList.childElementCount) {
          memoList.removeChild(memoList.children[0]);
        }

        for (const key of Object.keys(data)) {
          memoList.append(VM.createElement("option", {
            value: key
          }, `${key}-${data[key]}`));
        }
      }

    }
  });
}

function apply$d() {
  const users = document.querySelectorAll('span.user-info');
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
  const articleView = document.querySelector('.article-wrapper');
  if (!articleView || handlerApplied) return;
  handlerApplied = true;
  articleView.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    const user = event.target.closest('.user-info');
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
    apply$d();
  });
}

(async function App() {
  await waitForElement('head'); // Load Global CSS

  document.head.append(VM.createElement("style", null, stylesheet$2));
  initialize();
  initilaize();
  await waitForElement('.content-wrapper');
  initialize$1();
  ContextMenu.initialize();
  LiveModifier.load();
  await waitForElement('footer');
  initialize$3();
  AutoRefresher.load();
  CommentRefresh.load();
  AnonymousNick.load();
  ArticleRemover.load();
  CategoryColor.load();
  FullAreaReply.load();
  ImageDownloader.load();
  ImageSearch.load();
  IPScouter.load();
  MuteContent.load();
  MuteEmoticon.load();
  NewWindow.load();
  RatedownGuard.load();
  ShortCut.load();
  UserMemo.load();
  ClipboardUpload.load();
  MyImage.load();
  TemporaryArticle.load();
})();

}());
