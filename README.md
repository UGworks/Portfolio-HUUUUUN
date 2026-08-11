# Portfolio Site

대학원용 포폴사이트

## 로컬 프리뷰

```bash
npm install
```

### 개발 서버 (빠름)

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속  
처음 실행 시 `Re-optimizing dependencies because vite config has changed` 메시지가 나올 수 있으며 정상입니다.  
종료는 `Ctrl + C`

### 배포와 동일한 프리뷰

```bash
npm run build
npm run preview
```

브라우저에서 `http://localhost:4173` 접속

## GitHub에 푸시

```bash
git status
git add .
git commit -m "chore: update"
git push
```

푸시 후 GitHub Actions가 자동으로 배포합니다.


