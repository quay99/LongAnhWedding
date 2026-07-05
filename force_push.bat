@echo off
echo Dang reset code local ve commit adda675...
"C:\Users\Long\AppData\Local\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe" reset --hard adda675294a19dc3deb268de58bd1c6c53ef3929
echo.
echo Dang force push de xoa 2 commit tren GitHub...
"C:\Users\Long\AppData\Local\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe" push origin main --force > force_push_log.txt 2>&1
set EXIT_CODE=%errorlevel%
type force_push_log.txt
if %EXIT_CODE% neq 0 (
    echo.
    echo [LOI] Force push that bai voi ma loi %EXIT_CODE%.
) else (
    echo.
    echo [THANH CONG] Da xoa 2 commit tren GitHub va reset local!
)
echo.
pause
