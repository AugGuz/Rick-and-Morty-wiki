import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService, Character, ApiResponse } from '../services/character.service';
import { CharacterCardComponent } from './character-card.component';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent],
  template: `
    <!-- Dark Rick and Morty themed background -->
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      
      <!-- Animated background elements -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-1/2 right-20 w-48 h-48 bg-blue-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto p-5">
        <!-- Rick and Morty styled header -->
        <div class="text-center mb-12">
          <h1 class="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mb-4 drop-shadow-2xl tracking-wider">
            RICK & MORTY WIKI
          </h1>
          <p class="text-xl text-gray-300 font-semibold tracking-wide">
            CHARACTERS
          </p>
          <div class="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <!-- Loading State -->
        <div *ngIf="loading()" class="flex flex-col items-center justify-center py-20">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-green-400 mb-6 shadow-lg"></div>
            <div class="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-green-400 opacity-20"></div>
          </div>
          <p class="text-green-400 text-xl font-semibold animate-pulse">Loading characters from the multiverse...</p>
        </div>

        <!-- Characters Grid -->
        <div *ngIf="!loading() && hasCharacters()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          <app-character-card 
            *ngFor="let character of characters(); trackBy: trackCharacter" 
            [character]="character"
            class="transform hover:scale-105 transition-all duration-300">
          </app-character-card>
        </div>

        <!-- Load More Button -->
        <div *ngIf="!loading() && hasNextPage() && hasCharacters()" class="text-center py-12">
          <button 
            (click)="loadMoreCharacters()" 
            class="group relative bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-400/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            [disabled]="loadingMore()">
            
            <!-- Button glow effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            
            <span class="relative z-10 text-lg tracking-wide">
              {{ loadingMore() ? '🌀 Loading Multiverse...' : '🚀 Load More Characters' }}
            </span>
          </button>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="text-center py-20">
          <div class="bg-red-900/20 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto backdrop-blur-sm">
            <div class="text-6xl mb-4">⚠️</div>
            <p class="text-red-400 text-lg mb-6 font-semibold">{{ error() }}</p>
            <button 
              (click)="loadCharacters()" 
              class="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              🔄 Try Again
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && !hasCharacters() && !error()" class="text-center py-20">
          <div class="text-8xl mb-6">👽</div>
          <p class="text-gray-400 text-xl">No characters found in this dimension...</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CharacterListComponent implements OnInit {
  // Signals for reactive state management
  characters = signal<Character[]>([]);
  loading = signal(false);
  loadingMore = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  hasNextPageSignal = signal(true);
  
  private characterService = inject(CharacterService);

  // Computed properties for template
  hasCharacters = computed(() => this.characters().length > 0);
  hasNextPage = computed(() => this.hasNextPageSignal());

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.loading.set(true);
    this.error.set(null);
    this.currentPage.set(1);

    this.characterService.getCharacters(1).subscribe({
      next: (response: ApiResponse) => {
        this.characters.set(response.results);
        this.hasNextPageSignal.set(!!response.info.next);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load characters. Please check your internet connection and try again.');
        this.loading.set(false);
        console.error('Error loading characters:', err);
      }
    });
  }

  loadMoreCharacters(): void {
    if (!this.hasNextPageSignal() || this.loadingMore()) return;

    this.loadingMore.set(true);
    const nextPage = this.currentPage() + 1;

    this.characterService.getCharacters(nextPage).subscribe({
      next: (response: ApiResponse) => {
        this.characters.set([...this.characters(), ...response.results]);
        this.hasNextPageSignal.set(!!response.info.next);
        this.currentPage.set(nextPage);
        this.loadingMore.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load more characters. Please try again.');
        this.loadingMore.set(false);
        console.error('Error loading more characters:', err);
      }
    });
  }

  trackCharacter(index: number, character: Character): number {
    return character.id;
  }
}
