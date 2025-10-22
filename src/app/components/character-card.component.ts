import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character } from '../services/character.service';

@Component({
    selector: 'app-character-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="group relative bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 overflow-hidden">
      
      <!-- Card glow effect -->
      <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div class="relative z-10">
        <!-- Character Image -->
        <div class="relative overflow-hidden">
          <img [src]="character.image" [alt]="character.name" 
               class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110">
          
          <!-- Status overlay -->
          <div class="absolute top-3 right-3 flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <span class="w-2 h-2 rounded-full" [ngClass]="{
              'bg-green-400 shadow-green-400/50 shadow-lg': character.status === 'Alive',
              'bg-red-400 shadow-red-400/50 shadow-lg': character.status === 'Dead', 
              'bg-gray-400 shadow-gray-400/50 shadow-lg': character.status === 'unknown'
            }"></span>
            <span class="text-xs font-semibold text-white">{{ character.status }}</span>
          </div>
        </div>

        <!-- Character Info -->
        <div class="p-6">
          <h3 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-4 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
            {{ character.name }}
          </h3>
          
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <span class="text-green-400 font-semibold">🧬 Species:</span>
              <span class="text-gray-300 font-medium">{{ character.species }}</span>
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="text-blue-400 font-semibold">⚧ Gender:</span>
              <span class="text-gray-300 font-medium">{{ character.gender }}</span>
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="text-purple-400 font-semibold">🌍 Origin:</span>
              <span class="text-gray-300 font-medium">{{ character.origin.name }}</span>
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="text-yellow-400 font-semibold">📺 Episodes:</span>
              <span class="text-gray-300 font-medium">{{ character.episode.length }}</span>
            </div>
          </div>

          <!-- Decorative bottom line -->
          <div class="mt-4 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class CharacterCardComponent {
  @Input() character!: Character;
}