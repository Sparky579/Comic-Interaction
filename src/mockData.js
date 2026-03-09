// Mock data for AI2Comic Frontend

export const stylePresets = [
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'manga', label: 'Manga' },
  { id: 'watercolor', label: 'Watercolor' }
];

export const aspectRatios = ['1:1', '4:5', '16:9', '9:16'];

export const colorPalette = [
  '#00d4ff', '#8b5cf6', '#ff007f', '#00ffaa', '#ffaa00', '#aaaaaa'
];

export const mockPages = [
  {
    page_number: 1,
    imageUrl: 'https://placehold.co/800x1200/1a1a2e/00d4ff.png?text=Page+1+Arrival',
    description: 'A young hero arriving at a futuristic cyberpunk city. Wide shot of sprawling neon-lit cityscape with towering skyscrapers.'
  },
  {
    page_number: 2,
    imageUrl: 'https://placehold.co/800x1200/1a1a2e/8b5cf6.png?text=Page+2+The+Mentor',
    description: 'The protagonist finds a hidden alley and enters a dimly lit underground lab where she meets a mysterious mentor figure.'
  },
  {
    page_number: 3,
    imageUrl: 'https://placehold.co/800x1200/1a1a2e/ff007f.png?text=Page+3+The+Chase',
    description: 'Running through rain-soaked streets at night, chased by masked enforcers on hover-bikes. Dynamic action sequence.'
  },
  {
    page_number: 4,
    imageUrl: 'https://placehold.co/800x1200/1a1a2e/00ffaa.png?text=Page+4+The+Base',
    description: 'She activates the device, discovering a secret resistance base and meeting the team of fighters.'
  },
  {
    page_number: 5,
    imageUrl: 'https://placehold.co/800x1200/1a1a2e/ffaa00.png?text=Page+5+The+Plan',
    description: 'The team plans their mission on a holographic display, gears up, and heads through underground tunnels to the corporate tower.'
  },
  {
    page_number: 6,
    imageUrl: 'https://placehold.co/800x1200/1a1a2e/aaaaaa.png?text=Page+6+Victory',
    description: 'Epic finale: fighting security forces, confronting the antagonist, broadcasting the truth, and celebrating victory at dawn.'
  }
];

export const mockChatHistory = [
  { id: 1, sender: 'ai', text: 'Hi, there! Are you creating comics for electronic sample? You can make comics instead of reading comics, easier but similar complete.' },
  { id: 2, sender: 'user', text: 'What do you want to create comic?' },
  { id: 3, sender: 'ai', text: 'And counts uttering novilight arnpogment comics. AI minming devings comics Intarion to mawio comics, and something wroxe to them.' }
];

export const mockAiResponses = [
  "That sounds like a great idea for a new panel!",
  "I can adjust the style to be more cyberpunk if you'd like.",
  "How about we add some dramatic lighting to that scene?",
  "The aspect ratio is currently set to 16:9. Is that okay?",
  "I'm generating the next set of thumbnails now. Please wait a moment."
];
