// ==UserScript==
// @name         아카라이브 깡계확인
// @namespace    http://kemomimi.com/
// @version      1.0
// @description  깡계확인 스크립트 - 일부 어레인지
// @match        https://arca.live/b/*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==
// Source https://raw.githubusercontent.com/AXfYVzWUQ5Cd/LM7R95774Ef9/main/ArcaliveNewbieAccount.js
// 원출처 https://greasyfork.org/en/scripts/470279-%EC%95%84%EC%B9%B4%EB%9D%BC%EC%9D%B4%EB%B8%8C-%EA%B9%A1%EA%B3%84%ED%99%95%EC%9D%B8
// 참고글 https://arca.live/b/arcalivebreverse/90757426

const firstLink = document.querySelector('.info-row .user-info a');
if (firstLink) {
    const targetURL = firstLink.href;
    console.log('첫 번째 링크의 href:', targetURL);
    // GET 요청 보내기
    GM_xmlhttpRequest({
        method: 'GET',
        url: targetURL,
        onload: function(response) {
            const htmlData = response.responseText;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlData, 'text/html');
            if(doc.querySelectorAll('.error-code').length >=1){
                firstLink.style.fontSize = '15px';
                firstLink.style.fontWeight = 'bold';
                firstLink.style.color = 'orange';
                firstLink.style.textDecoration = 'line-through';
                firstLink.textContent += ' (삭제된 계정)';
                console.log("삭제된 계정");
            }else{
                const cardBlockElement = doc.querySelector('.card-block');
                const childNodes = cardBlockElement.childNodes;
                var post = 0
                var coment = 0
                var flag = 0
                for (const node of childNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if(node.className == "clearfix"){
                            flag+=1
                        }
                        if(node.className== "user-recent" && flag==0){
                            post+=1
                            console.log("게시글");
                        }else if(node.className== "user-recent" && flag==1){
                            coment+=1
                            console.log("덧글");
                        }
                    }
                }
                if(post<=14 || coment<=14){
                    firstLink.style.fontSize = '15px';
                    firstLink.style.fontWeight = 'bold';
                    firstLink.style.color = 'orange';
                    firstLink.textContent += ' (글:'+post+' 댓글:'+coment+')';
                }else{
                    //firstLink.textContent += ' (글:'+post+' 댓글:'+coment+')';
                }
            }
        }
    });
} else {
    console.log('링크를 찾을 수 없음');
}
