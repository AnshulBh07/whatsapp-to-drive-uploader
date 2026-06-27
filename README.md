# Pharmacy Prescription Archiver

A headless Node.js service that automatically archives prescription images and documents sent to a designated WhatsApp group into a structured Google Drive archive.

---

## Overview

This project continuously listens to a specific WhatsApp group using Baileys and automatically uploads every prescription image or document to Google Drive.

The goal is to eliminate manual organization while maintaining a clean archive grouped by date.

Example Google Drive structure:

```
Prescription Archive/
└── 2026/
    └── 06/
        ├── 25/
        │   ├── 09-12-43.jpg
        │   ├── 11-30-01.jpg
        │   └── Prescription.pdf
        │
        └── 26/
            ├── 08-14-51.jpg
            └── IMG_0005.jpg
```

---

# Features

## WhatsApp Integration

- Headless WhatsApp client using Baileys
- QR authentication (one-time setup)
- Automatic reconnection
- Listen only to a configured WhatsApp group
- Ignore all other chats

## Media Processing

- Detect incoming media
- Support:
  - Images
  - PDFs
  - Documents

- Download media
- Preserve file extension
- Generate timestamped filenames when necessary

## Google Drive Integration

- Automatically create folders

```
Year
    Month
        Day
```

- Upload every file immediately
- Skip duplicate uploads
- Retry failed uploads

## Logging

Log every processed file.

Example:

```
[INFO]
2026-06-26 14:32:15

Received:
IMG-20260626-WA0012.jpg

Uploaded:
Prescription Archive/2026/06/26/
```

---

# Architecture

```
                WhatsApp Group
                      │
                      ▼
                 Baileys Client
                      │
                      ▼
              Message Event Handler
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
   Media Downloader           Ignore Message
        │
        ▼
 Archive Service
        │
        ▼
 Google Drive Storage
        │
        ▼
Prescription Archive
```

---

# Project Structure

```
src/

    whatsapp/
        client.ts
        events.ts
        media.ts

    archive/
        archive.service.ts

    drive/
        drive.client.ts
        drive.service.ts

    storage/
        googleDrive.storage.ts

    utils/
        logger.ts
        date.ts

    config/

    index.ts
```

---

# Roadmap

## Phase 1

- Connect to WhatsApp
- Authenticate
- Listen to one group
- Detect new media

## Phase 2

- Download media
- Save locally
- Validate file types

## Phase 3

- Google Drive integration
- Automatic folder creation
- Upload media

## Phase 4

- Retry uploads
- Duplicate detection
- Logging

## Phase 5

Optional enhancements

- OCR extraction
- Doctor identification
- Medicine indexing
- Search dashboard
- Analytics

---

# Configuration

The application should be configurable using environment variables.

Example:

```
GOOGLE_DRIVE_ROOT_FOLDER=

TARGET_GROUP_ID=

DOWNLOAD_TEMP_DIR=

LOG_LEVEL=
```

---

# Deployment

Designed to run continuously on:

- Oracle Cloud Free Tier
- Ubuntu Server
- PM2

The service automatically reconnects after restarts and resumes processing without manual intervention.

---

# Design Goals

- Fully automated
- Headless operation
- Low memory usage
- Modular architecture
- Fault tolerant
- Easily extensible
- Production-ready
