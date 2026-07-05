@echo off

echo [1/3] Dang cap nhat phien ban cache-busting trong index.html...
node scratch/deploy.js
if %errorlevel% neq 0 (
    echo.
    echo [LOI] Khong the cap nhat index.html.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Dang tu dong Commit cac thay doi...
git add .
git commit -m "Auto-deploy: Cap nhat giao dien & Cache-busting"

echo.
echo [3/3] Dang Push len GitHub...
git push origin main
set EXIT_CODE=%errorlevel%

if %EXIT_CODE% neq 0 (
    echo.
    echo [LOI] Push len GitHub that bai voi ma loi %EXIT_CODE%.
) else (
    echo.
    echo [THANH CONG] Da cap nhat phien ban va push len GitHub thanh cong!
    echo Trinh duyet cua ban va khach moi se tu dong tai ban moi nhat khi load lai.
)
echo.
pause
