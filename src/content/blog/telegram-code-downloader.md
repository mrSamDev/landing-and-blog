---
title: How I Supercharged My Telegram RAW Photo Downloader With Batch Processing
excerpt: A deep dive into building a parallel file downloader for Telegram, what I learned about batch processing, and how a simple task turned into a lesson on API optimization.
publishDate: 'Mar 09 2025'
tags:
  - JavaScript
  - Node.js
  - Telegram API
  - Performance
  - Concurrency
isFeatured: true
seo:
  image:
    src: 'https://res.cloudinary.com/example/image/upload/v1/Blog/telegram-downloader'
    alt: 'JavaScript code showing parallel download implementation'
---

You know that feeling when you finally get around to fixing something that's been annoying you? That's what happened when I needed to download a bunch of Sony ARW files from a Telegram chat. I knew the solution all along, but finally took the time to implement it.

## The Original Script: Getting the Job Done (Slowly)

First, let me show you where I started - a functional but inefficient approach:

```javascript
async function downloadARWFilesFromChat(chatName, downloadLimit = 100) {
  try {
    // Find the specific chat
    const chat = await this.findChat(chatName);

    // Create downloads directory
    const downloadDir = path.join(__dirname, 'telegram_arw_downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // Fetch messages
    const messages = await this.client.getMessages(chat, {
      limit: downloadLimit
    });

    // Download ARW files
    const downloadedFiles = [];
    for (const message of messages) {
      try {
        // Check if message has document/file media
        if (message.media && message.media.document) {
          const document = message.media.document;

          // Check if the file name matches the DS***.ARW pattern
          const attributes = document.attributes || [];
          const fileNameAttr = attributes.find((attr) => attr.fileName);

          if (fileNameAttr && fileNameAttr.fileName.match(/DS.*\.ARW$/i)) {
            const fileName = fileNameAttr.fileName;
            const downloadPath = path.join(downloadDir, fileName);

            await this.client.downloadMedia(message, {
              outputFile: downloadPath
            });

            downloadedFiles.push({
              path: downloadPath,
              name: fileName,
              timestamp: Date.now()
            });

            console.log(`Downloaded: ${fileName}`);
          }
        }
      } catch (downloadError) {
        console.error('Error downloading individual file:', downloadError);
      }
    }

    console.log(`Total ARW files downloaded from "${chatName}": ${downloadedFiles.length}`);
    return downloadedFiles;
  } catch (error) {
    console.error('Error downloading files:', error);
    throw error;
  }
}
```

It worked! But it was painfully slow. I was downloading 50MB+ RAW files one at a time, waiting for each to complete before starting the next. After waiting what felt like forever for a batch of photos to download, I knew there had to be a better way.

## Making It Faster

I always knew I could parallelize the downloads to make it faster. I had just been too lazy to implement it since the slow version was working well enough.

When I finally got tired of waiting, I checked the Telegram client library documentation to confirm multiple simultaneous downloads would work. Then I wrote the parallel version I'd been putting off.

## The Parallel Processing Upgrade

Here's the improved version I came up with:

