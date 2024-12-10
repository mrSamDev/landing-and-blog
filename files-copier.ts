import type { AstroIntegration } from 'astro';
import { readdir, cp, mkdir } from 'node:fs/promises';
import * as path from 'node:path';

export function Copier(): AstroIntegration {
    return {
        name: 'sitemap-copier',
        hooks: {
            'astro:build:done': async ({ logger }) => {
                const buildLogger = logger.fork('sitemap-copier');

                try {
                    const vercelOutputPath = './.vercel/output/static';
                    await mkdir(vercelOutputPath, { recursive: true });
                    buildLogger.info('Copying sitemap files from dist to Vercel output');
                    const files = await readdir('./dist');
                    const xmlFiles = files.filter(
                        (file) => path.extname(file).toLowerCase() === '.xml' && path.basename(file).toLowerCase().startsWith('sitemap')
                    );

                    if (xmlFiles.length === 0) {
                        buildLogger.warn('No sitemap XML files found in dist directory');
                    } else {
                        buildLogger.info(`Found sitemap files: ${xmlFiles.join(', ')}`);

                        for (const file of xmlFiles) {
                            const sourcePath = path.join('./dist', file);
                            const destPath = path.join(vercelOutputPath, file);
                            await cp(sourcePath, destPath);
                            buildLogger.info(`Copied ${file} to Vercel output`);
                        }
                    }

                    buildLogger.info('Copying Partytown files');
                    const partytownSource = path.join('./dist', '~partytown');
                    const partytownDest = path.join(vercelOutputPath, '~partytown');

                    try {
                        await cp(partytownSource, partytownDest, { recursive: true });
                        buildLogger.info('Partytown files copied successfully');
                    } catch {
                        buildLogger.warn('No Partytown directory found, skipping');
                    }

                    buildLogger.info('File copying completed successfully');
                } catch (error) {
                    buildLogger.error('Error during file copying');
                }
            }
        }
    };
}
