
import { CharacterService, ApiResponse, Character } from '../../services/character.service';
import { signal,Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCard } from '../character-card/character-card';
import { CharacterModalComponent } from '../character-modal/character-modal';

@Component({
  selector: 'app-character-list',
  imports: [CommonModule, CharacterCard, CharacterModalComponent],
  templateUrl: './character-list.html',
  styleUrl: './character-list.css'
})
export class CharacterList {
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