```javascript
// Helper function to process downloads in batches
async processBatch(tasks) {
  return Promise.all(tasks.map(task => task()));
}

// Check if file already exists
fileExists(filePath) {
  return fs.existsSync(filePath);
}

async downloadARWFilesFromChat(chatName, downloadLimit = 100) {
  try {
    // Find the specific chat
    const chat = await this.findChat(chatName);

    // Create downloads directory
    const downloadDir = path.join(__dirname, "telegram_arw_downloads");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // Fetch messages
    const messages = await this.client.getMessages(chat, {
      limit: downloadLimit,
    });

    // Prepare download tasks
    const downloadTasks = [];
    const skippedFiles = [];
    const downloadedFiles = [];

    for (const message of messages) {
      // Check if message has document/file media
      if (message.media && message.media.document) {
        const document = message.media.document;

        // Check if the file name matches the DS***.ARW pattern
        const attributes = document.attributes || [];
        const fileNameAttr = attributes.find((attr) => attr.fileName);

        if (fileNameAttr && fileNameAttr.fileName.match(/DS.*\.ARW$/i)) {
          const fileName = fileNameAttr.fileName;
          const downloadPath = path.join(downloadDir, fileName);

          // Skip if the file already exists
          if (this.fileExists(downloadPath)) {
            skippedFiles.push({
              name: fileName,
              path: downloadPath,
              reason: "already exists"
            });
            continue;
          }

          // Create a download task
          downloadTasks.push(async () => {
            try {
              await this.client.downloadMedia(message, {
                outputFile: downloadPath,
              });

              const fileInfo = {
                path: downloadPath,
                name: fileName,
                timestamp: Date.now(),
              };

              console.log(`Downloaded: ${fileName}`);
              return fileInfo;
            } catch (downloadError) {
              console.error(`Error downloading ${fileName}:`, downloadError.message);
              return null;
            }
          });
        }
      }
    }

    // Process downloads in parallel batches
    if (downloadTasks.length > 0) {
      console.log(`Found ${downloadTasks.length} ARW files to download`);
      console.log(`Skipping ${skippedFiles.length} already existing files`);

      // Process in batches based on concurrency limit
      for (let i = 0; i < downloadTasks.length; i += this.concurrencyLimit) {
        const batch = downloadTasks.slice(i, i + this.concurrencyLimit);
        console.log(`Processing batch ${Math.floor(i/this.concurrencyLimit) + 1}/${Math.ceil(downloadTasks.length/this.concurrencyLimit)}`);

        const results = await this.processBatch(batch);
        downloadedFiles.push(...results.filter(result => result !== null));
      }
    } else {
      console.log("No new ARW files to download");
    }

    console.log(`Download summary for "${chatName}":`);
    console.log(`- Total files processed: ${downloadTasks.length + skippedFiles.length}`);
    console.log(`- Files downloaded: ${downloadedFiles.length}`);
    console.log(`- Files skipped: ${skippedFiles.length}`);

    return {
      downloaded: downloadedFiles,
      skipped: skippedFiles
    };
  } catch (error) {
    console.error("Error downloading files:", error);
    throw error;
  }
}
```

## How It Works

Instead of downloading files one after another, my new approach:

1. Gathers all the download operations first without executing them
2. Checks which files already exist to avoid redundant downloads
3. Groups the downloads into batches (I set a concurrency limit of 10)
4. Runs each batch in parallel using Promise.all()
5. Moves to the next batch only after the current one completes

The first time I ran this new version, I was surprised by how much faster it was. I should have implemented it sooner instead of sticking with the "if it ain't broken, why fix it" approach. The parallel downloads were definitely worth the small effort to implement.

## Finding the Sweet Spot

After some testing, I learned that concurrency isn't free. When I tried pushing to 20 or 30 parallel downloads, I started seeing errors:

- Telegram's API began throwing rate limit errors
- My network connection became saturated

Through trial and error over several photo batches, I found that 8-10 concurrent downloads gave me the best performance without errors. This was my personal sweet spot, though yours might differ based on your connection, computer, and how aggressively Telegram rate-limits your account.

## Real-World Results

What was previously a frustratingly long wait became much more reasonable. The larger the batch of files, the more dramatic the improvement, since the sequential approach's inefficiency becomes more obvious as the number of files increases.

## Final Thoughts

I was also reminded how satisfying it is to finally implement something I've been putting off.

I briefly considered turning this into a simple npm module to help others download files from Telegram chats, but honestly, there are probably better implementations already out there by more creative developers. This was just a quick solution for my specific needs.

I'm thinking of maybe automating the entire process of integrating Google Photos API and download and upload, or I just open Google Photos and sync the folder. Google takes care of the rest.

The full code is available in my GitHub repo: [telegram-batch-downloader](https://github.com/mrSamDev/telegram-batch-downloader) if you want to check it out or adapt it for your own use.
