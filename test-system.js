#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Bulk Feedback Generator System...\n');

// Test 1: Check if all required files exist
console.log('📁 Checking file structure...');
const requiredFiles = [
    'package.json',
    'src/index.js',
    'src/core/FeedbackProcessor.js',
    'src/core/FileUploadHandler.js',
    'src/core/ReportGenerator.js',
    'src/core/analyzers/AssignmentAnalyzer.js',
    'src/core/analyzers/EvaluationDimensions.js',
    'public/index.html',
    'src/templates/html/report.ejs'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing!');
    process.exit(1);
}

// Test 2: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
    'express', 'multer', 'cors', 'helmet', 'mammoth', 'pdf-parse',
    'natural', 'compromise', 'sentiment', 'ejs', 'uuid', 'fs-extra'
];

let allDepsExist = true;
requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}`);
    } else {
        console.log(`❌ ${dep} - MISSING`);
        allDepsExist = false;
    }
});

if (!allDepsExist) {
    console.log('\n❌ Some required dependencies are missing!');
    process.exit(1);
}

// Test 3: Check example files
console.log('\n📄 Checking example files...');
const exampleFiles = [
    'examples/sample-essay.txt',
    'examples/sample-worksheet.txt'
];

exampleFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        console.log(`✅ ${file} (${content.length} characters)`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

// Test 4: Check if node_modules exists
console.log('\n🔍 Checking installation...');
if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules directory exists');
} else {
    console.log('❌ node_modules directory missing - run "npm install"');
}

console.log('\n🎉 System check complete!');
console.log('\n📋 Next steps:');
console.log('1. Run "npm install" to install dependencies');
console.log('2. Run "npm start" to start the server');
console.log('3. Open http://localhost:3000 in your browser');
console.log('4. Upload the sample files from the examples/ directory');
console.log('\n🚀 Ready to generate feedback reports!');

