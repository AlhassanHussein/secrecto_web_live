# Optional SQLite utility container; mostly for local debugging/inspection.
FROM alpine:3.19
RUN apk add --no-cache sqlite
WORKDIR /data
COPY sqlite/saytruth.db /data/saytruth.db
VOLUME ["/data"]
CMD ["sqlite3", "/data/saytruth.db"]
