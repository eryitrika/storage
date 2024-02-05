    // ==UserScript==
    // @name         아카라이브 깡계 확인 수정본
    // @namespace    Null
    // @version      1.1
    // @description  아카라이브 깡계 확인 스크립트
    // @match        https://arca.live/b/*/*
    // @grant        GM_xmlhttpRequest
    // @downloadURL  https://greasyfork.org/ko/scripts/486695-%EC%95%84%EC%B9%B4%EB%9D%BC%EC%9D%B4%EB%B8%8C-%EA%B9%A1%EA%B3%84-%ED%99%95%EC%9D%B8-%EC%88%98%EC%A0%95%EB%B3%B8
    // @updateURL    https://update.greasyfork.org/scripts/486695/%EC%95%84%EC%B9%B4%EB%9D%BC%EC%9D%B4%EB%B8%8C%20%EA%B9%A1%EA%B3%84%20%ED%99%95%EC%9D%B8%20%EC%88%98%EC%A0%95%EB%B3%B8.user.js
    // ==/UserScript==
    // referenceURL  https://arca.live/b/arknights/98344291
     
    const links = document.querySelectorAll('.info-row .user-info a');
     
    links.forEach((link, index) => {
        const targetURL = link.href;
        console.log(`링크 ${index + 1}의 href:`, targetURL);
     
        GM_xmlhttpRequest({
            method: 'GET',
            url: targetURL,
            onload: function (response) {
                const htmlData = response.responseText;
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlData, 'text/html');
     
                if (doc.querySelectorAll('.error-code').length >= 1) {
                    link.style.fontSize = '14px';
                    link.style.fontWeight = 'bold';
                    link.style.color = 'red';
                    link.style.textDecoration = 'line-through';
                    link.textContent += ' (삭제된 계정)';
                    console.log("삭제된 계정");
                } else {
                    const cardBlockElement = doc.querySelector('.card-block');
                    const childNodes = cardBlockElement.childNodes;
                    var post = 0
                    var coment = 0
                    var flag = 0
                    for (const node of childNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.className == "clearfix") {
                                flag += 1
                            }
                            if (node.className == "user-recent" && flag == 0) {
                                post += 1
                                console.log("게시글");
                            } else if (node.className == "user-recent" && flag == 1) {
                                coment += 1
                                console.log("덧글");
                            }
                        }
                    }
                    if (post <= 5 || coment <= 5) {
                        link.style.fontSize = '14px';
                        link.style.fontWeight = 'bold';
                        link.style.color = 'red';
                        link.textContent += ' (최근 글:' + post + ' 댓글:' + coment + ')';
                    } else if (post <= 10 || coment <= 10) {
                        link.style.fontSize = '14px';
                        link.style.fontWeight = 'bold';
                        link.style.color = 'orange';
                        link.textContent += ' (최근 글:' + post + ' 댓글:' + coment + ')';
                    } else if (post <= 14 || coment <= 14) {
                        link.style.fontSize = '14px';
                        link.style.fontWeight = 'normal';
                        link.style.color = 'green';
                        link.textContent += ' (최근 글:' + post + ' 댓글:' + coment + ')';
                    } else {
                        //firstLink.textContent += ' (최근 글:'+post+' 댓글:'+coment+')';
                    }
                }
     
                // 해당 링크에 대한 처리 완료 후 빈 줄 추가
                console.log();
            }
        });
    });
     
    // 모든 링크에 대한 처리가 끝난 후, 링크를 찾지 못한 경우
    if (links.length === 0) {
        console.log('링크를 찾을 수 없음');
    }
