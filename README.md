# MKG 전적 대시보드

GitHub Pages로 호스팅되는 MKG 킬내기 전적 대시보드입니다.

- 화면: 이 저장소 (`index.html`, `style.css`, `app.js`)
- 데이터·로그인: Google Apps Script 웹앱 (`config.js`의 `MKG_API` 주소)
- 전적·티어·색상은 구글 시트(킬내기 티어표)와 실시간 동기화됩니다.
- 등록된 관리자만 로그인해서 볼 수 있습니다. 최초 계정이 마스터이며, 추가 관리자는 마스터가 직접 만듭니다.

Apps Script를 새로 배포해서 URL이 바뀌면 `config.js`만 수정하면 됩니다.
