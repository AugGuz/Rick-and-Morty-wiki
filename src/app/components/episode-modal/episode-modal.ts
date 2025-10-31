import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CharacterService, Character } from '../../services/character.service';
import { EpisodeService } from '../../services/episode.service';
import { EpisodeModalService } from '../../services/episodeModal.service';
import { LocationService } from '../../services/location.service';
import { CharacterCard } from '../character-card/character-card';

@Component({
  selector: 'app-episode-modal',
  imports: [CommonModule, CharacterCard],
  templateUrl: './episode-modal.html',
  styleUrl: './episode-modal.css'
})
export class EpisodeModal {

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
