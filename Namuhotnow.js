    // ==UserScript==
    // @name         Namu Hot Now
    // @name:ko      나무위키 실검 알려주는 스크립트
    // @namespace    https://arca.live/b/namuhotnow
    // @version      0.6.2
    // @description  이게 왜 실검?
    // @author       KEMOMIMI
    // @match        https://namu.wiki/*
    // @match        https://arca.live/
    // @match        https://arca.live/e/*
    // @match        https://arca.live/u/*
    // @match        https://arca.live/settings/*
    // @connect      arca.live
    // @icon         https://www.google.com/s2/favicons?sz=64&domain=namu.wiki
    // @grant        GM_xmlhttpRequest
    // ==/UserScript==
     
    function findLinkByPartialMatch(pairs, searchString) {
        for (var i = 0; i < pairs.length; i++) {
            if (pairs[i].text.toLowerCase() === searchString.toLowerCase()) {
                return pairs[i].link;
            }
        }
        return null;
    }
     
    function getSpansContent() {
        var spansContent = [];
        var spans = document.querySelectorAll('#app ol span');
        spans.forEach(function(span) {
            spansContent.push(span.textContent);
        });
        return spansContent.join('').trim();
    }
     
    const targetURL = 'https://arca.live/b/namuhotnow';
    var linkElements = [];
    var pairs = [];
    var previousSpansContent = "";
    var storedElements = [];
     
    function removeLinkElements() {
        for (var i = 0; i < linkElements.length; i++) {
            var linkElement = linkElements[i];
            linkElement.parentNode.removeChild(linkElement);
        }
        linkElements = [];
    }
     
    function checkMobileHotkeword(){
        var chk = setInterval(function() {
     
            const appElement = document.querySelector('#app form div > div');
            if (!appElement) {
                var whyHotElements = document.querySelectorAll('.whyHot');
                whyHotElements.forEach(function(element) {
     
                    element.remove();
                });
                const elementsWithParentClass = document.querySelectorAll('.namuHotParentClass');
                elementsWithParentClass.forEach(parentElement => {
                    const childAElement = parentElement.querySelector('a');
                    if (childAElement) {
                        parentElement.parentNode.insertBefore(childAElement, parentElement.nextSibling);
                        parentElement.remove();
                    }
                });
            }else{
                if (document.querySelector('#app form div>div').textContent.trim() === '실시간 검색어') {
                    const elementsWithParentClass = document.querySelectorAll('.namuHotParentClass');
                    let count = 0;
                    elementsWithParentClass.forEach(parentElement => {
                        const childAnchorElements = parentElement.querySelectorAll('a');
                        childAnchorElements.forEach(anchorElement => {
                            if (anchorElement.getAttribute('href') === '#') {
                                count++;
                            }
                        });
                    });
     
                    if (count == 0) {
                        const elementsWithParentClass = document.querySelectorAll('.namuHotParentClass');
                        elementsWithParentClass.forEach(function(element) {
                            element.remove();
                        });
                    }
                    if (elementsWithParentClass.length == 0) {
                        clearInterval(chk);
                        refreshLink(2);
                    }
                }
            }
        }, 100);
     
     
    }
    function refreshLink(type) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: targetURL,
            onload: function(response) {
                const htmlData = response.responseText;
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlData, 'text/html');
                var elements = doc.querySelectorAll('.article-list .list-table a:not(.notice)');
                storedElements = Array.from(elements);
                elements.forEach(function(element) {
                    var link = element.getAttribute('href');
                    var titleElement = element.querySelector('.title');
                    var text = titleElement ? titleElement.innerText.trim() : '';
                    pairs.push({text: text, link: link});
                    if (text.includes(',')) {
                        var textArray = text.split(',').map(function(item) {
                            return item.trim();
                        });
     
                        textArray.forEach(function(subText) {
                            pairs.push({ text: subText, link: link });
                        });
                    }
                    if (text.includes(' ')) {
                        textArray = text.split(' ').map(function(item) {
                            return item.trim();
                        });
     
                        textArray.forEach(function(subText) {
                            pairs.push({ text: subText, link: link });
                        });
                    }
                    if (text.includes('(')) {
                        var removeParenthesis = text.replace(/\s*\([^)]*\)$/, '');
                        pairs.push({ text: removeParenthesis.trim(), link: link });
                    }
                });
                if(type == 0){
                    var spans = document.querySelectorAll('#app span');
                    spans.forEach(function (span) {
                        if (span.textContent.includes('실시간 검색어')) {
                            var parentDiv = span.parentElement.parentElement;
                            var realtimeList = parentDiv.querySelectorAll('li');
                            realtimeList.forEach(function(element) {
     
                                var titleElement = element.querySelector('span');
                                var resultLink = findLinkByPartialMatch(pairs, titleElement.innerText.trim());
                                if (resultLink != null){
                                    var linkElement = document.createElement('a');
                                    linkElement.href = 'https://arca.live' + resultLink;
                                    linkElement.textContent = '이왜실?';
                                    linkElement.display = 'flex'
                                    linkElement.width = '40%'
                                    linkElement.target="_blank"
                                    element.querySelector('a').style.width = "60%";
                                    element.appendChild(linkElement);
                                    linkElements.push(linkElement);
                                }
                            });
                        }
                    });
                }else if(type == 1){
                    var firstLinkList = document.querySelector('aside .link-list');
                    var arcalinkElements = firstLinkList.querySelectorAll('a');
                    var titleArray = [];
                    arcalinkElements.forEach(function(aLinkElement) {
     
                        var resultLink = findLinkByPartialMatch(pairs, aLinkElement.getAttribute('title'));
     
                        if(resultLink != null){
                            aLinkElement.style.paddingRight = "1em";
                            var newSpanHTML = `
    <div style="padding:.15rem .5rem .15rem 0; user-select: auto;">
    <span class="leaf-info float-right" title="${aLinkElement.getAttribute('title')} 왜 실검?" style="margin:0; user-select: auto;"><time style="user-select: auto;"><a href="${resultLink}" target="_blank" style="font-size: 1em; padding-Right: 0; user-select: auto;">이왜실?</a></time></span>
    <a href="//namu.wiki/Go?q=${aLinkElement.getAttribute('title')}" target="_blank" title="${aLinkElement.getAttribute('title')}" style="padding:.15rem 1.5rem .15rem 0; user-select: auto;">${aLinkElement.getAttribute('title')}</a>
    </div>
    `;
                            aLinkElement.insertAdjacentHTML('beforebegin', newSpanHTML);
                            aLinkElement.remove()
     
                        }
                    });
                }else if(type == 2){
                    var namuHotParentClass = document.querySelectorAll('.namuHotParentClass');
                    if (!namuHotParentClass[0]) {
                        var realtimeMobile = document.querySelector('#app form div>div');
                        var mobileParentDiv = realtimeMobile.parentElement;
                        var mobileList = mobileParentDiv.querySelectorAll('a');
     
                        mobileList.forEach(function(element) {
                            var resultLink = findLinkByPartialMatch(pairs, element.innerText.trim());
                            var newParent = document.createElement('span');
                            newParent.classList.add('namuHotParentClass');
     
                            if (resultLink != null){
     
                                var linkElement = document.createElement('a');
                                linkElement.href = 'https://arca.live' + resultLink;
                                linkElement.textContent = '이왜실?';
                                linkElement.width = '20px'
                                linkElement.target="_blank"
                                linkElement.classList.add('whyHot');
                                element.style.width = "70%";
     
                                var beforePseudoElement = window.getComputedStyle(element, ':before');
                                element.parentNode.insertBefore(newParent, element);
                                newParent.appendChild(element);
                                newParent.appendChild(linkElement);
                                newParent.style.display = 'flex';
                                linkElements.push(linkElement);
                            }else{
                                element.parentNode.insertBefore(newParent, element);
                                newParent.appendChild(element);
                                element.style.width = "100%";
                                newParent.style.display = 'flex';
                            }
                        });
                        checkMobileHotkeword();
                    }
                }
     
            }
        });
    }
     
     
    function hasRealTimeKeyword() {
        const spans = document.querySelectorAll('#app div > div > span');
     
        for (const span of spans) {
            if (span.textContent.trim() === '실시간 검색어') {
                return true;
            }
        }
        return false;
    }
     
     
    function appendStyle(){
        var style = document.createElement('style');
        var css = `
    .namuHotParentClass:nth-of-type(1) > a:nth-child(1):before {
        content: "1." !important;
    }
    .namuHotParentClass:nth-of-type(2) > a:nth-child(1):before {
        content: "2." !important;
    }
    .namuHotParentClass:nth-of-type(3) > a:nth-child(1):before {
        content: "3." !important;
    }
    .namuHotParentClass:nth-of-type(4) > a:nth-child(1):before {
        content: "4." !important;
    }
    .namuHotParentClass:nth-of-type(5) > a:nth-child(1):before {
        content: "5." !important;
    }
    .namuHotParentClass:nth-of-type(6) > a:nth-child(1):before {
        content: "6." !important;
    }
    .namuHotParentClass:nth-of-type(7) > a:nth-child(1):before {
        content: "7." !important;
    }
    .namuHotParentClass:nth-of-type(8) > a:nth-child(1):before {
        content: "8." !important;
    }
    .namuHotParentClass:nth-of-type(9) > a:nth-child(1):before {
        content: "9." !important;
    }
    .namuHotParentClass:nth-of-type(10) > a:nth-child(1):before {
        content: "10." !important;
    }
    .whyHot {
        align-items: center;
        border: 1px solid transparent;
        border-radius: var(--nav-bar-child-radius-var);
        display: flex;
        padding: var(--search-box-suggest-item-gutter-y-var) var(--search-box-suggest-item-gutter-x-var);
        text-decoration: none;
        word-break: break-all;
    }
    `;
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
     
    if (window.location.href.includes('namu.wiki')) {
        if(hasRealTimeKeyword()){
            setInterval(function() {
                var content = getSpansContent();
                if (content.length > 0 && previousSpansContent !== getSpansContent()) {
                    previousSpansContent = getSpansContent();
                    removeLinkElements();
                    refreshLink(0);
                }
            }, 100);
        }else{
            var interNamuMobile = setInterval(function() {
                var firstLinkLista = document.querySelector('#app form div > div');
                if (firstLinkLista) {
                    if (firstLinkLista.textContent.trim() === '실시간 검색어') {
                        clearInterval(interNamuMobile);
                        appendStyle();
                        refreshLink(2);
                    }
                }
            }, 50);
        }
    }
     
     
     
    if (window.location.href.includes('arca.live')) {
        var intervalId = setInterval(function() {
            var firstLinkLista = document.querySelector('aside .link-list a');
            if (firstLinkLista && firstLinkLista.innerHTML !== "&nbsp;") {
                clearInterval(intervalId);
                refreshLink(1);
            }
        }, 50);
    }
