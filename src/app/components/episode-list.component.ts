import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpisodeService, Episode, EpisodeApiResponse } from '../services/episode.service';
import { EpisodeModalService } from '../services/episodeModal.service';
import { EpisodeModalComponent } from './episode-modal.component';

@Component({
    selector: 'app-episode-list',
    standalone: true,
    imports: [CommonModule, EpisodeModalComponent],
    template: `

    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-16 left-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-1/2 right-12 w-60 h-60 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div class="absolute bottom-24 left-1/4 w-48 h-48 bg-green-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto p-5">
        <!-- Rick and Morty styled header -->
        <div class="text-center mb-12">
          <h1 class="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 mb-4 drop-shadow-2xl tracking-wider">
            EPISODES
          </h1>
          <p class="text-xl text-gray-300 font-semibold tracking-wide">
            ADVENTURES
          </p>
          <div class="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mt-4 rounded-full"></div>
        </div>
        

        <div *ngIf="loading()" class="flex flex-col items-center justify-center py-20">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-400 mb-6 shadow-lg"></div>
            <div class="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-400 opacity-20"></div>
          </div>
          <p class="text-blue-400 text-xl font-semibold animate-pulse">Loading interdimensional episodes...</p>
        </div>


        <div *ngIf="error()" class="text-center py-20">
          <div class="bg-red-900/20 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto backdrop-blur-sm">
            <div class="text-6xl mb-4">📡</div>
            <p class="text-red-400 text-lg mb-6 font-semibold">{{ error() }}</p>
            <button 
              (click)="loadEpisodes()" 
              class="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              🔄 Reboot Signal
            </button>
          </div>
        </div>


        <div *ngIf="!loading() && hasEpisodes()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div *ngFor="let episode of episodes(); trackBy: trackEpisode" 
               (click)="openEpisodeModal(episode)"
               class="cursor-pointer group relative bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 p-6">
            
            <!-- Card glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <!-- Click indicator -->
            <div class="absolute top-7 right-4 items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span class="text-blue-400 text-xs font-semibold bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30">
                Click for details →
              </span>
            </div>
            
            <div class="relative z-10">
              <!-- Episode Badge -->
              <div class="flex items-center justify-between mb-4 ">
                <div class="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-500/30">
                  <span class="text-blue-400 font-bold text-sm tracking-wide">{{ episode.episode }}</span>
                </div>
              </div>

              <h3 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4 group-hover:from-purple-400 group-hover:to-green-400 transition-all duration-300 leading-tight">
                {{ episode.name }}
              </h3>
              
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <span class="text-blue-400 font-semibold">📅 Air Date:</span>
                  <span class="text-gray-300 font-medium">{{ episode.air_date }}</span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class="text-purple-400 font-semibold">👥 Characters:</span>
                  <span class="text-gray-300 font-medium">{{ episode.characters.length }}</span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class="text-green-400 font-semibold">🆔 Episode ID:</span>
                  <span class="text-gray-300 font-medium">#{{ episode.id }}</span>
                </div>
              </div>

              <!-- Episode Synopsis/Description placeholder -->
              <div class="mt-4 p-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/30">
                <p class="text-gray-400 text-sm italic">
                  {{ getEpisodeDescription(episode.episode) }}
                </p>
              </div>

              <!-- Decorative bottom line -->
              <div class="mt-4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div *ngIf="!loading() && hasNextPage() && hasEpisodes()" class="text-center py-12">
          <button 
            (click)="loadMoreEpisodes()" 
            class="group relative bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-400/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            [disabled]="loadingMore()">
            
            <!-- Button glow effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            
            <span class="relative z-10 text-lg tracking-wide">
              {{ loadingMore() ? '📡 Tuning Frequencies...' : '🚀 Load More Episodes' }}
            </span>
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && !hasEpisodes() && !error()" class="text-center py-20">
          <div class="text-8xl mb-6">📺</div>
          <p class="text-gray-400 text-xl">No episodes found in this timeline...</p>
        </div>
      </div>
    </div>

    <!-- Episode Modal -->
    <app-episode-modal></app-episode-modal>
  `,
})
export class EpisodeListComponent implements OnInit {
    private episodeService = inject(EpisodeService);
    private episodeModalService = inject(EpisodeModalService);

    // Signals for reactive state management
    episodes = signal<Episode[]>([]);
    loading = signal(false);
    loadingMore = signal(false);
    error = signal<string | null>(null);
    currentPage = signal(1);
    hasNextPageSignal = signal(true);

    // Computed properties for template
    hasEpisodes = computed(() => this.episodes().length > 0);
    hasNextPage = computed(() => this.hasNextPageSignal());

    ngOnInit(): void {
        this.loadEpisodes();
    }

    loadEpisodes(): void {
        this.loading.set(true);
        this.error.set(null);
        this.currentPage.set(1);

        this.episodeService.getEpisodes(1).subscribe({
            next: (response: EpisodeApiResponse) => {
                this.episodes.set(response.results);
                this.hasNextPageSignal.set(!!response.info.next);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load episodes. Please check your internet connection and try again.');
                this.loading.set(false);
                console.error('Error loading episodes:', err);
            }
        });
    }

    loadMoreEpisodes(): void {
        if (!this.hasNextPageSignal() || this.loadingMore()) return;

        this.loadingMore.set(true);
        const nextPage = this.currentPage() + 1;

        this.episodeService.getEpisodes(nextPage).subscribe({
            next: (response: EpisodeApiResponse) => {
                this.episodes.set([...this.episodes(), ...response.results]);
                this.hasNextPageSignal.set(!!response.info.next);
                this.currentPage.set(nextPage);
                this.loadingMore.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load more episodes. Please try again.');
                this.loadingMore.set(false);
                console.error('Error loading more episodes:', err);
            }
        });
    }

    openEpisodeModal(episode: Episode): void {
        this.episodeModalService.openModal(episode);
    }

    trackEpisode(index: number, episode: Episode): number {
        return episode.id;
    }

    getSeasonInfo(episodeCode: string): string {
        const match = episodeCode.match(/S(\d+)E(\d+)/);
        if (match) {
            return `Season ${match[1]}`;
        }
        return 'Unknown';
    }

    getEpisodeDescription(episodeCode: string): string {
        const descriptions: { [key: string]: string } = {
            'S01E01': 'Rick takes Morty on their first interdimensional adventure',
            'S01E02': 'Rick and Morty encounter alien parasites that create false memories',
            'S01E03': 'Rick builds an anatomy park inside a homeless man',
            'S01E04': 'Morty starts dating an alien Jessica from another dimension',
            'S01E05': 'Rick and Jerry get stuck in an interdimensional cable adventure',
            'S01E06': 'Rick makes a love potion that goes horribly wrong',
        };
        return descriptions[episodeCode] || 'Another wild adventure through the multiverse awaits...';
    }
}
