# 디시콘 다운로더 크롬 확장프로그램

## About

크롬 확장프로그램으로 디시콘을 다운로드 할 수 있습니다.

## Flow

Golang으로 된 프록시 서버를 실행시킨 뒤, 크롬 확장프로그램에서 프록시 서버를 통해 디시콘을 다운로드 합니다. 브라우저를 통해 디시콘에 접근할 경우 CORS 문제가 발생하여 이런 구조로 동작하게끔 하였습니다.

1. 확장프로그램에서 크롤링을 통해 디시콘 이미지들의 URL을 가져옴
2. URL을 프록시 서버에 전달
3. 프록시 서버에서 디시콘 이미지를 다운로드 (header { Referer: https://gall.dcinside.com })
4. 다운로드 받은 이미지를 base64로 인코딩 및 반환
5. 확장프로그램에서 base64 문자열을 Uint8Array로 변환
6. 파일 시그니처를 이용해 확장자 추출
7. JSZip을 이용해 압축 파일 생성 및 다운로드

## TODO

- 프록시 서버를 WASM으로 컴파일한 것을 확장프로그램 내에서 실행 및 적용시킬 수 있는지 확인
- 프록시 서버에서 multipart/form-data 형식으로 요청을 받아 처리할 수 있는지 확인
- 파일 시그니처를 base64 문자열로부터 추출

## Stack

- Svelte
- TypeScript
- Tailwind CSS
- Yarn
- Golang
- WASM (WIP)

## Usage

```bash
yarn install
yarn build
# 생성된 dist 폴더를 크롬 확장프로그램에서 import

cd proxy-server
go run main.go
```

[![dccon-downloader](http://img.youtube.com/vi/MakqEhwcWzg/0.jpg)](https://youtu.be/MakqEhwcWzg)
