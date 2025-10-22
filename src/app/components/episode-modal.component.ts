import { Component, OnInit, inject, signal, computed, HostListener, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EpisodeService, Episode } from "../services/episode.service";
import { EpisodeModalService } from "../services/episodeModal.service";
import { CharacterCardComponent } from "./character-card.component";
import { LocationService } from "../services/location.service";
import { Character, CharacterService } from "../services/character.service";
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-episode-modal',
    standalone: true,
    imports: [CommonModule, CharacterCardComponent],
    template: `
    <!-- Modal Backdrop with Blur Effect -->
    <div *ngIf="episodeModalService.isOpen()" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
         (click)="closeIfBackdropClick($event)">
      
      <!-- Blurred Background Overlay -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
      
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-3/4 right-1/3 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div class="absolute bottom-1/4 left-1/2 w-36 h-36 bg-green-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <!-- Modal Container -->
      <div class="relative z-10 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl rounded-3xl border border-gray-600/50 shadow-2xl shadow-blue-500/20 max-w-7xl w-full max-h-[90vh] overflow-hidden animate-modal-slide-up"
           (click)="$event.stopPropagation()">
        
        <!-- Modal Header with Gradient Border -->
        <div class="relative p-8 border-b border-gray-600/30 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent">
          
          <!-- Close Button -->
          <button 
            (click)="closeModal()"
            class="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/40 hover:to-pink-500/40 border border-red-500/30 hover:border-red-400/50 rounded-full text-red-400 hover:text-red-300 transition-all duration-300 transform hover:scale-110 hover:rotate-90 z-10"
            title="Close Modal">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <div *ngIf="selectedEpisode()" class="pr-16">
            
            <!-- Episode Badge with Glow Effect -->
            <div class="inline-flex items-center space-x-3 mb-4">
              <div class="relative bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm rounded-full px-6 py-3 border border-blue-500/50 shadow-lg shadow-blue-500/25">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur animate-pulse"></div>
                <span class="relative text-blue-300 font-black text-lg tracking-widest">{{ selectedEpisode()?.episode }}</span>
              </div>

            </div>
            
            <!-- Episode Title with Animated Gradient -->
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 via-green-400 to-blue-400 bg-size-200 animate-gradient-shift mb-4 leading-tight">
              {{ selectedEpisode()?.name }}
            </h1>
            
            <!-- Episode Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div class="flex items-center space-x-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
                <div class="text-3xl">📅</div>
                <div>
                  <div class="text-blue-400 font-bold text-sm uppercase tracking-wide">Air Date</div>
                  <div class="text-white font-semibold">{{ selectedEpisode()?.air_date }}</div>
                </div>
              </div>
              
              <div class="flex items-center space-x-3 bg-gradient-to-r from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
                <div class="text-3xl">👥</div>
                <div>
                  <div class="text-purple-400 font-bold text-sm uppercase tracking-wide">Characters</div>
                  <div class="text-white font-semibold">{{ selectedEpisode()?.characters?.length || 0 }}</div>
                </div>
              </div>
              
              <div class="flex items-center space-x-3 bg-gradient-to-r from-green-500/10 to-green-600/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
                <div class="text-3xl">🆔</div>
                <div>
                  <div class="text-green-400 font-bold text-sm uppercase tracking-wide">Episode ID</div>
                  <div class="text-white font-semibold">#{{ selectedEpisode()?.id }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal Body with Custom Scrollbar -->
        <div class="p-8 overflow-y-auto max-h-[calc(90vh-280px)] custom-scrollbar">
          
          <!-- Loading State with Pulsing Animation -->
          <div *ngIf="charactersLoading()" class="flex flex-col items-center justify-center py-20">
            <div class="relative">
              <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-400 mb-6 shadow-lg shadow-blue-400/30"></div>
              <div class="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-400 opacity-20"></div>
            </div>
            <p class="text-blue-400 text-xl font-bold animate-pulse">Loading interdimensional characters...</p>
            <div class="mt-4 flex space-x-1">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
          
          <!-- Characters Section -->
          <div *ngIf="!charactersLoading() && characters().length > 0">
            
            <!-- Characters Header with Underline Effect -->
            <div class="text-center mb-10">
              <h2 class="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-blue-400 mb-3">
                Episode Characters
              </h2>
              <div class="w-32 h-1 bg-gradient-to-r from-purple-400 via-green-400 to-blue-400 mx-auto rounded-full"></div>
              <p class="text-gray-400 text-lg mt-3 font-medium">
                Meet the {{ characters().length }} characters featured
              </p>
            </div>
            
            <!-- Characters Grid with Staggered Animation -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <app-character-card 
                *ngFor="let character of characters(); let i = index" 
                [character]="character"
                class="animate-fade-in-up transform hover:scale-105 transition-all duration-300"
                [style.animation-delay]="(i * 50) + 'ms'">
              </app-character-card>
            </div>
            
            <!-- Characters Summary Stats -->
            <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <div class="text-2xl mb-2">🧬</div>
                <div class="text-green-400 font-bold text-sm">Alive</div>
                <div class="text-white font-semibold">{{ getCharactersByStatus('Alive').length }}</div>
              </div>
              <div class="text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <div class="text-2xl mb-2">💀</div>
                <div class="text-red-400 font-bold text-sm">Dead</div>
                <div class="text-white font-semibold">{{ getCharactersByStatus('Dead').length }}</div>
              </div>
              <div class="text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <div class="text-2xl mb-2">👽</div>
                <div class="text-purple-400 font-bold text-sm">Species</div>
                <div class="text-white font-semibold">{{ getUniqueSpecies().length }}</div>
              </div>
              <div class="text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <div class="text-2xl mb-2">🌍</div>
                <div class="text-blue-400 font-bold text-sm">Origins</div>
                <div class="text-white font-semibold">{{ getUniqueOrigins().length }}</div>
              </div>
            </div>
          </div>
          
          <!-- Error State with Glitch Effect -->
          <div *ngIf="error()" class="text-center py-16">
            <div class="bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 border border-red-500/40 rounded-2xl p-8 max-w-md mx-auto backdrop-blur-sm shadow-lg shadow-red-500/20">
              <div class="text-6xl mb-6 animate-bounce">🚨</div>
              <h3 class="text-red-400 text-xl font-bold mb-4">Dimensional Interference Detected</h3>
              <p class="text-red-300 text-sm mb-6 leading-relaxed">{{ error() }}</p>
              <button 
                (click)="loadCharacters()"
                class="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/30">
                🔄 Recalibrate Portal
              </button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div *ngIf="!charactersLoading() && characters().length === 0 && !error()" class="text-center py-16">
            <div class="text-8xl mb-6">👻</div>
            <p class="text-gray-400 text-xl">No characters found in this dimension...</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes modal-slide-up {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(40px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
    
    .animate-modal-slide-up {
      animation: modal-slide-up 0.4s ease-out;
    }
    
    .animate-fade-in-up {
      animation: fade-in-up 0.6s ease-out;
    }
    
    .animate-gradient-shift {
      animation: gradient-shift 3s ease infinite;
    }
    
    .bg-size-200 {
      background-size: 200% 200%;
    }
    
    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(55, 65, 81, 0.3);
      border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #60a5fa, #a855f7);
      border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #3b82f6, #8b5cf6);
    }
  `]
})
export class EpisodeModalComponent implements OnInit {

