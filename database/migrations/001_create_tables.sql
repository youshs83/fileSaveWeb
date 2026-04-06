-- fileSaveWeb 데이터베이스 초기 마이그레이션
-- 실행: mysql -h 192.168.253.27 -u root -p fileSaveWeb < 001_create_tables.sql

CREATE DATABASE IF NOT EXISTS fileSaveWeb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fileSaveWeb;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    is_active   TINYINT(1)  NOT NULL DEFAULT 1,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 파일 테이블
CREATE TABLE IF NOT EXISTS files (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    stored_name     VARCHAR(255) NOT NULL,
    file_path       TEXT         NOT NULL,
    file_size       BIGINT       NOT NULL DEFAULT 0,
    mime_type       VARCHAR(100),
    capture_date    DATETIME,
    upload_date     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    folder_path     VARCHAR(500) NOT NULL DEFAULT '/',
    width           INT,
    height          INT,
    is_deleted      TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_upload_date (upload_date),
    INDEX idx_capture_date (capture_date),
    INDEX idx_folder_path (folder_path(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 설정 테이블
CREATE TABLE IF NOT EXISTS settings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
