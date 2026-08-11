# Docker 배포 문제 해결 가이드

## 오류: "failed to read dockerfile: open Dockerfile: no such file or directory"

이 오류는 NAS에 파일이 제대로 업로드되지 않았거나, 경로가 잘못되었을 때 발생합니다.

### 해결 방법

#### 1단계: 파일 확인

NAS에 SSH 접속하여 파일이 있는지 확인:

```bash
# NAS에 SSH 접속
ssh admin@your-nas-ip

# 프로젝트 폴더로 이동
cd /volume1/docker/portfolio-site

# 필수 파일 확인
ls -la

# 다음 파일들이 있어야 합니다:
# - Dockerfile
# - docker-compose.yml
# - nginx.conf
# - package.json
# - src/ 폴더
```

#### 2단계: 파일이 없다면 다시 업로드

**방법 A: File Station 사용**

1. File Station에서 `/volume1/docker/portfolio-site` 폴더 확인
2. 다음 파일들이 있는지 확인:
   - `Dockerfile`
   - `docker-compose.yml`
   - `nginx.conf`
   - `.dockerignore`
   - `package.json`
   - `package-lock.json` (있다면)
   - `vite.config.ts`
   - `tsconfig.json`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `index.html`
   - `src/` 폴더 전체

3. 없는 파일이 있다면 다시 업로드

**방법 B: SCP로 전체 폴더 업로드**

로컬 컴퓨터에서 실행:

```bash
# Windows PowerShell에서
scp -r "D:\대학원준비\PORTFOLIO SITE\*" admin@your-nas-ip:/volume1/docker/portfolio-site/
```

#### 3단계: 파일 권한 확인

```bash
# SSH 접속 후
cd /volume1/docker/portfolio-site

# 파일 권한 확인
ls -la Dockerfile
ls -la docker-compose.yml

# 권한이 없다면 수정
chmod 644 Dockerfile
chmod 644 docker-compose.yml
chmod 644 nginx.conf
```

#### 4단계: Docker Compose 재실행

```bash
# 기존 컨테이너 정리
sudo docker-compose down

# 다시 빌드 및 실행
sudo docker-compose up -d --build
```

## 오류: "version is obsolete"

최신 Docker Compose에서는 `version` 필드가 필요 없습니다. 이미 수정되었습니다.

## 파일 구조 확인 스크립트

NAS에서 다음 명령어로 필수 파일 확인:

```bash
cd /volume1/docker/portfolio-site

echo "=== 필수 파일 확인 ==="
[ -f Dockerfile ] && echo "✓ Dockerfile" || echo "✗ Dockerfile 없음"
[ -f docker-compose.yml ] && echo "✓ docker-compose.yml" || echo "✗ docker-compose.yml 없음"
[ -f nginx.conf ] && echo "✓ nginx.conf" || echo "✗ nginx.conf 없음"
[ -f package.json ] && echo "✓ package.json" || echo "✗ package.json 없음"
[ -d src ] && echo "✓ src/ 폴더" || echo "✗ src/ 폴더 없음"
[ -f index.html ] && echo "✓ index.html" || echo "✗ index.html 없음"
```

## 빠른 재배포 방법

모든 파일을 다시 업로드하고 싶다면:

```bash
# 1. 기존 컨테이너 및 이미지 삭제
sudo docker-compose down
sudo docker rmi portfolio-site 2>/dev/null

# 2. 파일 확인 후 재빌드
sudo docker-compose up -d --build
```