    episodeModalService = inject(EpisodeModalService);
    episodeService = inject(EpisodeService);
    locationService = inject(LocationService);
    private characterService = inject(CharacterService);
    characters = signal<Character[]>([]);
    charactersLoading = signal(false);
    error = signal<string | null>(null);

    selectedEpisode = computed(() => this.episodeModalService.episodeData()?.episode || null);
    locations = computed(() => this.episodeModalService.episodeData()?.locations || []);

    constructor() {
        effect(() => {
            const episode = this.selectedEpisode();
            if (episode) {
                console.log('Episode changed, loading characters for:', episode.name);
                this.loadCharacters();
            }
        });
    }

    @HostListener('document:keydown', ['$event'])
    onEscapePress(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.episodeModalService.closeModal();
        }
    }
    
    ngOnInit(): void {

    }
    
    loadCharacters(): void {
        const episode = this.selectedEpisode();
        if (!episode) return;

        this.charactersLoading.set(true);
        this.error.set(null);
        
        const characterIds = episode.characters.map(url => {
            const id = url.split('/').pop();
            return +id!;
        });

        const characterRequests = characterIds.map(id => 
            this.characterService.getCharacter(id)
        );
        console.log('Fetching characters with IDs:', characterIds);
        forkJoin(characterRequests).subscribe({
            next: (characters) => {
                this.characters.set(characters);
                this.charactersLoading.set(false);
                console.log('Loaded characters for episode:', characters);
            },
            error: (err) => {
                this.error.set('Failed to load interdimensional characters');
                this.charactersLoading.set(false);
                console.error('Error loading characters:', err);
            }
        });
    }

    closeModal(): void {
        this.episodeModalService.closeModal();
        this.characters.set([]);
        this.error.set(null);
    }

    closeIfBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this.closeModal();
        }
    }
    getSeasonInfo(episode: string): string {
        if (!episode) return '';
        const match = episode.match(/S(\d+)/);
        return match ? `Season ${parseInt(match[1])}` : '';
    }

    getCharactersByStatus(status: string): Character[] {
        return this.characters().filter(char => char.status === status);
    }

    getUniqueSpecies(): string[] {
        const species = this.characters().map(char => char.species);
        return [...new Set(species)];
    }

    getUniqueOrigins(): string[] {
        const origins = this.characters().map(char => char.origin.name);
        return [...new Set(origins)].filter(origin => origin !== 'unknown');
    }
}