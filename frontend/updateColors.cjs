const fs = require('fs');
const path = require('path');

const dir = './src';

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    file = path.join(directory, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Backgrounds: 
  // #0f0f0f (Dark bg) -> brand-3 (DFDCDE)
  content = content.replace(/bg-\[\#0f0f0f\]/g, 'bg-brand-3');
  // #1a1a1a (Cards) -> brand-1 (C0C4D1)
  content = content.replace(/bg-\[\#1a1a1a\]/g, 'bg-brand-1 shadow-sm');
  // #111111 (Sidebar) -> brand-1
  content = content.replace(/bg-\[\#111111\]/g, 'bg-brand-1');
  // #242424 (Inputs, Elevated) -> white/60
  content = content.replace(/bg-\[\#242424\]/g, 'bg-white/60');
  
  // Borders
  content = content.replace(/border-white\/10/g, 'border-brand-2/40');
  content = content.replace(/border-white\/8/g, 'border-brand-2/30');
  content = content.replace(/border-white\/5/g, 'border-brand-2/20');
  content = content.replace(/border-white\/20/g, 'border-brand-2/60');
  
  // Text
  content = content.replace(/text-white/g, 'text-gray-900');
  content = content.replace(/text-neutral-200/g, 'text-gray-800');
  content = content.replace(/text-[#f5f5f5]/g, 'text-gray-900');
  content = content.replace(/text-neutral-400/g, 'text-gray-700');
  content = content.replace(/text-neutral-500/g, 'text-gray-600');
  
  // Hover & interactions
  content = content.replace(/hover:text-white/g, 'hover:text-gray-900');
  content = content.replace(/hover:bg-white\/5/g, 'hover:bg-brand-2/20');
  
  // Primary Buttons & Icons: #6366f1 -> brand-4 (9FC5E4)
  content = content.replace(/text-indigo-400/g, 'text-blue-600'); // Some icons need darker blue for contrast
  content = content.replace(/text-indigo-500/g, 'text-blue-700');
  content = content.replace(/text-indigo-600/g, 'text-blue-800');
  
  // Special buttons cases (bg-indigo-600) -> brand-4 with dark text
  content = content.replace(/bg-indigo-600/g, 'bg-brand-4 text-gray-900'); 
  content = content.replace(/hover:bg-indigo-500/g, 'hover:bg-brand-4/80');
  
  // Badges & subtle bg
  content = content.replace(/bg-indigo-500\/10/g, 'bg-brand-4/40');
  content = content.replace(/border-indigo-500/g, 'border-brand-4');
  content = content.replace(/ring-indigo-500/g, 'ring-brand-4');
  
  // Modals overlay
  content = content.replace(/bg-black\/60/g, 'bg-black/30 backdrop-blur-sm');

  // Input placeholder
  content = content.replace(/placeholder:text-neutral-500/g, 'placeholder:text-gray-500');

  // If text became "text-gray-900 text-gray-900" due to replace
  content = content.replace(/text-gray-900 text-gray-900/g, 'text-gray-900');

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Theme updated successfully.');
