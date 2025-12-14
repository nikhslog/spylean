const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFolder = './images';
const outputFolder = './images-optimized';

// Create output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

// Get all files from images folder
const files = fs.readdirSync(inputFolder);

let processed = 0;
const total = files.length;

console.log(`Found ${total} files to process...\n`);

files.forEach(async (file) => {
    const inputPath = path.join(inputFolder, file);
    const ext = path.extname(file).toLowerCase();
    
    // Skip videos - they need separate handling
    if (['.mov', '.mp4', '.avi'].includes(ext)) {
        console.log(`📹 Copying video: ${file}`);
        // Just copy videos to output folder
        fs.copyFileSync(inputPath, path.join(outputFolder, file));
        processed++;
        console.log(`Progress: ${processed}/${total}\n`);
        return;
    }
    
    // Process images
    if (['.jpg', '.jpeg', '.png', '.heic', '.webp'].includes(ext)) {
        try {
            const outputPath = path.join(outputFolder, file.replace(ext, '.webp'));
            
            await sharp(inputPath)
                .webp({ quality: 75 }) // Convert to WebP with 75% quality
                .resize(800, 800, { // Resize to max 800x800 (maintains aspect ratio)
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toFile(outputPath);
            
            processed++;
            console.log(`✓ Processed ${file} -> ${path.basename(outputPath)} (${processed}/${total})`);
        } catch (error) {
            console.error(`✗ Error processing ${file}:`, error.message);
            processed++;
        }
    } else {
        processed++;
        console.log(`⏭️  Skipping unknown format: ${file} (${processed}/${total})`);
    }
});

setTimeout(() => {
    console.log('\n🎉 Compression complete! Check the "images-optimized" folder.');
}, 5000);
