import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { EpisodeModal } from '../episode-modal/episode-modal';
import { Episode, EpisodeApiResponse, EpisodeService } from '../../services/episode.service';
import { EpisodeModalService } from '../../services/episodeModal.service';

@Component({
  selector: 'app-episode-list',
  imports: [CommonModule, EpisodeModal],
  templateUrl: './episode-list.html',
  styleUrl: './episode-list.css'
})
export class EpisodeList implements OnInit {
    private episodeService = inject(EpisodeService);
    private episodeModalService = inject(EpisodeModalService);

    episodes = signal<Episode[]>([]);
    loading = signal(false);
    loadingMore = signal(false);
    error = signal<string | null>(null);
    currentPage = signal(1);
    hasNextPageSignal = signal(true);

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
