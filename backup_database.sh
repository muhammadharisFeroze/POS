#!/bin/bash

# POS Database Backup Script
# This script creates automatic backups of the pos_db PostgreSQL database

# Configuration
DB_NAME="pos_db"
DB_USER="posuser"
DB_HOST="172.20.2.68"
BACKUP_BASE_DIR="/root/pos-app/backups"
DATE_DIR=$(date +"%Y-%m-%d")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_BASE_DIR}/${DATE_DIR}"
BACKUP_FILE="${BACKUP_DIR}/pos_db_backup_${TIMESTAMP}.sql"
LOG_FILE="${BACKUP_BASE_DIR}/backup.log"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Log start time
echo "[$(date)] Starting backup..." >> ${LOG_FILE}

# Create backup using pg_dump
PGPASSWORD="Feroze@1888" pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -F c -f ${BACKUP_FILE}

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}" >> ${LOG_FILE}
    
    # Compress the backup
    gzip ${BACKUP_FILE}
    echo "[$(date)] Backup compressed: ${BACKUP_FILE}.gz" >> ${LOG_FILE}
    
    # Delete backups older than 60 days
    find ${BACKUP_BASE_DIR} -name "pos_db_backup_*.sql.gz" -mtime +60 -delete
    # Delete empty date folders older than 60 days
    find ${BACKUP_BASE_DIR} -type d -empty -mtime +60 -delete
    echo "[$(date)] Old backups cleaned (keeping last 60 days)" >> ${LOG_FILE}
else
    echo "[$(date)] ERROR: Backup failed!" >> ${LOG_FILE}
    exit 1
fi

echo "[$(date)] Backup process completed" >> ${LOG_FILE}
echo "-----------------------------------" >> ${LOG_FILE}
