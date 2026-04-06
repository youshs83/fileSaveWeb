-- 초기 데이터 (관리자 계정: admin / admin123)
-- 비밀번호는 bcrypt 해시값 (실제 서버 기동 시 /api/auth/register 로 생성 권장)
USE fileSaveWeb;

-- 아래 해시는 bcrypt 5.x 로 생성한 'admin123' 해시값
-- 실서비스 배포 전 /api/auth/register 로 재생성 권장
INSERT INTO users (username, password, display_name)
VALUES ('admin', '$2b$12$/IUEsuflwQxjum8e7jv.hOUVNHriU4E4bsdrVVQybki2ff/MpNWey', '관리자')
ON DUPLICATE KEY UPDATE password = VALUES(password);

INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES
('upload_path', 'D:/bigeye_workspace/fileSaveWeb/uploads', '파일 업로드 기본 경로'),
('preview_count', '12', '메인화면 최근 사진 미리보기 개수');
