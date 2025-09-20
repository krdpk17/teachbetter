// Test setup and utilities
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create test directories
const testDirs = [
  'tests/fixtures',
  'tests/temp',
  'tests/output'
];

testDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Test utilities
export const createTestFile = async (filename, content) => {
  const filePath = path.join(__dirname, 'fixtures', filename);
  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
};

export const cleanupTestFiles = async () => {
  const tempDir = path.join(__dirname, 'temp');
  const outputDir = path.join(__dirname, 'output');
  
  if (fs.existsSync(tempDir)) {
    await fs.remove(tempDir);
  }
  if (fs.existsSync(outputDir)) {
    await fs.remove(outputDir);
  }
};

export const getTestFilePath = (filename) => {
  return path.join(__dirname, 'fixtures', filename);
};

// Sample test data
export const sampleEssay = `The Impact of Technology on Modern Education

Technology has revolutionized the way we approach education in the 21st century. From interactive whiteboards to online learning platforms, digital tools have transformed traditional classrooms into dynamic learning environments. This essay explores the positive and negative impacts of technology on education, examining how it affects both students and teachers.

One of the most significant benefits of technology in education is increased accessibility. Students can now access educational resources from anywhere in the world through online platforms. This has made education more inclusive, allowing people in remote areas or with physical disabilities to participate in learning. For example, video conferencing tools enable students to attend classes virtually, breaking down geographical barriers.

Furthermore, technology has enhanced the learning experience through interactive and engaging content. Educational software and applications provide multimedia presentations, simulations, and gamified learning experiences that cater to different learning styles. Research shows that students learn better when they can interact with content rather than just reading static text.

However, technology also presents challenges in education. One major concern is the digital divide, where students from low-income families may not have access to necessary devices or internet connectivity. This creates inequality in educational opportunities. Additionally, excessive screen time can lead to health issues such as eye strain and reduced physical activity.

Another challenge is the potential for distraction. With smartphones and tablets in classrooms, students may be tempted to use these devices for non-educational purposes during class time. Teachers must find ways to manage this while still leveraging the benefits of technology.

In conclusion, technology has both positive and negative impacts on modern education. While it increases accessibility and enhances learning experiences, it also creates challenges related to inequality and distraction. The key is to find a balanced approach that maximizes the benefits while minimizing the drawbacks. Educators must continue to adapt their teaching methods to effectively integrate technology into the learning process.`;

export const sampleWorksheet = `Science Worksheet: Photosynthesis

1. What is photosynthesis?
Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. This process occurs in the chloroplasts of plant cells and is essential for life on Earth.

2. Write the chemical equation for photosynthesis.
6CO2 + 6H2O + light energy → C6H12O6 + 6O2

3. What are the two main stages of photosynthesis?
The two main stages are the light-dependent reactions and the light-independent reactions (Calvin cycle). The light-dependent reactions occur in the thylakoids and convert light energy into chemical energy, while the Calvin cycle occurs in the stroma and uses this energy to produce glucose.

4. Why is photosynthesis important for life on Earth?
Photosynthesis is crucial because it produces oxygen that most living organisms need to breathe. It also removes carbon dioxide from the atmosphere, helping to regulate Earth's climate. Additionally, photosynthesis is the foundation of most food chains, as plants are primary producers.

5. What factors can affect the rate of photosynthesis?
Several factors can affect photosynthesis rate: light intensity (more light generally increases the rate up to a point), carbon dioxide concentration (higher CO2 levels can increase the rate), temperature (optimal temperature range exists), and water availability (water is a reactant in the process).

6. Explain the role of chlorophyll in photosynthesis.
Chlorophyll is the green pigment found in chloroplasts that captures light energy from the sun. It absorbs light primarily in the red and blue wavelengths and reflects green light, which is why plants appear green. The captured light energy is used to power the light-dependent reactions of photosynthesis.`;
