-- Chạy khi volume Postgres trống (docker-entrypoint-initdb.d).
-- Bản alpine đôi khi thiếu extension; image Debian + dòng này đảm bảo search có unaccent.
CREATE EXTENSION IF NOT EXISTS unaccent;
